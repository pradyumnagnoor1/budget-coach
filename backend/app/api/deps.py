"""FastAPI dependencies shared across routers."""

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import TokenError, verify_cognito_id_token
from app.db.models import User
from app.db.repositories import users as users_repo
from app.db.session import get_db

SESSION_COOKIE_NAME = "bc_session"


async def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    bc_session: Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)] = None,
) -> User:
    if not bc_session:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "not authenticated")
    try:
        claims = await verify_cognito_id_token(bc_session)
    except TokenError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"invalid session: {e}") from e
    user = users_repo.get_by_cognito_sub(db, claims["sub"])
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "user not provisioned")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
