"""Cognito JWT verification.

The id_token from Cognito is signed with one of the keys advertised at
{issuer}/.well-known/jwks.json. We fetch and cache the JWKS once, then verify
each request's token signature, issuer, audience, and expiry.
"""

from __future__ import annotations

import time
from typing import Any

import httpx
import structlog
from jose import jwt
from jose.exceptions import JWTError

from app.core.config import settings

logger = structlog.get_logger()

# Refresh JWKS at most this often (Cognito rotates rarely).
_JWKS_TTL_SECONDS = 60 * 60
_jwks_cache: dict[str, Any] | None = None
_jwks_fetched_at: float = 0.0


class TokenError(Exception):
    """Raised when an incoming token cannot be validated."""


async def _get_jwks() -> dict[str, Any]:
    global _jwks_cache, _jwks_fetched_at
    if _jwks_cache is not None and (time.time() - _jwks_fetched_at) < _JWKS_TTL_SECONDS:
        return _jwks_cache

    if not settings.cognito_user_pool_id:
        raise TokenError("Cognito user pool not configured")

    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(settings.cognito_jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = time.time()
        logger.info("jwks_loaded", url=settings.cognito_jwks_url)
        return _jwks_cache


async def verify_cognito_id_token(token: str) -> dict[str, Any]:
    """Verify a Cognito-issued id_token and return its claims."""
    try:
        headers = jwt.get_unverified_header(token)
    except JWTError as e:
        raise TokenError(f"malformed token: {e}") from e

    kid = headers.get("kid")
    if not kid:
        raise TokenError("token missing kid")

    jwks = await _get_jwks()
    key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
    if key is None:
        # Force a refresh on next call in case Cognito rotated.
        global _jwks_cache
        _jwks_cache = None
        raise TokenError("no matching JWKS key")

    try:
        claims = jwt.decode(
            token,
            key,
            algorithms=[key.get("alg", "RS256")],
            audience=settings.cognito_app_client_id,
            issuer=settings.cognito_issuer,
            # at_hash binds an id_token to its access_token. We only verify the
            # id_token (the access_token isn't part of our session), so skip it.
            options={"verify_at_hash": False},
        )
    except JWTError as e:
        raise TokenError(f"invalid token: {e}") from e

    if claims.get("token_use") != "id":
        raise TokenError("not an id_token")

    return claims
