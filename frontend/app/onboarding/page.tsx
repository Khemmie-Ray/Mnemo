"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRegisterAgent } from "@/hooks/useRegister";
import { useAgentStatus } from "@/hooks/useAgentStatus";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const {
    isRegistered,
    isLoading: isCheckingAgent,
    queryKey,
  } = useAgentStatus();
  const { register, phase, error, rootHash } = useRegisterAgent();

  const [active, setActive] = useState(0);

  // Drive `active` from real state instead of local-only logic
  useEffect(() => {
    if (!isConnected || !address) {
      setActive(0);
      return;
    }
    if (isCheckingAgent) return; // wait for the read to settle
    if (isRegistered) {
      setActive(2);
      return;
    }
    if (active === 0) {
      setActive(1);
    }
  }, [isConnected, address, isRegistered, isCheckingAgent, active]);

  // After successful registration: invalidate cache, advance, toast
  useEffect(() => {
    if (phase === "done" && active === 1) {
      toast.success("Agent registered on 0G");
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      setActive(2);
    }
  }, [phase, active, queryKey, queryClient]);

  // Surface registration errors via toast
  useEffect(() => {
    if (phase === "error" && error) {
      toast.error(error);
    }
  }, [phase, error]);

  const handleConnect = async () => {
    await open();
  };

  const handleRegister = async () => {
    await register();
  };

  const handleOpenDashboard = () => {
    router.push("/dashboard");
  };

  const renderStepButton = (stepIndex: number) => {
    const baseClass =
      "text-[14px] font-medium bg-ink text-paper px-5 py-2.5 border border-ink/10 hover:bg-paper hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    if (stepIndex === 0) {
      if (isConnected) {
        return (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[14px] font-medium bg-sage/10 text-sage px-4 py-2.5 border border-sage/30">
              Wallet connected ✓
            </span>
          </div>
        );
      }
      return (
        <button onClick={handleConnect} className={baseClass}>
          {steps[0].cta}
        </button>
      );
    }

    if (stepIndex === 1) {
      const busy =
        phase === "uploading" || phase === "signing" || phase === "confirming";

      const label =
        phase === "uploading"
          ? "Uploading manifest to 0G…"
          : phase === "signing"
            ? "Confirm in wallet…"
            : phase === "confirming"
              ? "Registering on 0G…"
              : steps[1].cta;

      return (
        <button onClick={handleRegister} disabled={busy} className={baseClass}>
          {label}
        </button>
      );
    }

    return (
      <button onClick={handleOpenDashboard} className={baseClass}>
        {steps[2].cta}
      </button>
    );
  };


  return (
    <main className="min-h-screen flex flex-col">
      <nav className="max-w-6xl mx-auto px-6 md:px-10 pt-8 w-full flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-2xl font-medium tracking-tight text-ink"
        >
          Mnemo
        </Link>
        <span className="font-mono text-xs text-ink-faint">
          {isRegistered
            ? "vault present"
            : `new vault — step ${active + 1} of ${steps.length}`}
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-16">
        <div className="max-w-2xl w-full">
          <div className="font-serif italic text-sm text-marginalia mb-4 flex items-center gap-3">
            <span className="block w-8 h-px bg-marginalia opacity-40" />
            {isRegistered
              ? "your vault is already established"
              : "establishing your memory vault"}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-ink mb-12">
            {isRegistered ? "Welcome back." : "A first-time ritual."}
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
                      ? "border-ink bg-paper-shade"
                      : isDone
                        ? "border-sage"
                        : "border-rule"
                  }`}
                >
                  <div className="flex items-baseline gap-4 mb-2">
                    <span
                      className={`font-serif italic text-xl ${
                        isActive
                          ? "text-marginalia"
                          : isDone
                            ? "text-sage"
                            : "text-ink-faint"
                      }`}
                    >
                      {step.num}
                    </span>
                    <h2
                      className={`font-serif text-xl ${
                        isActive ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {step.title}
                    </h2>
                    {isDone && (
                      <span className="ml-auto font-mono text-xs text-sage">
                        ✓ done
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <>
                      <p className="text-ink-soft leading-relaxed mb-5 ml-9 max-w-md">
                        {step.body}
                      </p>
                      <div className="ml-9">{renderStepButton(i)}</div>
                      {i === 1 && rootHash && (
                        <div className="ml-9 mt-3 font-mono text-[10px] text-ink-faint break-all">
                          manifest stored at: {rootHash.slice(0, 14)}…
                          {rootHash.slice(-10)}
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          {!isRegistered && (
            <div className="border-t border-dashed border-rule pt-6">
              <p className="font-serif italic text-sm text-ink-faint leading-relaxed max-w-md">
                The transaction in step ii will request a small amount of 0G
                gas. If you need testnet funds, the faucet is{" "}
                <Link
                  href="https://faucet.0g.ai"
                  className="text-fountain border-b border-fountain"
                >
                  here
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
