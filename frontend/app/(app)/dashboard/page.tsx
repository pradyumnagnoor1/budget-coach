import { BudgetsPanel } from "@/components/dashboard/budgets-panel";
import { CoachCard } from "@/components/dashboard/coach-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SafeSpendHero } from "@/components/dashboard/safe-spend-hero";
import { SpendingByCategory } from "@/components/dashboard/spending-by-category";
import { UpcomingRecurring } from "@/components/dashboard/upcoming-recurring";
import { MOCK_USER } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {MOCK_USER.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tuesday, June 2 · The coach checked in last night.
          </p>
        </div>
      </div>

      <SafeSpendHero />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CoachCard />
          <BudgetsPanel />
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <SpendingByCategory />
          <UpcomingRecurring />
        </div>
      </div>
    </div>
  );
}
