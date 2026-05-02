"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { useGrantAccess, type PolicyType } from "@/hooks/useGrantAccess";
import { useAccessGrants } from "@/hooks/useAccessGrants";

const POLICY_OPTIONS: { id: PolicyType; label: string }[] = [
  { id: "saved_recipients", label: "Saved recipients" },
  { id: "preferences", label: "Preferences" },
  { id: "payment_log", label: "Payment log" },
];

const EXPIRY_OPTIONS = [
  { label: "Never expires", value: 0 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

export default function AccessPage() {
  const { address } = useAccount();
  const { grant, phase: grantPhase, error: grantError, isBusy, reset } = useGrantAccess();
  const { grants, isLoading: isLoadingGrants, error: grantsError, refetch } = useAccessGrants();

  const [appAddress, setAppAddress] = useState("");
  const [selectedPolicies, setSelectedPolicies] = useState<Set<PolicyType>>(
    new Set(),
  );
  const [expiryDays, setExpiryDays] = useState<number>(0);

  if (grantPhase === "done") {
    toast.success("Access granted");
    refetch();
    setAppAddress("");
    setSelectedPolicies(new Set());
    setExpiryDays(0);
    reset();
  }

  if (grantPhase === "error" && grantError) {
    toast.error(grantError);
    reset();
  }

  const togglePolicy = (id: PolicyType) => {
    const next = new Set(selectedPolicies);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPolicies(next);
  };

  const handleGrant = async () => {
    if (!appAddress.startsWith("0x") || appAddress.length !== 42) {
      toast.error("Invalid app address");
      return;
    }
    if (selectedPolicies.size === 0) {
      toast.error("Pick at least one policy type to share");
      return;
    }

    const expiresAt =
      expiryDays === 0
        ? 0n
        : BigInt(Math.floor(Date.now() / 1000) + expiryDays * 86400);

    await grant({
      app: appAddress as `0x${string}`,
      policyTypes: Array.from(selectedPolicies),
      expiresAt,
    });
  };

  const buttonLabel = (() => {
    if (grantPhase === "signing") return "confirm in wallet…";
    if (grantPhase === "confirming") return "granting on chain…";
    return "grant access";
  })();

  return (
    <div className="max-w-5xl mx-auto px-8 md:px-12 py-12">
      <header className="pb-6 border-b border-rule mb-10">
        <div className="font-mono text-xs text-ink-faint uppercase tracking-[0.15em] mb-2">
          access · who can read your vault
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">
          Apps you trust.
        </h1>
        <p className="font-serif italic text-sm text-marginalia mt-2">
          grant specific apps permission to read specific policy types — revoke any time.
        </p>
      </header>
      <section className="mb-16">
        <h2 className="font-serif italic text-base text-marginalia mb-6">
          — grant new access
        </h2>

        <div className="bg-paper-shade border border-rule p-6 space-y-6">
          <div>
            <label className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-2 block">
              App address
            </label>
            <input
              type="text"
              value={appAddress}
              onChange={(e) => setAppAddress(e.target.value)}
              placeholder="0x..."
              disabled={isBusy}
              className="w-full bg-paper border border-rule px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none transition-colors disabled:opacity-40"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-3 block">
              Policy types they can read
            </label>
            <div className="flex flex-wrap gap-2">
              {POLICY_OPTIONS.map((opt) => {
                const isSelected = selectedPolicies.has(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => togglePolicy(opt.id)}
                    disabled={isBusy}
                    className={`text-[13px] px-4 py-2 border transition-colors disabled:opacity-40 ${
                      isSelected
                        ? "bg-ink text-paper border-ink"
                        : "bg-transparent text-ink-soft border-rule hover:border-ink hover:text-ink"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-3 block">
              Access duration
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPIRY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setExpiryDays(opt.value)}
                  disabled={isBusy}
                  className={`text-[13px] px-4 py-2 border transition-colors disabled:opacity-40 ${
                    expiryDays === opt.value
                      ? "bg-ink text-paper border-ink"
                      : "bg-transparent text-ink-soft border-rule hover:border-ink hover:text-ink"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={handleGrant}
              disabled={isBusy || !appAddress || selectedPolicies.size === 0}
              className="text-[14px] font-medium bg-ink text-paper px-5 py-2.5 hover:bg-paper hover:text-ink border border-ink transition-colors disabled:opacity-40"
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif italic text-base text-marginalia">
            — apps with access
          </h2>
          {grants.length > 0 && (
            <span className="font-mono text-xs text-ink-faint">
              {grants.length} {grants.length === 1 ? "app" : "apps"}
            </span>
          )}
        </div>

        {grantsError && (
          <div className="mb-4 p-4 border border-stamp/40 bg-stamp/5">
            <p className="text-sm text-ink-soft">{grantsError}</p>
          </div>
        )}

        {isLoadingGrants && (
          <div className="font-serif italic text-sm text-ink-faint py-12 text-center">
            consulting your access list…
          </div>
        )}

        {!isLoadingGrants && grants.length === 0 && (
          <div className="border border-dashed border-rule py-16 px-8 text-center">
            <h3 className="font-serif text-xl text-ink-soft mb-3">
              No apps have access yet.
            </h3>
            <p className="font-serif italic text-sm text-ink-faint max-w-md mx-auto">
              Grant an app permission above and it will appear here. Revocation
              is on-chain and immediate.
            </p>
          </div>
        )}

        {!isLoadingGrants && grants.length > 0 && (
          <div className="border border-rule">
            <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-3 border-b border-rule bg-paper-shade font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
              <div>App</div>
              <div>Policy types</div>
              <div>Expires</div>
              <div></div>
            </div>
            {grants.map((g) => (
              <div
                key={g.app}
                className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-4 border-b border-dashed border-rule last:border-b-0 items-center"
              >
                <div>
                  <code className="font-mono text-xs text-ink break-all">
                    {g.app}
                  </code>
                  <div className="font-serif italic text-[11px] text-ink-faint mt-1">
                    granted {timeAgo(g.grantedAt)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {g.policyTypes.map((p) => (
                    <span
                      key={p}
                      className="font-mono text-[10px] uppercase tracking-[0.08em] text-marginalia border border-marginalia px-2 py-0.5"
                    >
                      {p.replace("_", " ")}
                    </span>
                  ))}
                </div>

                <div className="font-serif italic text-sm">
                  {g.expiresAt === 0 ? (
                    <span className="text-ink-soft">never</span>
                  ) : g.isExpired ? (
                    <span className="text-stamp">expired</span>
                  ) : (
                    <span className="text-ink-soft">
                      {formatDate(g.expiresAt)}
                    </span>
                  )}
                </div>

                <div>
                  <button
                    disabled
                    title="Revoke flow ships in v2"
                    className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint border border-rule px-3 py-1.5 cursor-not-allowed opacity-50"
                  >
                    revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 font-serif italic text-xs text-ink-faint leading-relaxed">
          Access grants are stored on 0G Chain. Other apps verify their permission
          by calling <code className="font-mono">hasAccess()</code> on the Mnemo
          contract before reading from your vault.
        </div>
      </section>
    </div>
  );
}

function timeAgo(unix: number) {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(unix: number) {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}