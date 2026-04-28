"use client";

import Link from "next/link";
import { useState } from "react";

const steps = [
  {
    num: "i.",
    title: "Connect your wallet",
    body: "Mnemo uses your wallet as the root of identity. The address you connect becomes the owner of your memory vault.",
    cta: "Connect wallet",
  },
  {
    num: "ii.",
    title: "Register your agent",
    body: "We'll create your agent identity on 0G Chain and initialize an empty vault on 0G Storage. One transaction. Yours forever.",
    cta: "Register on 0G",
  },
  {
    num: "iii.",
    title: "You're ready",
    body: "Your vault is live. Start by saving a recipient or telling your agent a preference. Memory builds from there.",
    cta: "Open dashboard",
  },
];

export default function OnboardingPage() {
  const [active, setActive] = useState(0);

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-6xl mx-auto px-6 md:px-10 pt-8 w-full flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-medium tracking-tight text-(--color-ink)">
          Mnemo
        </Link>
        <span className="font-mono text-xs text-(--color-ink-faint)">
          new vault — step {active + 1} of {steps.length}
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-16">
        <div className="max-w-2xl w-full">
          <div className="font-serif italic text-sm text-(--color-marginalia) mb-4 flex items-center gap-3">
            <span className="block w-8 h-px bg-(--color-marginalia) opacity-40" />
            establishing your memory vault
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-(--color-ink) mb-12">
            A first-time ritual.
          </h1>

          <ol className="space-y-2 mb-12">
            {steps.map((step, i) => {
              const isActive = i === active;
              const isDone = i < active;
              return (
                <li
                  key={step.num}
                  className={`border-l-2 pl-6 py-4 transition-colors ${
                    isActive
                      ? "border-(--color-ink) bg-(--color-paper-shade)"
                      : isDone
                        ? "border-(--color-sage)"
                        : "border-(--color-rule)"
                  }`}
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span
                      className={`font-serif italic text-xl ${
                        isActive
                          ? "text-(--color-marginalia)"
                          : isDone
                            ? "text-(--color-sage)"
                            : "text-(--color-ink-faint)"
                      }`}
                    >
                      {step.num}
                    </span>
                    <h2
                      className={`font-serif text-xl ${
                        isActive
                          ? "text-(--color-ink)"
                          : "text-(--color-ink-soft)"
                      }`}
                    >
                      {step.title}
                    </h2>
                    {isDone && (
                      <span className="ml-auto font-mono text-xs text-(--color-sage)">
                        ✓ done
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <>
                      <p className="text-(--color-ink-soft) leading-relaxed mb-5 ml-9 max-w-md">
                        {step.body}
                      </p>
                      <div className="ml-9">
                        {i === steps.length - 1 ? (
                          <Link href="/dashboard" className="text-[14px] font-medium bg-(--color-ink) text-(--color-paper) px-5 py-2.5 border border-(--color-ink)/10 hover:bg-(--color-paper) hover:text-(--color-ink) transition-colors">
                            {step.cta}
                          </Link>
                        ) : (
                          <button
                            onClick={() => setActive(active + 1)}
                            className="text-[14px] font-medium bg-(--color-ink) text-(--color-paper) px-5 py-2.5 border border-(--color-ink)/10 hover:bg-(--color-paper) hover:text-(--color-ink) transition-colors"
                          >
                            {step.cta}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="border-t border-dashed border-(--color-rule) pt-6">
            <p className="font-serif italic text-sm text-(--color-ink-faint) leading-relaxed max-w-md">
              The transaction in step ii will request a small amount of 0G
              gas. If you need testnet funds, the faucet is{" "}
              <Link
                href="https://faucet.0g.ai"
                className="text-(--color-fountain) border-b border-(--color-fountain)"
              >
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
