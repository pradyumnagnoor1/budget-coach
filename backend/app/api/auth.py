"""Cognito OAuth flow with Google as the identity provider.

Flow:
1. GET /auth/login  → set short-lived state cookie, redirect to Cognito hosted UI
2. GET /auth/callback?code=...&state=...  → exchange code for tokens, verify id_token,
   upsert user, set session cookie, redirect to frontend
3. GET /auth/me     → return the current user
4. POST /auth/logout → clear session cookie, redirect to Cognito logout

The session cookie holds the Cognito id_token directly. We verify it on every
request via JWKS. id_tokens expire in 1h by default; we re-login on expiry
(refresh tokens can be added later if it becomes painful).
"""

from __future__ import annotations

import base64
import hashlib
import secrets
from typing import Annotated
from urllib.parse import urlencode

import httpx
import structlog
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from itsdangerous import BadSignature, TimestampSigner
from sqlalchemy.orm import Session

from app.api.deps import SESSION_COOKIE_NAME, CurrentUser
from app.core.config import settings
from app.core.security import TokenError, verify_cognito_id_token
from app.db.repositories import users as users_repo
from app.db.session import get_db

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])

STATE_COOKIE_NAME = "bc_oauth_state"
STATE_COOKIE_MAX_AGE = 600  # 10 minutes

_signer = TimestampSigner(settings.auth_state_secret)


def _pkce_pair() -> tuple[str, str]:
    """Return (code_verifier, code_challenge) for PKCE."""
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return verifier, challenge


def _require_cognito_configured() -> None:
    missing = [
        name
        for name, val in (
            ("COGNITO_USER_POOL_ID", settings.cognito_user_pool_id),
            ("COGNITO_APP_CLIENT_ID", settings.cognito_app_client_id),
            ("COGNITO_DOMAIN", settings.cognito_domain),
        )
        if not val
    ]
    if missing:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            f"Cognito not configured. Missing: {', '.join(missing)}",
        )


@router.get("/login")
async def login() -> Response:
    """Redirect to the Cognito hosted UI with Google preselected."""
    _require_cognito_configured()

    state = secrets.token_urlsafe(24)
    verifier, challenge = _pkce_pair()

    # Sign a compact payload that survives the round trip.
    signed = _signer.sign(f"{state}|{verifier}".encode()).decode()

    params = {
        "client_id": settings.cognito_app_client_id,
        "response_type": "code",
        "scope": "openid email profile",
        "redirect_uri": settings.auth_redirect_uri,
        "state": state,
        "identity_provider": "Google",
        "code_challenge": challenge,
        "code_challenge_method": "S256",
    }
    target = f"{settings.cognito_hosted_ui_url}/oauth2/authorize?{urlencode(params)}"

    resp = RedirectResponse(target, status_code=status.HTTP_302_FOUND)
    resp.set_cookie(
        key=STATE_COOKIE_NAME,
        value=signed,
        max_age=STATE_COOKIE_MAX_AGE,
        httponly=True,
        secure=settings.environment != "development",
        samesite="lax",
        path="/",
    )
    return resp


@router.get("/callback")
async def callback(
    code: str,
    state: str,
    db: Annotated[Session, Depends(get_db)],
    bc_oauth_state: Annotated[str | None, Cookie(alias=STATE_COOKIE_NAME)] = None,
) -> Response:
    """Exchange the code for tokens, upsert the user, set session cookie."""
    _require_cognito_configured()

    if not bc_oauth_state:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "missing oauth state cookie")
    try:
        payload = _signer.unsign(bc_oauth_state, max_age=STATE_COOKIE_MAX_AGE).decode()
        expected_state, verifier = payload.split("|", 1)
    except (BadSignature, ValueError) as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "invalid oauth state") from e

    if not secrets.compare_digest(state, expected_state):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "state mismatch")

    # Exchange the code for tokens.
    token_url = f"{settings.cognito_hosted_ui_url}/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": settings.cognito_app_client_id,
        "code": code,
        "redirect_uri": settings.auth_redirect_uri,
        "code_verifier": verifier,
    }
    auth = None
    if settings.cognito_app_client_secret:
        auth = (settings.cognito_app_client_id, settings.cognito_app_client_secret)

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_resp = await client.post(
            token_url,
            data=data,
            auth=auth,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
    if token_resp.status_code != 200:
        logger.error(
            "cognito_token_exchange_failed",
            status=token_resp.status_code,
            body=token_resp.text,
        )
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            f"cognito token exchange failed: {token_resp.text}",
        )
    tokens = token_resp.json()
    id_token = tokens.get("id_token")
    if not id_token:
        logger.error("no_id_token_in_response", tokens=tokens)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "no id_token in response")

    try:
        claims = await verify_cognito_id_token(id_token)
    except TokenError as e:
        logger.error(
            "id_token_verification_failed",
            error=str(e),
            expected_audience=settings.cognito_app_client_id,
            expected_issuer=settings.cognito_issuer,
        )
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"id_token invalid: {e}") from e

    users_repo.upsert_from_claims(db, claims)

    resp = RedirectResponse(f"{settings.frontend_url}/dashboard", status_code=status.HTTP_302_FOUND)
    # id_tokens are short-lived; mirror with the cookie.
    max_age = int(claims.get("exp", 0) - claims.get("iat", 0)) or 3600
    resp.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=id_token,
        max_age=max_age,
        httponly=True,
        secure=settings.environment != "development",
        samesite="lax",
        path="/",
    )
    resp.delete_cookie(STATE_COOKIE_NAME, path="/")
    return resp


@router.get("/me")
async def me(user: CurrentUser) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "cognito_sub": user.cognito_sub,
    }


@router.post("/logout")
async def logout(request: Request) -> Response:
    """Clear our session and bounce through Cognito's logout endpoint."""
    params = {
        "client_id": settings.cognito_app_client_id,
        "logout_uri": settings.frontend_url,
    }
    target = (
        f"{settings.cognito_hosted_ui_url}/logout?{urlencode(params)}"
        if settings.cognito_domain
        else settings.frontend_url
    )
    resp = RedirectResponse(target, status_code=status.HTTP_302_FOUND)
    resp.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return resp
