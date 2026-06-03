"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";
import { CATEGORIES } from "@/lib/mock-data";

const STEPS = ["Connect bank", "Review spending", "Set budgets", "Coaching style"] as const;

const HISTORICAL: { categoryId: string; avg: number; suggestion: number }[] = [
  { categoryId: "c_groceries", avg: 412, suggestion: 450 },
  { categoryId: "c_dining", avg: 281, suggestion: 250 },
  { categoryId: "c_coffee", avg: 74, suggestion: 80 },
  { categoryId: "c_transport", avg: 165, suggestion: 200 },
  { categoryId: "c_shopping", avg: 168, suggestion: 200 },
  { categoryId: "c_entertainment", avg: 88, suggestion: 100 },
  { categoryId: "c_health", avg: 119, suggestion: 120 },
];

type Budgets = Record<string, number>;
type Prefs = {
  tone: "encouraging" | "blunt" | "neutral";
  frequency: "high" | "normal" | "low";
  goal: string;
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [budgets, setBudgets] = useState<Budgets>(
    Object.fromEntries(HISTORICAL.map((h) => [h.categoryId, h.suggestion]))
  );
  const [prefs, setPrefs] = useState<Prefs>({
    tone: "encouraging",
    frequency: "normal",
    goal: "Save $1,000/month for an emergency fund",
  });
  const [plaidConnecting, setPlaidConnecting] = useState(false);
  const [plaidConnected, setPlaidConnected] = useState(false);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }
  function finish() {
    toast.success("You're all set", {
      description: "Your dashboard is ready.",
    });
    router.push("/dashboard");
  }

  function fakeConnect() {
    setPlaidConnecting(true);
    setTimeout(() => {
      setPlaidConnecting(false);
      setPlaidConnected(true);
    }, 1800);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary/20 text-primary ring-1 ring-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </div>
            <span
              className={`text-[11px] uppercase tracking-wider truncate ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border/60" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-7 lg:p-10">
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Connect your bank</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              We use Plaid to read your last 90 days of transactions. Read-only.
              We never store your bank password. You can disconnect any time.
            </p>

            <div className="mt-7 rounded-2xl border border-border/60 bg-background/40 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                  <Building2 className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {plaidConnected ? "Chase Sapphire Reserve" : "Choose a bank"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {plaidConnected
                      ? "Connected · 1 account · synced 12,300 transactions"
                      : "Plaid supports 12,000+ US institutions"}
                  </div>
                </div>
                {plaidConnected ? (
                  <span className="text-xs text-success flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Connected
                  </span>
                ) : (
                  <button
                    onClick={fakeConnect}
                    disabled={plaidConnecting}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-60 transition"
                  >
                    {plaidConnecting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Connecting…
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Read-only access. We can&apos;t move money.
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Tokens encrypted at rest with AWS KMS.
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Disconnect any time. Your data is deleted on request.
              </li>
            </ul>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Here&apos;s what you&apos;ve actually been spending
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Real averages from your last 90 days. We&apos;ll use these as
              starting points — you can change anything in the next step.
            </p>

            <div className="mt-7 space-y-3">
              {HISTORICAL.map((h) => {
                const cat = CATEGORIES.find((c) => c.id === h.categoryId)!;
                return (
                  <div
                    key={h.categoryId}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 p-3.5"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 text-sm font-medium">{cat.name}</div>
                    <div className="text-sm tabular text-muted-foreground">
                      avg <span className="text-foreground font-medium">{formatCurrency(h.avg, { compact: true })}</span>
                      <span className="text-muted-foreground"> /mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Set your budgets</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              These are our suggestions based on your real spending. Adjust the
              sliders to whatever feels right. The coach will reason against
              whatever you set.
            </p>

            <div className="mt-7 space-y-5">
              {HISTORICAL.map((h) => {
                const cat = CATEGORIES.find((c) => c.id === h.categoryId)!;
                const value = budgets[h.categoryId];
                return (
                  <div key={h.categoryId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          You spend ~{formatCurrency(h.avg, { compact: true })}
                        </span>
                        <span className="tabular text-sm font-semibold text-primary">
                          {formatCurrency(value, { compact: true })}
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={Math.max(0, Math.round(h.avg * 0.4))}
                      max={Math.round(h.avg * 2)}
                      step={5}
                      value={value}
                      onChange={(e) =>
                        setBudgets({ ...budgets, [h.categoryId]: Number(e.target.value) })
                      }
                      className="w-full accent-[var(--color-primary)] cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-7 rounded-xl border border-border/60 bg-background/40 p-4 flex items-center justify-between">
              <div className="text-sm">
                <div className="text-muted-foreground text-xs">Total monthly budgets</div>
                <div className="font-semibold tabular text-lg">
                  {formatCurrency(
                    Object.values(budgets).reduce((s, n) => s + n, 0),
                    { compact: true }
                  )}
                </div>
              </div>
              <div className="text-sm text-right">
                <div className="text-muted-foreground text-xs">Implied savings</div>
                <div className="font-semibold tabular text-lg text-success">
                  +{formatCurrency(
                    5800 - Object.values(budgets).reduce((s, n) => s + n, 0) - 2200 - 95 - 80,
                    { compact: true }
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              How should your coach talk to you?
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              The coach will use this when it sends you observations or answers
              your questions. You can change it any time.
            </p>

            <div className="mt-7 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Tone
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["encouraging", "neutral", "blunt"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setPrefs({ ...prefs, tone: t })}
                      className={`px-3 py-3 rounded-xl border text-sm capitalize transition ${
                        prefs.tone === t
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:bg-background/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  How often
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      ["low", "Quiet"],
                      ["normal", "Normal"],
                      ["high", "Active"],
                    ] as const
                  ).map(([f, label]) => (
                    <button
                      key={f}
                      onClick={() => setPrefs({ ...prefs, frequency: f })}
                      className={`px-3 py-3 rounded-xl border text-sm transition ${
                        prefs.frequency === f
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/60 bg-background/40 text-muted-foreground hover:text-foreground hover:bg-background/60"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  What are you working toward?
                </label>
                <textarea
                  value={prefs.goal}
                  onChange={(e) => setPrefs({ ...prefs, goal: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl bg-background/40 border border-border/60 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="Save $1,000/month, eliminate dining out, pay down credit card..."
                />
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-4 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your coach will use a {prefs.tone} voice, intervene at a{" "}
                  {prefs.frequency} cadence, and weigh decisions against your
                  goal: <span className="text-foreground">{prefs.goal}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-9 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={step === 0 && !plaidConnected}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition"
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={finish}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
            >
              Open dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
