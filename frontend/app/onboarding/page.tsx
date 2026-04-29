"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

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
  const router = useRouter();
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const {
    writeContractAsync,
    data: txHash,
    isPending: isRegistering,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isRegistered } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isConnected && address && active === 0) {
      setActive(1);
    }
  }, [isConnected, address, active]);

  useEffect(() => {
    if (isRegistered && active === 1) {
      toast.success("Agent registered on 0G");
      setActive(2);
    }
  }, [isRegistered, active]);

  const handleConnect = async () => {
    await open();
  };

  const handleRegister = async () => {
    try {
      const placeholderManifestHash = "ipfs-placeholder-hash";

      await writeContractAsync({
        address: "0x0000000000000000000000000000000000000000",
        abi: [],
        functionName: "registerAgent",
        args: [placeholderManifestHash],
      });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
      resetWrite();
    }
  };

  const handleOpenDashboard = () => {
    router.push("/dashboard");
  };

  const renderStepButton = (stepIndex: number) => {
    const label = steps[stepIndex].cta;
    const baseClass =
      "text-[14px] font-medium bg-ink text-paper px-5 py-2.5 border border-ink/10 hover:bg-paper hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    if (stepIndex === 0) {
      return (
        <button onClick={handleConnect} className={baseClass}>
          {isConnected ? "Wallet connected ✓" : label}
        </button>
      );
    }

    if (stepIndex === 1) {
      const busy = isRegistering || isConfirming;
      const buttonLabel = isRegistering
        ? "Confirm in wallet…"
        : isConfirming
          ? "Registering on 0G…"
          : label;
      return (
        <button onClick={handleRegister} disabled={busy} className={baseClass}>
          {buttonLabel}
        </button>
      );
    }

    return (
      <button onClick={handleOpenDashboard} className={baseClass}>
        {label}
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
          new vault — step {active + 1} of {steps.length}
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 md:px-10 py-16">
        <div className="max-w-2xl w-full">
          <div className="font-serif italic text-sm text-marginalia mb-4 flex items-center gap-3">
            <span className="block w-8 h-px bg-marginalia opacity-40" />
            establishing your memory vault
          </div>

          <h1 className="font-serif text-4xl md:text-5xl leading-[1.1] text-ink mb-12">
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
                    </>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="border-t border-dashed border-rule pt-6">
            <p className="font-serif italic text-sm text-ink-faint leading-relaxed max-w-md">
              The transaction in step ii will request a small amount of 0G gas.
              If you need testnet funds, the faucet is{" "}
              <Link
                href="https://faucet.0g.ai"
                className="text-fountain border-b border-fountain"
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
