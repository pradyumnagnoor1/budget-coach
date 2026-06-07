from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.encryption import encrypt
from app.db.models import PlaidItem


def create(
    db: Session,
    *,
    user_id: UUID,
    plaid_item_id: str,
    access_token: str,
    institution_id: str | None,
    institution_name: str | None,
) -> PlaidItem:
    item = PlaidItem(
        user_id=user_id,
        plaid_item_id=plaid_item_id,
        access_token_encrypted=encrypt(access_token),
        institution_id=institution_id,
        institution_name=institution_name,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def get_by_plaid_item_id(db: Session, plaid_item_id: str) -> PlaidItem | None:
    return db.execute(
        select(PlaidItem).where(PlaidItem.plaid_item_id == plaid_item_id)
    ).scalar_one_or_none()


def list_for_user(db: Session, user_id: UUID) -> list[PlaidItem]:
    return list(
        db.execute(
            select(PlaidItem).where(PlaidItem.user_id == user_id)
        ).scalars()
    )


def update_after_sync(
    db: Session, item: PlaidItem, *, next_cursor: str
) -> PlaidItem:
    item.plaid_cursor = next_cursor
    item.last_synced_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item
