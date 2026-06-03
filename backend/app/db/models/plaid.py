from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models._mixins import TimestampMixin
from app.db.session import Base

if TYPE_CHECKING:
    from app.db.models.transaction import Transaction
    from app.db.models.user import User


class PlaidItem(Base, TimestampMixin):
    __tablename__ = "plaid_items"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    plaid_item_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    institution_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    plaid_cursor: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="plaid_items")
    accounts: Mapped[list["Account"]] = relationship(
        back_populates="plaid_item", cascade="all, delete-orphan"
    )


class Account(Base, TimestampMixin):
    __tablename__ = "accounts"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    plaid_item_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("plaid_items.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    plaid_account_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    official_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mask: Mapped[str | None] = mapped_column(String(8), nullable=True)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    subtype: Mapped[str | None] = mapped_column(String(32), nullable=True)
    current_balance: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    available_balance: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

    plaid_item: Mapped["PlaidItem"] = relationship(back_populates="accounts")
    user: Mapped["User"] = relationship(back_populates="accounts")
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
