"""Thin wrapper around the Plaid SDK.

We expose the small surface area we actually use:
- create_link_token: prepares a one-shot token for Plaid Link on the frontend
- exchange_public_token: trades the post-sign-in public_token for a permanent access_token
- get_item_metadata: institution_id + institution_name for storing on plaid_items
- get_accounts: account list for first sync
- sync_transactions: cursor-based incremental transaction sync

Sandbox in dev (free, fake banks). Swap PLAID_ENV=production once Plaid
approves the production application — no code changes needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import plaid
import structlog
from plaid.api import plaid_api
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.country_code import CountryCode
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.item_public_token_exchange_request import (
    ItemPublicTokenExchangeRequest,
)
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.transactions_sync_request import TransactionsSyncRequest

from app.core.config import settings

logger = structlog.get_logger()


_ENV_HOSTS = {
    "sandbox": plaid.Environment.Sandbox,
    "production": plaid.Environment.Production,
}


class PlaidConfigError(Exception):
    pass


def _client() -> plaid_api.PlaidApi:
    if not settings.plaid_client_id or not settings.plaid_secret:
        raise PlaidConfigError("PLAID_CLIENT_ID and PLAID_SECRET must be set")
    host = _ENV_HOSTS.get(settings.plaid_env.lower())
    if host is None:
        raise PlaidConfigError(
            f"PLAID_ENV must be sandbox or production, got {settings.plaid_env!r}"
        )
    config = plaid.Configuration(
        host=host,
        api_key={"clientId": settings.plaid_client_id, "secret": settings.plaid_secret},
    )
    return plaid_api.PlaidApi(plaid.ApiClient(config))


@dataclass(slots=True)
class ItemMetadata:
    item_id: str
    institution_id: str | None
    institution_name: str | None


def create_link_token(user_id: str) -> str:
    """Create a one-shot link_token for Plaid Link on the frontend."""
    req = LinkTokenCreateRequest(
        user=LinkTokenCreateRequestUser(client_user_id=str(user_id)),
        client_name="Budget Coach",
        products=[Products("transactions")],
        country_codes=[CountryCode("US")],
        language="en",
    )
    resp = _client().link_token_create(req)
    return resp.link_token


def exchange_public_token(public_token: str) -> tuple[str, str]:
    """Swap the public_token from Plaid Link for a permanent access_token.

    Returns (access_token, item_id).
    """
    resp = _client().item_public_token_exchange(
        ItemPublicTokenExchangeRequest(public_token=public_token)
    )
    return resp.access_token, resp.item_id


def get_item_metadata(access_token: str) -> ItemMetadata:
    """Fetch the institution_id and resolve its display name."""
    client = _client()
    item_resp = client.item_get(ItemGetRequest(access_token=access_token))
    institution_id = item_resp.item.institution_id

    institution_name: str | None = None
    if institution_id:
        try:
            inst_resp = client.institutions_get_by_id(
                InstitutionsGetByIdRequest(
                    institution_id=institution_id,
                    country_codes=[CountryCode("US")],
                )
            )
            institution_name = inst_resp.institution.name
        except plaid.ApiException as e:
            # Non-fatal — we'll just leave the name blank if the lookup fails.
            logger.warning(
                "plaid_institution_lookup_failed",
                institution_id=institution_id,
                error=str(e),
            )

    return ItemMetadata(
        item_id=item_resp.item.item_id,
        institution_id=institution_id,
        institution_name=institution_name,
    )


def get_accounts(access_token: str) -> list[dict[str, Any]]:
    """Return raw account dicts as returned by Plaid."""
    resp = _client().accounts_get(AccountsGetRequest(access_token=access_token))
    return [a.to_dict() for a in resp.accounts]


@dataclass(slots=True)
class TransactionsSyncPage:
    added: list[dict[str, Any]]
    modified: list[dict[str, Any]]
    removed: list[dict[str, Any]]
    next_cursor: str
    has_more: bool


def sync_transactions(access_token: str, cursor: str | None) -> TransactionsSyncPage:
    """One page of transactions/sync. Caller paginates until has_more is False."""
    req = TransactionsSyncRequest(access_token=access_token, cursor=cursor or "")
    resp = _client().transactions_sync(req)
    return TransactionsSyncPage(
        added=[t.to_dict() for t in resp.added],
        modified=[t.to_dict() for t in resp.modified],
        removed=[t.to_dict() for t in resp.removed],
        next_cursor=resp.next_cursor,
        has_more=resp.has_more,
    )
