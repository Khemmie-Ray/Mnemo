"use client";

import Link from "next/link";
import { useVault } from "@/hooks/useVault";
import { SpecimenCard } from "@/components/dashboard/SpecimenCard";

export default function DashboardPage() {
  const { data, isLoading, error } = useVault();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalMemories = data?.totalMemories ?? 0;
  const recipientCount = data?.recipients.length ?? 0;
  const preferenceCount = data?.preferences.length ?? 0;
  const paymentLogCount = data?.paymentLog.length ?? 0;

  // Show the most recent 6 memories on the dashboard
  const recentMemories = (data?.allChunks ?? []).slice(0, 6);

  const stats = [
    { label: "Total memories", value: String(totalMemories) },
    { label: "Saved recipients", value: String(recipientCount) },
    { label: "Preferences", value: String(preferenceCount) },
    { label: "Payment logs", value: String(paymentLogCount) },
  ];

  return (
    <div className="max-w-5xl mx-auto px-8 md:px-12 py-12">
      <div className="font-mono text-xs text-ink-faint uppercase tracking-[0.15em] mb-3">
        {today}
      </div>

      <div className="flex items-baseline justify-between mb-12 pb-6 border-b border-rule">
        <h1 className="font-serif text-4xl md:text-5xl text-ink">
          Welcome back{data?.manifest?.name ? `, ${data.manifest.name}` : ""}.
        </h1>
        <span className="font-serif italic text-sm text-marginalia hidden md:block">
          {isLoading ? "consulting your vault…" : "your vault is current"}
        </span>
      </div>

      {error && (
        <div className="mb-8 p-4 border border-stamp/40 bg-stamp/5">
          <div className="font-mono text-xs text-stamp uppercase tracking-[0.1em] mb-1">
            vault load error
          </div>
          <p className="text-sm text-ink-soft">{error}</p>
        </div>
      )}

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mb-16 pb-12 border-b border-dashed border-rule">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-2">
              {stat.label}
            </div>
            <div className="font-serif text-3xl text-ink">
              {isLoading ? "—" : stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <section className="mb-16">
        <h2 className="font-serif italic text-base text-marginalia mb-6">
          — what would you like to do?
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/chat"
            className="block bg-paper-shade border border-rule hover:border-ink transition-colors p-6 group"
          >
            <div className="font-serif italic text-sm text-marginalia mb-3">
              i.
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">
              Talk to your agent
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Build memory through conversation. Save recipients, preferences,
              and rules — all from chat.
            </p>
            <span className="font-mono text-xs text-fountain group-hover:translate-x-0.5 inline-block transition-transform">
              open chat →
            </span>
          </Link>

          <Link
            href="/dashboard/policies"
            className="block bg-paper-shade border border-rule hover:border-ink transition-colors p-6 group"
          >
            <div className="font-serif italic text-sm text-marginalia mb-3">
              ii.
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">
              View policies
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Browse and edit what your agent knows.
            </p>
            <span className="font-mono text-xs text-fountain group-hover:translate-x-0.5 inline-block transition-transform">
              view policies →
            </span>
          </Link>

          <Link
            href="/dashboard/access"
            className="block bg-paper-shade border border-rule hover:border-ink transition-colors p-6 group"
          >
            <div className="font-serif italic text-sm text-marginalia mb-3">
              iii.
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">
              App access
            </h3>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Grant or revoke per-app access to your vault.
            </p>
            <span className="font-mono text-xs text-fountain group-hover:translate-x-0.5 inline-block transition-transform">
              manage access →
            </span>
          </Link>
        </div>
      </section>

      {/* Recent memories */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif italic text-base text-marginalia">
            — recent memories
          </h2>
          {totalMemories > 6 && (
            <Link
              href="/dashboard/policies"
              className="font-mono text-xs text-ink-soft hover:text-ink border-b border-ink-soft/40 hover:border-ink pb-0.5 transition-colors"
            >
              view all {totalMemories} →
            </Link>
          )}
        </div>

        {isLoading && (
          <div className="font-serif italic text-sm text-ink-faint py-12 text-center">
            consulting your vault…
          </div>
        )}

        {!isLoading && totalMemories === 0 && (
          <div className="border border-dashed border-rule py-16 px-8 text-center">
            <h3 className="font-serif text-2xl text-ink-soft mb-3">
              Your vault is empty.
            </h3>
            <p className="font-serif italic text-sm text-ink-faint mb-6 max-w-md mx-auto">
              Memory builds from conversation. Tell your agent something to
              remember.
            </p>
            <Link
              href="/dashboard/chat"
              className="text-[14px] font-medium bg-ink text-paper px-5 py-2.5 inline-block hover:bg-paper hover:text-ink border border-ink transition-colors"
            >
              Open chat →
            </Link>
          </div>
        )}

        {!isLoading && recentMemories.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentMemories.map((m) => {
              const cardProps = (() => {
                if (m.type === "saved_recipient") {
                  return {
                    type: "saved recipient",
                    typeColor: "marginalia" as const,
                    timestamp: timeAgo(m.createdAt),
                    title: m.name,
                    body: `${m.chain} · ${m.preferredToken}${m.notes ? ` · ${m.notes}` : ""}`,
                  };
                }
                if (m.type === "preference") {
                  return {
                    type: "preference",
                    typeColor: "marginalia" as const,
                    timestamp: timeAgo(m.createdAt),
                    title: m.title,
                    body: m.body,
                  };
                }
                // payment_log
                return {
                  type: "payment log",
                  typeColor: "sage" as const,
                  timestamp: timeAgo(m.createdAt),
                  title: `Sent ${m.amount} ${m.token} to ${m.recipientName}`,
                  body: `via ${m.chain}`,
                };
              })();

              return (
                <SpecimenCard
                  key={m.id}
                  {...cardProps}
                  hash={m.id}
                />
              );
            })}
          </div>
        )}
      </section>

      <footer className="mt-24 pt-6 border-t border-rule flex items-center justify-between font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em]">
        <span>
          {data?.manifest?.owner
            ? `vault ${data.manifest.owner.slice(0, 6)}…${data.manifest.owner.slice(-4)}`
            : ""}
        </span>
        <span>0g testnet · synced just now</span>
      </footer>
    </div>
  );
}

// Simple relative time formatter
function timeAgo(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixSeconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}