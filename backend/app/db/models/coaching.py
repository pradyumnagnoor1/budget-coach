from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models._mixins import TimestampMixin
from app.db.session import Base

if TYPE_CHECKING:
    from app.db.models.user import User


class CoachingRun(Base, TimestampMixin):
    """Persisted agent trace — powers the reasoning trace viewer."""

    __tablename__ = "coaching_runs"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    trigger_type: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    user_directive: Mapped[str | None] = mapped_column(Text, nullable=True)
    messages: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=list)
    final_output: Mapped[str | None] = mapped_column(Text, nullable=True)
    notification_sent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    total_tokens_input: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tokens_output: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cost_usd: Mapped[Decimal] = mapped_column(Numeric(10, 6), default=0, nullable=False)
    iterations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="coaching_runs")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="coaching_run")


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    coaching_run_id: Mapped[UUID | None] = mapped_column(
        Uuid, ForeignKey("coaching_runs.id", ondelete="SET NULL"), index=True, nullable=True
    )
    severity: Mapped[str] = mapped_column(String(16), nullable=False)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="notifications")
    coaching_run: Mapped["CoachingRun | None"] = relationship(back_populates="notifications")
