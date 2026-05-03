"use client";

import { useState } from "react";
import Link from "next/link";
import { useVault } from "@/hooks/useVault";

type Category = "recipients" | "preferences" | "payments";

const categories: {
  id: Category;
  label: string;
  section: string;
}[] = [
  { id: "recipients", label: "Saved recipients", section: "i." },
  { id: "preferences", label: "Preferences", section: "ii." },
  { id: "payments", label: "Payment log", section: "iii." },
];

export default function PoliciesPage() {
  const [active, setActive] = useState<Category>("recipients");
  const { data, isLoading, error } = useVault();

  const counts = {
    recipients: data?.recipients.length ?? 0,
    preferences: data?.preferences.length ?? 0,
    payments: data?.paymentLog.length ?? 0,
  };

  return (
    <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
      <header className="pb-6 border-b border-rule mb-10">
        <div className="font-mono text-xs text-ink-faint uppercase tracking-[0.15em] mb-2">
          appendix · policies & memory
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-ink">
          Things your agent knows.
        </h1>
        <p className="font-serif italic text-sm text-marginalia mt-2">
          everything here lives on 0g — owned by your wallet, encrypted later.
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 border border-stamp/40 bg-stamp/5">
          <div className="font-mono text-xs text-stamp uppercase tracking-widest mb-1">
            vault load error
          </div>
          <p className="text-sm text-ink-soft">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12">
        <aside>
          <div className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.12em] mb-4">
            Index
          </div>
          <ul className="space-y-1">
            {categories.map((cat) => {
              const isActive = active === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => setActive(cat.id)}
                    className={`w-full text-left flex items-baseline gap-3 px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-paper-shade text-ink"
                        : "text-ink-soft hover:bg-paper-shade hover:text-ink"
                    }`}
                  >
                    <span
                      className={`font-serif italic text-sm ${
                        isActive ? "text-marginalia" : "text-ink-faint"
                      }`}
                    >
                      {cat.section}
                    </span>
                    <span className="font-serif text-base flex-1">
                      {cat.label}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">
                      {counts[cat.id]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 pt-6 border-t border-dashed border-rule">
            <div className="font-serif italic text-xs text-ink-faint leading-relaxed mb-4">
              Memories are added through chat. Tell your agent something to remember and confirm the proposal.
            </div>
            <Link
              href="/dashboard/chat"
              className="font-mono text-xs text-fountain border-b border-fountain pb-0.5 hover:text-fountain-deep"
            >
              open chat →
            </Link>
          </div>
        </aside>
        <section>
          {isLoading && (
            <div className="font-serif italic text-sm text-ink-faint py-12">
              consulting your vault…
            </div>
          )}

          {!isLoading && active === "recipients" && (
            <RecipientsList recipients={data?.recipients ?? []} />
          )}

          {!isLoading && active === "preferences" && (
            <PreferencesList preferences={data?.preferences ?? []} />
          )}

          {!isLoading && active === "payments" && (
            <PaymentsList payments={data?.paymentLog ?? []} />
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ message, link }: { message: string; link?: string }) {
  return (
    <div className="border border-dashed border-rule py-16 px-8 text-center">
      <h3 className="font-serif text-xl text-ink-soft mb-3">Nothing here yet.</h3>
      <p className="font-serif italic text-sm text-ink-faint mb-6 max-w-md mx-auto">
        {message}
      </p>
      {link && (
        <Link
          href={link}
          className="text-[14px] font-medium bg-ink text-paper px-5 py-2.5 inline-block hover:bg-paper hover:text-ink border border-ink transition-colors"
        >
          Open chat →
        </Link>
      )}
    </div>
  );
}

function RecipientsList({ recipients }: { recipients: any[] }) {
  if (recipients.length === 0) {
    return (
      <EmptyState
        message="Save people you pay regularly. Tell your agent something like 'save my mom's address as 0x... on Celo, prefers USDC'."
        link="/dashboard/chat"
      />
    );
  }
  return (
    <div className="space-y-1">
      <h2 className="font-serif italic text-base text-marginalia mb-6">
        — saved recipients
      </h2>
      {recipients.map((r, i) => (
        <article
          key={r.id}
          className={`grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-6 ${
            i !== recipients.length - 1
              ? "border-b border-dashed border-rule"
              : ""
          }`}
        >
          <div>
            <div className="font-serif text-lg text-ink">{r.name}</div>
            {r.notes && (
              <div className="font-serif italic text-sm text-ink-faint mt-1">
                {r.notes}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] text-marginalia border border-marginalia px-2 py-0.5">
                {r.chain}
              </span>
              <span className="font-serif italic text-sm text-fountain">
                — prefers {r.preferredToken}
              </span>
            </div>
            <code className="font-mono text-xs text-ink-faint block break-all">
              {r.address}
            </code>
          </div>
        </article>
      ))}
    </div>
  );
}

function PreferencesList({ preferences }: { preferences: any[] }) {
  if (preferences.length === 0) {
    return (
      <EmptyState
        message="Tell your agent how you want to be treated. 'Remember that I prefer concise responses' or 'Remember my monthly subscription cap is $80'."
        link="/dashboard/chat"
      />
    );
  }
  return (
    <div className="space-y-1">
      <h2 className="font-serif italic text-base text-marginalia mb-6">
        — preferences
      </h2>
      {preferences.map((p, i) => (
        <article
          key={p.id}
          className={`grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-6 ${
            i !== preferences.length - 1
              ? "border-b border-dashed border-rule"
              : ""
          }`}
        >
          <div className="font-serif text-lg text-ink">{p.title}</div>
          <p className="text-sm text-ink-soft leading-relaxed">{p.body}</p>
        </article>
      ))}
    </div>
  );
}

function PaymentsList({ payments }: { payments: any[] }) {
  if (payments.length === 0) {
    return (
      <EmptyState
        message="Payment history will appear here once you send through chat."
        link="/dashboard/chat"
      />
    );
  }
  return (
    <div className="space-y-1">
      <h2 className="font-serif italic text-base text-marginalia mb-6">
        — payment log
      </h2>
      {payments.map((p, i) => (
        <article
          key={p.id}
          className={`grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 py-6 ${
            i !== payments.length - 1
              ? "border-b border-dashed border-rule"
              : ""
          }`}
        >
          <div>
            <div className="font-serif text-lg text-ink">
              {p.amount} {p.token}
            </div>
            <div className="font-serif italic text-sm text-ink-faint mt-1">
              to {p.recipientName}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-serif italic text-sm text-ink-soft">
              on {p.chain}
            </div>
            <a
              href={`https://chainscan-galileo.0g.ai/tx/${p.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-fountain hover:text-fountain-deep border-b border-fountain pb-0.5 break-all inline-block"
            >
              {p.txHash}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}