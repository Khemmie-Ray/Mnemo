"use client";

import { useState } from "react";

type Category = "recipients" | "rules" | "preferences";

const categories: { id: Category; label: string; count: number; section: string }[] = [
  { id: "recipients", label: "Saved recipients", count: 4, section: "i." },
  { id: "rules", label: "Payment rules", count: 3, section: "ii." },
  { id: "preferences", label: "Preferences", count: 6, section: "iii." },
];

const recipients = [
  {
    name: "Mom",
    note: "Lagos, Nigeria",
    chains: ["Celo", "Ethereum"],
    preferred: "USDC on Celo",
    address: "0x9f2c7a3b4e1d8c0f5a6b...e4d1",
    extra: "Prefers MiniPay receipts. Round to nearest 10 when sending.",
  },
  {
    name: "Landlord — Mr. Adeyemi",
    note: "Monthly rent",
    chains: ["Bank transfer"],
    preferred: "NGN bank transfer",
    address: "GTBank · 0123456789",
    extra: "Due 1st of each month. Late fee after the 5th.",
  },
  {
    name: "Tobi",
    note: "Brother",
    chains: ["Base"],
    preferred: "USDC on Base",
    address: "0x4af2901c3d8e5b...19db",
    extra: "Splitting bills — usually $20–80 range.",
  },
  {
    name: "Workers' co-op",
    note: "Quarterly dues",
    chains: ["Celo"],
    preferred: "cUSD on Celo",
    address: "0x8c7e3a91...b240",
    extra: "₦15,000 equivalent every quarter.",
  },
];

const rules = [
  {
    name: "Monthly subscription cap",
    body: "Soft warn at $80, hard stop at $120 across all recurring services.",
    triggers: "Subscription category",
  },
  {
    name: "No transactions past 11pm",
    body: "Anything outside business hours requires explicit confirmation, no exceptions.",
    triggers: "Time-based",
  },
  {
    name: "Approval required over $200",
    body: "For any single transaction above this amount, ask before executing.",
    triggers: "Amount threshold",
  },
];

const preferences = [
  {
    name: "Concise responses",
    body: "Skip preamble. Answer the question first, expand only if asked.",
  },
  {
    name: "Working hours",
    body: "Schedule meetings between 10:00 and 16:00 WAT, no Fridays.",
  },
  {
    name: "Documentation style",
    body: "Conversational and accessible. Avoid jargon when explaining to newcomers.",
  },
  {
    name: "Default chain preference",
    body: "Prefer Celo for personal transfers, Base for development work.",
  },
  {
    name: "Receipts",
    body: "Always send a receipt confirmation after any payment over $20.",
  },
  {
    name: "Language",
    body: "Default to English, but understand Yoruba phrases when used.",
  },
];

export default function PoliciesPage() {
  const [active, setActive] = useState<Category>("recipients");

  return (
    <div className="max-w-6xl mx-auto px-8 md:px-12 py-12">
      <header className="pb-6 border-b border-[var(--color-rule)] mb-10">
        <div className="font-mono text-xs text-[var(--color-ink-faint)] uppercase tracking-[0.15em] mb-2">
          appendix · policies & rules
        </div>
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-4xl md:text-5xl text-[var(--color-ink)]">
            Things your agent should know.
          </h1>
          <button className="stamp-button outline text-xs hidden md:inline-flex">
            + add new
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[260px_1fr] gap-12">
        {/* Index — left column */}
        <aside>
          <div className="font-mono text-[10px] text-[var(--color-ink-faint)] uppercase tracking-[0.12em] mb-4">
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
                        ? "bg-[var(--color-paper-shade)] text-[var(--color-ink)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-shade)] hover:text-[var(--color-ink)]"
                    }`}
                  >
                    <span
                      className={`font-serif italic text-sm ${
                        isActive
                          ? "text-[var(--color-marginalia)]"
                          : "text-[var(--color-ink-faint)]"
                      }`}
                    >
                      {cat.section}
                    </span>
                    <span className="font-serif text-base flex-1">
                      {cat.label}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-ink-faint)]">
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 pt-6 border-t border-dashed border-[var(--color-rule)]">
            <div className="font-serif italic text-xs text-[var(--color-ink-faint)] leading-relaxed">
              Each policy is encrypted with your wallet's keys before being
              stored on 0G. Only you can read them.
            </div>
          </div>
        </aside>

        {/* Detail — right column */}
        <section>
          {active === "recipients" && (
            <div className="space-y-1">
              <h2 className="font-serif italic text-base text-[var(--color-marginalia)] mb-6">
                — saved recipients
              </h2>
              {recipients.map((r, i) => (
                <article
                  key={r.name}
                  className={`grid grid-cols-[180px_1fr_auto] gap-6 py-6 ${
                    i !== recipients.length - 1
                      ? "border-b border-dashed border-[var(--color-rule)]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-serif text-lg text-[var(--color-ink)]">
                      {r.name}
                    </div>
                    <div className="font-serif italic text-sm text-[var(--color-ink-faint)] mt-1">
                      {r.note}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {r.chains.map((c) => (
                        <span
                          key={c}
                          className="font-mono text-[10px] text-[var(--color-marginalia)] border border-[var(--color-marginalia)] px-2 py-0.5"
                        >
                          {c}
                        </span>
                      ))}
                      <span className="font-serif italic text-sm text-[var(--color-fountain)] ml-1">
                        — prefers {r.preferred}
                      </span>
                    </div>
                    <code className="font-mono text-xs text-[var(--color-ink-faint)] block">
                      {r.address}
                    </code>
                    <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                      {r.extra}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <button className="font-mono text-[10px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] uppercase tracking-[0.1em]">
                      edit
                    </button>
                    <button className="font-mono text-[10px] text-[var(--color-stamp)] hover:opacity-70 uppercase tracking-[0.1em]">
                      remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {active === "rules" && (
            <div className="space-y-1">
              <h2 className="font-serif italic text-base text-[var(--color-marginalia)] mb-6">
                — payment rules
              </h2>
              {rules.map((r, i) => (
                <article
                  key={r.name}
                  className={`grid grid-cols-[180px_1fr_auto] gap-6 py-6 ${
                    i !== rules.length - 1
                      ? "border-b border-dashed border-[var(--color-rule)]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="font-serif text-lg text-[var(--color-ink)]">
                      {r.name}
                    </div>
                    <div className="font-mono text-[10px] text-[var(--color-ink-faint)] uppercase tracking-[0.1em] mt-1">
                      {r.triggers}
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                    {r.body}
                  </p>
                  <div className="flex flex-col gap-2 text-right">
                    <button className="font-mono text-[10px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] uppercase tracking-[0.1em]">
                      edit
                    </button>
                    <button className="font-mono text-[10px] text-[var(--color-stamp)] hover:opacity-70 uppercase tracking-[0.1em]">
                      remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {active === "preferences" && (
            <div className="space-y-1">
              <h2 className="font-serif italic text-base text-[var(--color-marginalia)] mb-6">
                — preferences
              </h2>
              {preferences.map((p, i) => (
                <article
                  key={p.name}
                  className={`grid grid-cols-[180px_1fr_auto] gap-6 py-6 ${
                    i !== preferences.length - 1
                      ? "border-b border-dashed border-[var(--color-rule)]"
                      : ""
                  }`}
                >
                  <div className="font-serif text-lg text-[var(--color-ink)]">
                    {p.name}
                  </div>
                  <p className="text-sm text-[var(--color-ink-soft)] leading-relaxed">
                    {p.body}
                  </p>
                  <div className="flex flex-col gap-2 text-right">
                    <button className="font-mono text-[10px] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] uppercase tracking-[0.1em]">
                      edit
                    </button>
                    <button className="font-mono text-[10px] text-[var(--color-stamp)] hover:opacity-70 uppercase tracking-[0.1em]">
                      remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
