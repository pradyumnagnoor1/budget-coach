import { Bell, Lock, User } from "lucide-react";

import { MOCK_PREFERENCES, MOCK_USER } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Account, coaching preferences, and connected services.
        </p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Account</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <Row label="Name" value={MOCK_USER.name} />
          <Row label="Email" value={MOCK_USER.email} />
          <Row label="Signed in via" value="Google" />
        </dl>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Coaching</h2>
        </div>
        <dl className="space-y-3 text-sm">
          <Row label="Tone" value={MOCK_PREFERENCES.coachingTone} />
          <Row label="Frequency" value={MOCK_PREFERENCES.notificationFrequency} />
          <Row label="Quiet hours" value={`${MOCK_PREFERENCES.quietHoursStart} – ${MOCK_PREFERENCES.quietHoursEnd}`} />
          <Row label="Primary goal" value={MOCK_PREFERENCES.primaryGoal} />
        </dl>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Security</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Plaid access tokens are encrypted at rest with AWS KMS. We never store
          your bank password. Disconnect any account from the dashboard sidebar.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground capitalize">{value}</dd>
    </div>
  );
}
