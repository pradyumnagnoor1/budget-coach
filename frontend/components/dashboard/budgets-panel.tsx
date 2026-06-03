"use client";

import { formatCurrency, percent } from "@/lib/format";
import { BUDGETS, CATEGORY_BY_ID } from "@/lib/mock-data";

export function BudgetsPanel() {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Budgets — May 2026</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Versioned. Edits don&apos;t rewrite history.
          </p>
        </div>
        <button className="text-xs text-muted-foreground hover:text-foreground transition">
          Edit budgets →
        </button>
      </div>

      <div className="space-y-4">
        {BUDGETS.map((budget) => {
          const cat = CATEGORY_BY_ID[budget.categoryId];
          if (!cat) return null;
          const pct = percent(budget.spent, budget.amount);
          const over = budget.spent > budget.amount;
          const nearLimit = pct >= 90 && !over;

          return (
            <div key={budget.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                  {over && (
                    <span className="text-[10px] uppercase tracking-wider text-destructive font-semibold bg-destructive/10 px-1.5 py-0.5 rounded">
                      Over
                    </span>
                  )}
                  {nearLimit && (
                    <span className="text-[10px] uppercase tracking-wider text-warning font-semibold bg-warning/10 px-1.5 py-0.5 rounded">
                      Near
                    </span>
                  )}
                </div>
                <div className="text-xs tabular text-muted-foreground">
                  <span
                    className={`font-medium ${over ? "text-destructive" : nearLimit ? "text-warning" : "text-foreground"}`}
                  >
                    {formatCurrency(budget.spent)}
                  </span>{" "}
                  / {formatCurrency(budget.amount)}
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    over
                      ? "bg-destructive"
                      : nearLimit
                        ? "bg-warning"
                        : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
