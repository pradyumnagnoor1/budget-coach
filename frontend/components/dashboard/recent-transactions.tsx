"use client";

import Link from "next/link";

import { formatCurrency, formatTransactionDate } from "@/lib/format";
import { CATEGORY_BY_ID, getRecentTransactions } from "@/lib/mock-data";

export function RecentTransactions() {
  const txns = getRecentTransactions(8);

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">Recent transactions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Categorized in real time
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          View all →
        </Link>
      </div>

      <ul className="divide-y divide-border/40">
        {txns.map((t) => {
          const cat = CATEGORY_BY_ID[t.categoryId];
          return (
            <li
              key={t.id}
              className="py-3 flex items-center gap-3 first:pt-0 last:pb-0"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{t.merchant}</span>
                  {t.pending && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                  {t.isRecurring && (
                    <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Recurring
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>{formatTransactionDate(t.date)}</span>
                  <span>·</span>
                  <span>{cat.name}</span>
                </div>
              </div>
              <div className="text-right tabular">
                <div
                  className={`text-sm font-medium ${t.amount < 0 ? "text-success" : "text-foreground"}`}
                >
                  {t.amount < 0
                    ? `+${formatCurrency(Math.abs(t.amount))}`
                    : `-${formatCurrency(t.amount)}`}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
