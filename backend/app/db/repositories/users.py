from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import User


def get_by_cognito_sub(db: Session, cognito_sub: str) -> User | None:
    return db.execute(select(User).where(User.cognito_sub == cognito_sub)).scalar_one_or_none()


def upsert_from_claims(db: Session, claims: dict) -> User:
    """Create or update a user from a verified Cognito id_token's claims."""
    sub = claims["sub"]
    email = claims.get("email", "")
    name = claims.get("name") or claims.get("given_name") or email

    user = get_by_cognito_sub(db, sub)
    if user is None:
        user = User(cognito_sub=sub, email=email, name=name)
        db.add(user)
    else:
        # Keep email / name fresh in case the user changed them at the IdP.
        if email and user.email != email:
            user.email = email
        if name and user.name != name:
            user.name = name

    db.commit()
    db.refresh(user)
    return user
