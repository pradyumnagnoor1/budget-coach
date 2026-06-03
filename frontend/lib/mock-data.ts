/**
 * Mock data for the Budget Coach UI. Every screen reads from this file.
 * When real APIs land, swap reads here for fetch calls — the shapes are designed
 * to mirror what the FastAPI backend will return.
 */

export type Category = {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex
  isIncome: boolean;
};

export type Transaction = {
  id: string;
  date: string; // ISO date
  merchant: string;
  description: string;
  amount: number; // positive = outflow, negative = inflow (income / refund)
  categoryId: string;
  pending?: boolean;
  isRecurring?: boolean;
  categorizedBy: "plaid" | "ai" | "user";
  confidence?: number;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number; // monthly
  spent: number; // current period
  effectiveFrom: string;
};

export type Subscription = {
  id: string;
  merchant: string;
  amount: number;
  cadence: "monthly" | "annual" | "weekly";
  nextChargeDate: string;
  categoryId: string;
};

export type CoachingMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | CoachingContentBlock[] };

export type CoachingContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

export type CoachingRun = {
  id: string;
  triggerType: "proactive" | "reactive";
  startedAt: string;
  completedAt: string;
  systemPrompt: string;
  userDirective?: string;
  messages: CoachingMessage[];
  finalOutput: string;
  notificationSent: boolean;
  totalTokensInput: number;
  totalTokensOutput: number;
  costUsd: number;
  iterations: number;
};

export type Notification = {
  id: string;
  coachingRunId: string;
  severity: "info" | "warning" | "urgent";
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  monthlyIncome: number;
};

export type UserPreferences = {
  coachingTone: "encouraging" | "blunt" | "neutral";
  notificationFrequency: "high" | "normal" | "low";
  primaryGoal: string;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string;
};

// ---------------------------------------------------------------------------
// Static seed
// ---------------------------------------------------------------------------

export const MOCK_USER: User = {
  id: "u_1",
  name: "Pradyumna Gnoor",
  email: "pradyumnagnoor@gmail.com",
  avatarInitials: "PG",
  monthlyIncome: 5800,
};

export const MOCK_PREFERENCES: UserPreferences = {
  coachingTone: "encouraging",
  notificationFrequency: "normal",
  primaryGoal: "Save $1,000/month for an emergency fund",
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

export const CATEGORIES: Category[] = [
  { id: "c_groceries", name: "Groceries", icon: "🛒", color: "#10B981", isIncome: false },
  { id: "c_dining", name: "Dining out", icon: "🍽️", color: "#F59E0B", isIncome: false },
  { id: "c_coffee", name: "Coffee", icon: "☕", color: "#A855F7", isIncome: false },
  { id: "c_transport", name: "Transport", icon: "🚗", color: "#3B82F6", isIncome: false },
  { id: "c_shopping", name: "Shopping", icon: "🛍️", color: "#EC4899", isIncome: false },
  { id: "c_subscriptions", name: "Subscriptions", icon: "🔁", color: "#8B5CF6", isIncome: false },
  { id: "c_entertainment", name: "Entertainment", icon: "🎬", color: "#F43F5E", isIncome: false },
  { id: "c_health", name: "Health & fitness", icon: "💪", color: "#14B8A6", isIncome: false },
  { id: "c_bills", name: "Bills & rent", icon: "🏠", color: "#64748B", isIncome: false },
  { id: "c_income", name: "Income", icon: "💰", color: "#22C55E", isIncome: true },
];

export const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export const BUDGETS: Budget[] = [
  { id: "b_1", categoryId: "c_groceries", amount: 450, spent: 387.42, effectiveFrom: "2026-05-01" },
  { id: "b_2", categoryId: "c_dining", amount: 250, spent: 268.5, effectiveFrom: "2026-05-01" },
  { id: "b_3", categoryId: "c_coffee", amount: 80, spent: 71.25, effectiveFrom: "2026-05-01" },
  { id: "b_4", categoryId: "c_transport", amount: 200, spent: 134.0, effectiveFrom: "2026-05-01" },
  { id: "b_5", categoryId: "c_shopping", amount: 200, spent: 92.5, effectiveFrom: "2026-05-01" },
  { id: "b_6", categoryId: "c_entertainment", amount: 100, spent: 76.5, effectiveFrom: "2026-05-01" },
  { id: "b_7", categoryId: "c_health", amount: 120, spent: 119.0, effectiveFrom: "2026-05-01" },
];

export const SUBSCRIPTIONS: Subscription[] = [
  { id: "s_1", merchant: "Spotify", amount: 11.99, cadence: "monthly", nextChargeDate: "2026-06-05", categoryId: "c_subscriptions" },
  { id: "s_2", merchant: "Netflix", amount: 17.99, cadence: "monthly", nextChargeDate: "2026-06-09", categoryId: "c_subscriptions" },
  { id: "s_3", merchant: "ChatGPT Plus", amount: 20.0, cadence: "monthly", nextChargeDate: "2026-06-11", categoryId: "c_subscriptions" },
  { id: "s_4", merchant: "iCloud+ 2TB", amount: 9.99, cadence: "monthly", nextChargeDate: "2026-06-14", categoryId: "c_subscriptions" },
  { id: "s_5", merchant: "Equinox", amount: 285.0, cadence: "monthly", nextChargeDate: "2026-06-18", categoryId: "c_health" },
  { id: "s_6", merchant: "Notion", amount: 10.0, cadence: "monthly", nextChargeDate: "2026-06-21", categoryId: "c_subscriptions" },
  { id: "s_7", merchant: "Adobe Creative Cloud", amount: 59.99, cadence: "monthly", nextChargeDate: "2026-06-22", categoryId: "c_subscriptions" },
  { id: "s_8", merchant: "1Password", amount: 4.99, cadence: "monthly", nextChargeDate: "2026-06-27", categoryId: "c_subscriptions" },
];

// ---------------------------------------------------------------------------
// Transactions — seeded for realism. Generated for the period that ends "today" (2026-06-02).
// ---------------------------------------------------------------------------

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

const T = (
  id: string,
  date: string,
  merchant: string,
  description: string,
  amount: number,
  categoryId: string,
  opts: Partial<Transaction> = {}
): Transaction => ({
  id,
  date,
  merchant,
  description,
  amount,
  categoryId,
  categorizedBy: "ai",
  confidence: 0.94,
  ...opts,
});

export const TRANSACTIONS: Transaction[] = [
  // June 2026 (so far — today is 2026-06-02)
  T("t_0601a", iso(2026, 6, 2), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 6.25, "c_coffee", { pending: true }),
  T("t_0601b", iso(2026, 6, 2), "Whole Foods", "WHOLEFDS MKT", 48.73, "c_groceries"),
  T("t_0531a", iso(2026, 5, 31), "Uber", "UBER TRIP 9TG7K", 14.5, "c_transport"),
  T("t_0531b", iso(2026, 5, 31), "Sweetgreen", "SWEETGREEN MARKET ST", 18.4, "c_dining"),
  T("t_0530a", iso(2026, 5, 30), "AMC Theatres", "AMC METREON 16", 26.5, "c_entertainment"),

  // May 2026 (full month)
  T("t_0529a", iso(2026, 5, 29), "Trader Joe's", "TRADER JOE'S 124", 67.21, "c_groceries"),
  T("t_0529b", iso(2026, 5, 29), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 5.5, "c_coffee"),
  T("t_0528a", iso(2026, 5, 28), "Equinox", "EQUINOX SAN FRANCISCO", 285.0, "c_health", { isRecurring: true }),
  T("t_0527a", iso(2026, 5, 27), "Spotify", "SPOTIFY USA", 11.99, "c_subscriptions", { isRecurring: true }),
  T("t_0527b", iso(2026, 5, 27), "Shake Shack", "SHAKE SHACK MARKET ST", 22.4, "c_dining"),
  T("t_0526a", iso(2026, 5, 26), "Chevron", "CHEVRON #0334", 52.0, "c_transport"),
  T("t_0526b", iso(2026, 5, 26), "Amazon", "AMZN MKTP US*RH7", 84.50, "c_shopping"),
  T("t_0525a", iso(2026, 5, 25), "Pacific Catch", "PACIFIC CATCH MARINA", 64.20, "c_dining"),
  T("t_0524a", iso(2026, 5, 24), "Trader Joe's", "TRADER JOE'S 124", 53.18, "c_groceries"),
  T("t_0524b", iso(2026, 5, 24), "Starbucks", "STARBUCKS STORE 4221", 5.75, "c_coffee"),
  T("t_0523a", iso(2026, 5, 23), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0522a", iso(2026, 5, 22), "ChatGPT Plus", "OPENAI *MEMBERSHIP", 20.0, "c_subscriptions", { isRecurring: true }),
  T("t_0521a", iso(2026, 5, 21), "Uber Eats", "UBER EATS 9G7HK", 31.80, "c_dining"),
  T("t_0521b", iso(2026, 5, 21), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 6.25, "c_coffee"),
  T("t_0520a", iso(2026, 5, 20), "Whole Foods", "WHOLEFDS MKT", 71.42, "c_groceries"),
  T("t_0519a", iso(2026, 5, 19), "Lyft", "LYFT *RIDE THU 8AM", 12.30, "c_transport"),
  T("t_0518a", iso(2026, 5, 18), "Tartine Bakery", "TARTINE BAKERY GUERRE", 18.50, "c_dining"),
  T("t_0517a", iso(2026, 5, 17), "Netflix", "NETFLIX.COM", 17.99, "c_subscriptions", { isRecurring: true }),
  T("t_0516a", iso(2026, 5, 16), "Saje Natural", "SAJE NATURAL WELLNESS", 42.00, "c_health"),
  T("t_0516b", iso(2026, 5, 16), "Tacolicious", "TACOLICIOUS VALENCIA", 28.40, "c_dining"),
  T("t_0515a", iso(2026, 5, 15), "Rent — 25 Hawthorne", "ZELLE TRANSFER", 2200.0, "c_bills", { isRecurring: true }),
  T("t_0514a", iso(2026, 5, 14), "Costco", "COSTCO WHSE #1057", 142.78, "c_groceries"),
  T("t_0513a", iso(2026, 5, 13), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 6.50, "c_coffee"),
  T("t_0512a", iso(2026, 5, 12), "Uber", "UBER TRIP 8FG2P", 18.50, "c_transport"),
  T("t_0511a", iso(2026, 5, 11), "Sweetgreen", "SWEETGREEN MARKET ST", 16.40, "c_dining"),
  T("t_0510a", iso(2026, 5, 10), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0509a", iso(2026, 5, 9), "Comedy Cellar SF", "COMEDY CELLAR SF", 50.00, "c_entertainment"),
  T("t_0508a", iso(2026, 5, 8), "Trader Joe's", "TRADER JOE'S 124", 44.32, "c_groceries"),
  T("t_0507a", iso(2026, 5, 7), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 5.50, "c_coffee"),
  T("t_0506a", iso(2026, 5, 6), "Lyft", "LYFT *RIDE TUE 7PM", 22.80, "c_transport"),
  T("t_0505a", iso(2026, 5, 5), "Tacolicious", "TACOLICIOUS VALENCIA", 32.50, "c_dining"),
  T("t_0504a", iso(2026, 5, 4), "Whole Foods", "WHOLEFDS MKT", 59.86, "c_groceries"),
  T("t_0503a", iso(2026, 5, 3), "Uniqlo", "UNIQLO USA SF", 78.00, "c_shopping"),
  T("t_0502a", iso(2026, 5, 2), "Verizon", "VERIZON WIRELESS", 95.00, "c_bills", { isRecurring: true }),
  T("t_0501a", iso(2026, 5, 1), "ComEd", "COMED ELECTRIC SERVICE", 84.00, "c_bills", { isRecurring: true }),

  // April 2026 (sampled)
  T("t_0430a", iso(2026, 4, 30), "Whole Foods", "WHOLEFDS MKT", 71.20, "c_groceries"),
  T("t_0429a", iso(2026, 4, 29), "Pacific Catch", "PACIFIC CATCH MARINA", 88.40, "c_dining"),
  T("t_0428a", iso(2026, 4, 28), "Blue Bottle Coffee", "BLUE BOTTLE 15TH ST", 6.25, "c_coffee"),
  T("t_0426a", iso(2026, 4, 26), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0425a", iso(2026, 4, 25), "Equinox", "EQUINOX SAN FRANCISCO", 285.0, "c_health", { isRecurring: true }),
  T("t_0420a", iso(2026, 4, 20), "Costco", "COSTCO WHSE #1057", 162.45, "c_groceries"),
  T("t_0419a", iso(2026, 4, 19), "Chevron", "CHEVRON #0334", 58.0, "c_transport"),
  T("t_0418a", iso(2026, 4, 18), "Amazon", "AMZN MKTP US*KK4", 142.30, "c_shopping"),
  T("t_0415a", iso(2026, 4, 15), "Rent — 25 Hawthorne", "ZELLE TRANSFER", 2200.0, "c_bills", { isRecurring: true }),
  T("t_0412a", iso(2026, 4, 12), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0410a", iso(2026, 4, 10), "Sweetgreen", "SWEETGREEN MARKET ST", 18.40, "c_dining"),
  T("t_0408a", iso(2026, 4, 8), "Whole Foods", "WHOLEFDS MKT", 64.20, "c_groceries"),
  T("t_0405a", iso(2026, 4, 5), "Comedy Cellar SF", "COMEDY CELLAR SF", 35.0, "c_entertainment"),
  T("t_0403a", iso(2026, 4, 3), "Verizon", "VERIZON WIRELESS", 95.0, "c_bills", { isRecurring: true }),
  T("t_0401a", iso(2026, 4, 1), "ComEd", "COMED ELECTRIC SERVICE", 76.0, "c_bills", { isRecurring: true }),

  // March 2026 (sampled — for historical anchor)
  T("t_0331a", iso(2026, 3, 31), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0328a", iso(2026, 3, 28), "Costco", "COSTCO WHSE #1057", 188.50, "c_groceries"),
  T("t_0325a", iso(2026, 3, 25), "Equinox", "EQUINOX SAN FRANCISCO", 285.0, "c_health", { isRecurring: true }),
  T("t_0320a", iso(2026, 3, 20), "Lyft", "LYFT *RIDE FRI 10PM", 28.50, "c_transport"),
  T("t_0315a", iso(2026, 3, 15), "Rent — 25 Hawthorne", "ZELLE TRANSFER", 2200.0, "c_bills", { isRecurring: true }),
  T("t_0312a", iso(2026, 3, 12), "Whole Foods", "WHOLEFDS MKT", 82.40, "c_groceries"),
  T("t_0308a", iso(2026, 3, 8), "Pacific Catch", "PACIFIC CATCH MARINA", 94.20, "c_dining"),
  T("t_0305a", iso(2026, 3, 5), "Salary — Acme Corp", "ACME CORP PAYROLL DD", -2900.0, "c_income"),
  T("t_0302a", iso(2026, 3, 2), "Verizon", "VERIZON WIRELESS", 95.0, "c_bills", { isRecurring: true }),
];

// ---------------------------------------------------------------------------
// Coaching runs — agent trace fixtures for the reasoning viewer
// ---------------------------------------------------------------------------

const SYS_PROMPT_BASE = `You are a financial coach for Budget Coach. Your job is to deliver specific, actionable observations over generic advice. You are never preachy, never alarmist. You only intervene when there is something concrete and worth the user's attention. Silence is acceptable — and often the right call.

Current user: Pradyumna Gnoor
Primary goal: Save $1,000/month for an emergency fund
Coaching tone: encouraging
Quiet hours: 22:00–08:00 America/Los_Angeles

Active budgets (May 2026):
- Groceries: $450
- Dining out: $250
- Coffee: $80
- Transport: $200
- Shopping: $200
- Entertainment: $100
- Health & fitness: $120`;

export const COACHING_RUNS: CoachingRun[] = [
  {
    id: "run_001",
    triggerType: "proactive",
    startedAt: "2026-05-29T03:00:14Z",
    completedAt: "2026-05-29T03:00:21Z",
    systemPrompt: SYS_PROMPT_BASE,
    messages: [
      {
        role: "user",
        content:
          "Analyze the user's recent spending activity and decide whether coaching is warranted right now. Be conservative — only notify if you can name something specific and useful.",
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Let me check where Pradyumna stands across his active budgets so far this month." },
          { type: "tool_use", id: "tu_01", name: "get_budget_overview", input: { user_id: "u_1" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_01",
            content: JSON.stringify({
              period: "2026-05",
              days_elapsed: 29,
              budgets: [
                { category: "Groceries", budget: 450, spent: 387.42, pct: 86 },
                { category: "Dining out", budget: 250, spent: 268.5, pct: 107 },
                { category: "Coffee", budget: 80, spent: 71.25, pct: 89 },
                { category: "Transport", budget: 200, spent: 134.0, pct: 67 },
                { category: "Shopping", budget: 200, spent: 92.5, pct: 46 },
                { category: "Entertainment", budget: 100, spent: 76.5, pct: 76 },
                { category: "Health & fitness", budget: 120, spent: 119.0, pct: 99 },
              ],
            }),
          },
        ],
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Dining is already over budget with two days left. Let me confirm it's not driven by a single anomaly before flagging it." },
          { type: "tool_use", id: "tu_02", name: "get_spending_trend", input: { user_id: "u_1", category: "Dining out", period: "month", granularity: "day" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_02",
            content: JSON.stringify({
              total_transactions: 9,
              avg_per_visit: 29.83,
              largest: { merchant: "Pacific Catch", amount: 64.2, date: "2026-05-25" },
              recent_3mo_avg_total: 215.4,
            }),
          },
        ],
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Pattern is real — 9 visits averaging $30 each. No single anomaly. The 3-month dining average is $215, so $268 is a 25% bump. Worth surfacing as an observation, not an alarm." },
          {
            type: "tool_use",
            id: "tu_03",
            name: "send_coaching_notification",
            input: {
              user_id: "u_1",
              severity: "info",
              message:
                "Dining is 7% over your $250 budget with 2 days left in May. It's not one big bill — 9 small dinners averaging $30. You've still got slack in Groceries ($63) and Transport ($66) to absorb it if you want to ride this month out.",
            },
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "tu_03", content: '{"sent": true, "notification_id": "n_001"}' }],
      },
      { role: "assistant", content: "Notification sent. Done." },
    ],
    finalOutput:
      "Dining is 7% over budget. Not a single anomaly — small frequent meals. Surfacing as info, not warning. Slack in Groceries + Transport can absorb it.",
    notificationSent: true,
    totalTokensInput: 1542,
    totalTokensOutput: 327,
    costUsd: 0.0091,
    iterations: 3,
  },
  {
    id: "run_002",
    triggerType: "proactive",
    startedAt: "2026-05-28T03:00:09Z",
    completedAt: "2026-05-28T03:00:15Z",
    systemPrompt: SYS_PROMPT_BASE,
    messages: [
      {
        role: "user",
        content:
          "Analyze the user's recent spending activity and decide whether coaching is warranted right now.",
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Checking the current state." },
          { type: "tool_use", id: "tu_01", name: "get_budget_overview", input: { user_id: "u_1" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_01",
            content: JSON.stringify({
              period: "2026-05",
              days_elapsed: 28,
              budgets: [
                { category: "Dining out", budget: 250, spent: 246.1, pct: 98 },
                { category: "Groceries", budget: 450, spent: 364.3, pct: 81 },
              ],
            }),
          },
        ],
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Dining is at 98% with 3 days left. Close but not over yet. Pradyumna's tone preference is encouraging — nagging him about a budget he hasn't broken would be counterproductive. Let me check his 3-month dining pattern to be sure this isn't a real outlier." },
          { type: "tool_use", id: "tu_02", name: "get_budget_performance_history", input: { user_id: "u_1", category: "Dining out", months: 3 } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_02",
            content: JSON.stringify({ avg: 215.4, p50: 218.0, p90: 270.0, over_budget_months: 1 }),
          },
        ],
      },
      {
        role: "assistant",
        content: "Dining sits between his typical and p90. He's still under budget. No notification — silence is correct here.",
      },
    ],
    finalOutput: "No notification. Dining at 98% but not over; within his normal variance.",
    notificationSent: false,
    totalTokensInput: 1389,
    totalTokensOutput: 198,
    costUsd: 0.0071,
    iterations: 2,
  },
  {
    id: "run_003",
    triggerType: "reactive",
    startedAt: "2026-05-26T19:42:08Z",
    completedAt: "2026-05-26T19:42:15Z",
    systemPrompt: SYS_PROMPT_BASE,
    userDirective: "Can I afford a $90 dinner this weekend?",
    messages: [
      { role: "user", content: "Can I afford a $90 dinner this weekend?" },
      {
        role: "assistant",
        content: [
          { type: "text", text: "Let me see what's left in Dining and what's coming up." },
          { type: "tool_use", id: "tu_01", name: "get_budget_for_category", input: { user_id: "u_1", category: "Dining out", as_of_date: "2026-05-26" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_01",
            content: JSON.stringify({ budget: 250, spent: 215.3, remaining: 34.7, days_left_in_period: 5 }),
          },
        ],
      },
      {
        role: "assistant",
        content: [
          { type: "tool_use", id: "tu_02", name: "calculate_safe_daily_spend", input: { user_id: "u_1", target_date: "2026-05-31" } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_02",
            content: JSON.stringify({ safe_today: 18.2, days_left: 5, includes_known_recurring: true }),
          },
        ],
      },
      {
        role: "assistant",
        content:
          "Honest answer: a $90 dinner puts dining $55 over budget for May. You'd land 22% over your $250 cap — manageable, but it'd eat into next month's emergency fund contribution. If you want to do it without a tradeoff, push it to June 1 (Sunday) and it lands clean against next month's budget. Up to you.",
      },
    ],
    finalOutput:
      "Honest answer: a $90 dinner puts dining $55 over budget for May. You'd land 22% over your $250 cap — manageable, but it'd eat into next month's emergency fund contribution. If you want to do it without a tradeoff, push it to June 1 (Sunday) and it lands clean against next month's budget. Up to you.",
    notificationSent: false,
    totalTokensInput: 1124,
    totalTokensOutput: 412,
    costUsd: 0.0064,
    iterations: 2,
  },
  {
    id: "run_004",
    triggerType: "proactive",
    startedAt: "2026-05-22T03:00:04Z",
    completedAt: "2026-05-22T03:00:11Z",
    systemPrompt: SYS_PROMPT_BASE,
    messages: [
      { role: "user", content: "Analyze and decide." },
      {
        role: "assistant",
        content: [
          { type: "tool_use", id: "tu_01", name: "detect_anomalies", input: { user_id: "u_1", lookback_days: 30 } },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "tu_01",
            content: JSON.stringify({
              anomalies: [
                {
                  merchant: "Pacific Catch",
                  date: "2026-05-25",
                  amount: 64.2,
                  category: "Dining out",
                  reason: "2.1x the typical dining transaction ($30 median over 90d)",
                },
              ],
            }),
          },
        ],
      },
      {
        role: "assistant",
        content: "One outlier dinner. Not enough on its own to warrant a notification — he hasn't broken any budget. Skipping.",
      },
    ],
    finalOutput: "Detected one dining outlier. Not enough to coach on. Silence.",
    notificationSent: false,
    totalTokensInput: 988,
    totalTokensOutput: 142,
    costUsd: 0.0048,
    iterations: 1,
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n_001",
    coachingRunId: "run_001",
    severity: "info",
    title: "Dining is just over budget",
    message:
      "Dining is 7% over your $250 budget with 2 days left in May. It's not one big bill — 9 small dinners averaging $30. You've got slack in Groceries and Transport to absorb it if you want to ride this month out.",
    createdAt: "2026-05-29T03:00:21Z",
  },
  {
    id: "n_002",
    coachingRunId: "run_001",
    severity: "info",
    title: "Equinox renews tomorrow",
    message:
      "Heads up: Equinox ($285) charges tomorrow. If you've been thinking about pausing your membership, today is the day to do it.",
    createdAt: "2026-05-27T15:30:00Z",
    readAt: "2026-05-27T16:42:00Z",
  },
  {
    id: "n_003",
    coachingRunId: "run_003",
    severity: "warning",
    title: "Subscription quietly went up",
    message:
      "Adobe Creative Cloud charged $59.99 this month, up from $54.99. That's about $60/year if it sticks. Worth a 30-second look at whether you still need the full plan.",
    createdAt: "2026-05-23T14:12:00Z",
    readAt: "2026-05-23T14:30:00Z",
  },
];

// ---------------------------------------------------------------------------
// Derived helpers — what the dashboard reads
// ---------------------------------------------------------------------------

const TODAY = "2026-06-02";

export function getRecentTransactions(limit = 12): Transaction[] {
  return TRANSACTIONS.filter((t) => !CATEGORY_BY_ID[t.categoryId]?.isIncome)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export function getCurrentMonthSpend(): number {
  return TRANSACTIONS.filter(
    (t) =>
      t.date.startsWith("2026-05") &&
      !CATEGORY_BY_ID[t.categoryId]?.isIncome
  ).reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyIncomeReceived(): number {
  return -TRANSACTIONS.filter(
    (t) => t.date.startsWith("2026-05") && CATEGORY_BY_ID[t.categoryId]?.isIncome
  ).reduce((sum, t) => sum + t.amount, 0);
}

export function computeSafeToSpendToday(): {
  amount: number;
  daysLeftInMonth: number;
  rationale: string;
} {
  // Stylized: "safe to spend today" = (remaining flexible budget - upcoming recurring) / days left
  const flexibleBudgetTotal = BUDGETS.reduce((s, b) => s + b.amount, 0);
  const flexibleSpent = BUDGETS.reduce((s, b) => s + b.spent, 0);
  const remainingFlexible = flexibleBudgetTotal - flexibleSpent;

  const upcomingRecurring = SUBSCRIPTIONS.filter(
    (s) => s.nextChargeDate >= TODAY && s.nextChargeDate <= "2026-06-30"
  ).reduce((s, sub) => s + sub.amount, 0);

  const daysLeftInMonth = 28; // 30 days in June, 2 elapsed → 28 left
  const buffer = (remainingFlexible - upcomingRecurring) / daysLeftInMonth + 32;

  return {
    amount: Math.max(0, Math.round(buffer)),
    daysLeftInMonth,
    rationale:
      "Based on $1,400 in income arriving June 5, your remaining flexible budget of $586, and $116 of subscriptions charging this month.",
  };
}

export function getSpendingTrend(): { date: string; spent: number }[] {
  // Aggregate by week for the trend sparkline
  const byWeek: Record<string, number> = {};
  for (const t of TRANSACTIONS) {
    if (CATEGORY_BY_ID[t.categoryId]?.isIncome) continue;
    const d = new Date(t.date);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const week = Math.floor(
      ((d.getTime() - yearStart.getTime()) / 86400000 + yearStart.getDay()) / 7
    );
    const key = `W${week}`;
    byWeek[key] = (byWeek[key] ?? 0) + t.amount;
  }
  return Object.entries(byWeek)
    .map(([date, spent]) => ({ date, spent: Math.round(spent) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function getSpendingByCategory(): { category: Category; spent: number }[] {
  const map = new Map<string, number>();
  for (const t of TRANSACTIONS) {
    if (!t.date.startsWith("2026-05")) continue;
    if (CATEGORY_BY_ID[t.categoryId]?.isIncome) continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([id, spent]) => ({ category: CATEGORY_BY_ID[id], spent: Math.round(spent * 100) / 100 }))
    .filter((x) => x.category)
    .sort((a, b) => b.spent - a.spent);
}

export const UPCOMING_RECURRING = SUBSCRIPTIONS.filter(
  (s) => s.nextChargeDate >= TODAY
)
  .sort((a, b) => a.nextChargeDate.localeCompare(b.nextChargeDate))
  .slice(0, 5);
