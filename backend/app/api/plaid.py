"""Plaid Link + transaction sync.

Three endpoints, all authenticated:

POST /api/plaid/link-token
  Creates a one-shot link_token. Frontend feeds it to react-plaid-link to open
  the Plaid Link modal.

POST /api/plaid/exchange  { public_token: "..." }
  Called by the frontend in Plaid Link's onSuccess callback. Trades the
  public_token for a permanent access_token, encrypts it, persists the
  PlaidItem, syncs accounts, and triggers a first transaction sync. Returns
  the freshly-synced counts.

POST /api/plaid/sync  { plaid_item_id?: "..." }
  Runs the cursor-based transactions/sync against all of the user's items
  (or a specific one). Idempotent — safe to call from a cron or on demand.
"""

from __future__ import annotations

from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser
from app.core.encryption import decrypt
from app.db.models import PlaidItem
from app.db.repositories import accounts as accounts_repo
from app.db.repositories import plaid_items as plaid_items_repo
from app.db.repositories import transactions as transactions_repo
from app.db.session import get_db
from app.services import plaid_service

logger = structlog.get_logger()
router = APIRouter(prefix="/api/plaid", tags=["plaid"])


# ---------- request / response schemas ----------


class LinkTokenResponse(BaseModel):
    link_token: str


class ExchangeRequest(BaseModel):
    public_token: str = Field(..., min_length=1)


class SyncResult(BaseModel):
    plaid_item_id: str
    institution_name: str | None
    accounts_synced: int
    transactions_added: int
    transactions_modified: int
    transactions_removed: int


class ExchangeResponse(BaseModel):
    plaid_item_id: str
    institution_name: str | None
    accounts_synced: int
    transactions_added: int


class SyncResponse(BaseModel):
    items: list[SyncResult]


# ---------- routes ----------


@router.post("/link-token", response_model=LinkTokenResponse)
async def link_token(user: CurrentUser) -> LinkTokenResponse:
    token = plaid_service.create_link_token(str(user.id))
    return LinkTokenResponse(link_token=token)


@router.post("/exchange", response_model=ExchangeResponse)
async def exchange(
    body: ExchangeRequest,
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> ExchangeResponse:
    # 1) public_token -> access_token + item_id
    try:
        access_token, _plaid_item_id = plaid_service.exchange_public_token(body.public_token)
    except Exception as e:
        logger.exception("plaid_exchange_failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"plaid exchange failed: {e}") from e

    # 2) institution metadata for display
    meta = plaid_service.get_item_metadata(access_token)

    # 3) persist (encrypted)
    plaid_item = plaid_items_repo.create(
        db,
        user_id=user.id,
        plaid_item_id=meta.item_id,
        access_token=access_token,
        institution_id=meta.institution_id,
        institution_name=meta.institution_name,
    )

    # 4) initial sync (accounts then transactions)
    accounts_synced, tx_counts = _sync_one(db, plaid_item)

    logger.info(
        "plaid_item_connected",
        user_id=str(user.id),
        plaid_item_id=meta.item_id,
        institution=meta.institution_name,
        accounts=accounts_synced,
        transactions=tx_counts.added,
    )

    return ExchangeResponse(
        plaid_item_id=meta.item_id,
        institution_name=meta.institution_name,
        accounts_synced=accounts_synced,
        transactions_added=tx_counts.added,
    )


@router.post("/sync", response_model=SyncResponse)
async def sync(
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
) -> SyncResponse:
    items = plaid_items_repo.list_for_user(db, user.id)
    results: list[SyncResult] = []
    for item in items:
        accounts_synced, tx_counts = _sync_one(db, item)
        results.append(
            SyncResult(
                plaid_item_id=item.plaid_item_id,
                institution_name=item.institution_name,
                accounts_synced=accounts_synced,
                transactions_added=tx_counts.added,
                transactions_modified=tx_counts.modified,
                transactions_removed=tx_counts.removed,
            )
        )
    return SyncResponse(items=results)


# ---------- internals ----------


class _TxCounts:
    __slots__ = ("added", "modified", "removed")

    def __init__(self) -> None:
        self.added = 0
        self.modified = 0
        self.removed = 0


def _sync_one(db: Session, item: PlaidItem) -> tuple[int, _TxCounts]:
    """Sync accounts + cursor-paginated transactions for a single item."""
    access_token = decrypt(item.access_token_encrypted)

    # Accounts (idempotent upsert, always full list)
    plaid_accounts = plaid_service.get_accounts(access_token)
    for a in plaid_accounts:
        accounts_repo.upsert_from_plaid(
            db,
            user_id=item.user_id,
            plaid_item_id=item.id,
            plaid_account=a,
        )

    # Transactions — paginate until has_more is False
    counts = _TxCounts()
    cursor = item.plaid_cursor
    while True:
        page = plaid_service.sync_transactions(access_token, cursor)
        for tx in page.added:
            if transactions_repo.upsert_from_plaid(
                db, user_id=item.user_id, plaid_transaction=tx
            ) is not None:
                counts.added += 1
        for tx in page.modified:
            if transactions_repo.upsert_from_plaid(
                db, user_id=item.user_id, plaid_transaction=tx
            ) is not None:
                counts.modified += 1
        for tx in page.removed:
            if transactions_repo.remove_by_plaid_id(db, tx["transaction_id"]):
                counts.removed += 1
        cursor = page.next_cursor
        if not page.has_more:
            break

    plaid_items_repo.update_after_sync(db, item, next_cursor=cursor)
    return len(plaid_accounts), counts
