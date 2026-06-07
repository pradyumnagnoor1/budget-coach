from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Account


def upsert_from_plaid(
    db: Session,
    *,
    user_id: UUID,
    plaid_item_id: UUID,
    plaid_account: dict[str, Any],
) -> Account:
    """Insert or update an account row from Plaid's /accounts/get response."""
    plaid_account_id = plaid_account["account_id"]
    existing = db.execute(
        select(Account).where(Account.plaid_account_id == plaid_account_id)
    ).scalar_one_or_none()

    balances = plaid_account.get("balances") or {}
    fields = dict(
        user_id=user_id,
        plaid_item_id=plaid_item_id,
        plaid_account_id=plaid_account_id,
        name=plaid_account.get("name") or "Account",
        official_name=plaid_account.get("official_name"),
        mask=plaid_account.get("mask"),
        type=str(plaid_account.get("type") or "depository"),
        subtype=str(plaid_account["subtype"]) if plaid_account.get("subtype") else None,
        current_balance=_decimal(balances.get("current")),
        available_balance=_decimal(balances.get("available")),
        currency=balances.get("iso_currency_code") or "USD",
    )

    if existing is None:
        account = Account(**fields)
        db.add(account)
    else:
        account = existing
        for k, v in fields.items():
            setattr(account, k, v)

    db.commit()
    db.refresh(account)
    return account


def get_by_plaid_account_id(db: Session, plaid_account_id: str) -> Account | None:
    return db.execute(
        select(Account).where(Account.plaid_account_id == plaid_account_id)
    ).scalar_one_or_none()


def _decimal(v: Any) -> Decimal | None:
    if v is None:
        return None
    return Decimal(str(v))
