from datetime import date as date_cls
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.db.repositories import accounts as accounts_repo


def upsert_from_plaid(
    db: Session,
    *,
    user_id: UUID,
    plaid_transaction: dict[str, Any],
) -> Transaction | None:
    """Insert or update a transaction row from Plaid's transactions/sync output.

    Returns None if the related account is unknown (skipped — caller decides
    whether to log it). We don't auto-create accounts here; sync the accounts
    first via accounts_repo.upsert_from_plaid.
    """
    plaid_tx_id = plaid_transaction["transaction_id"]
    plaid_account_id = plaid_transaction["account_id"]

    account = accounts_repo.get_by_plaid_account_id(db, plaid_account_id)
    if account is None:
        return None

    fields = dict(
        account_id=account.id,
        user_id=user_id,
        plaid_transaction_id=plaid_tx_id,
        amount=Decimal(str(plaid_transaction["amount"])),
        date=_to_date(plaid_transaction["date"]),
        authorized_date=_to_date(plaid_transaction.get("authorized_date")),
        name=plaid_transaction.get("name") or plaid_transaction.get("merchant_name") or "",
        merchant_name=plaid_transaction.get("merchant_name"),
        pending=bool(plaid_transaction.get("pending")),
        currency=plaid_transaction.get("iso_currency_code") or "USD",
        plaid_category=_join_category(plaid_transaction.get("category")),
        categorized_by="plaid",
    )

    existing = db.execute(
        select(Transaction).where(Transaction.plaid_transaction_id == plaid_tx_id)
    ).scalar_one_or_none()

    if existing is None:
        tx = Transaction(**fields)
        db.add(tx)
    else:
        tx = existing
        for k, v in fields.items():
            setattr(tx, k, v)

    db.commit()
    db.refresh(tx)
    return tx


def remove_by_plaid_id(db: Session, plaid_transaction_id: str) -> bool:
    """Mark-as-removed: actually delete the row. Returns True if a row was removed."""
    tx = db.execute(
        select(Transaction).where(Transaction.plaid_transaction_id == plaid_transaction_id)
    ).scalar_one_or_none()
    if tx is None:
        return False
    db.delete(tx)
    db.commit()
    return True


def count_for_user(db: Session, user_id: UUID) -> int:
    from sqlalchemy import func

    return (
        db.execute(
            select(func.count(Transaction.id)).where(Transaction.user_id == user_id)
        ).scalar_one()
    )


def _to_date(v: Any) -> date_cls | None:
    if v is None:
        return None
    if isinstance(v, date_cls):
        return v
    return date_cls.fromisoformat(str(v))


def _join_category(cat: Any) -> str | None:
    """Plaid returns a category list like ['Food and Drink', 'Restaurants']."""
    if not cat:
        return None
    if isinstance(cat, list):
        return " > ".join(str(x) for x in cat)
    return str(cat)
