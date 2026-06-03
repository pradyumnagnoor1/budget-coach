"use client";

import { CATEGORY_BY_ID, TRANSACTIONS } from "@/lib/mock-data";
import { formatCurrency, formatTransactionDate } from "@/lib/format";

export default function TransactionsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {TRANSACTIONS.length} entries · last 90 days · synced from Plaid
        </p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card overflow-hidden">
        <ul className="divide-y divide-border/40">
          {TRANSACTIONS.map((t) => {
            const cat = CATEGORY_BY_ID[t.categoryId];
            return (
              <li
                key={t.id}
                className="px-5 py-3.5 flex items-center gap-3 hover:bg-background/30 transition"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-base shrink-0"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.merchant}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatTransactionDate(t.date)} · {cat.name}
                    {t.isRecurring ? " · recurring" : ""}
                  </div>
                </div>
                <div
                  className={`text-sm tabular font-medium ${t.amount < 0 ? "text-success" : ""}`}
                >
                  {t.amount < 0
                    ? `+${formatCurrency(Math.abs(t.amount))}`
                    : `-${formatCurrency(t.amount)}`}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
