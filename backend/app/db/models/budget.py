from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import Date, ForeignKey, Index, Numeric, String, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models._mixins import TimestampMixin
from app.db.session import Base

if TYPE_CHECKING:
    from app.db.models.transaction import Category
    from app.db.models.user import User


class Budget(Base, TimestampMixin):
    """Time-versioned budgets. effective_to NULL means currently active."""

    __tablename__ = "budgets"
    __table_args__ = (
        Index("ix_budgets_user_category_effective", "user_id", "category_id", "effective_from"),
    )

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    category_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False
    )
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    period: Mapped[str] = mapped_column(String(16), default="monthly", nullable=False)
    effective_from: Mapped[date] = mapped_column(Date, nullable=False)
    effective_to: Mapped[date | None] = mapped_column(Date, nullable=True)

    user: Mapped["User"] = relationship(back_populates="budgets")
    category: Mapped["Category"] = relationship(back_populates="budgets")
    rules: Mapped[list["BudgetRule"]] = relationship(
        back_populates="budget", cascade="all, delete-orphan"
    )


class BudgetRule(Base, TimestampMixin):
    """Opt-in stricter behavior for a budget (hard caps, alert thresholds, rollover, etc.)."""

    __tablename__ = "budget_rules"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    budget_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("budgets.id", ondelete="CASCADE"), index=True, nullable=False
    )
    rule_type: Mapped[str] = mapped_column(String(32), nullable=False)
    value: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)

    budget: Mapped["Budget"] = relationship(back_populates="rules")
