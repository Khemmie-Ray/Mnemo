"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  MNEMO_REGISTRY_ABI,
  MNEMO_REGISTRY_ADDRESS,
} from "@/lib/contract/mnemoRegistry";

export type GrantPhase =
  | "idle"
  | "signing"
  | "confirming"
  | "done"
  | "error";

export type PolicyType = "saved_recipients" | "preferences" | "payment_log";

export type GrantInput = {
  app: `0x${string}`;
  policyTypes: PolicyType[];
  expiresAt: bigint;
};

export function useGrantAccess() {
  const { address } = useAccount();
  const [phase, setPhase] = useState<GrantPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const {
    writeContractAsync,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });


  if (phase === "confirming" && isConfirmed) {
    setPhase("done");
  }

  const grant = useCallback(
    async (input: GrantInput) => {
      if (!address) {
        setError("No wallet connected");
        setPhase("error");
        return;
      }

      if (input.policyTypes.length === 0) {
        setError("Pick at least one policy type to share");
        setPhase("error");
        return;
      }

      setError(null);
      resetWrite();

      try {
        setPhase("signing");
        await writeContractAsync({
          address: MNEMO_REGISTRY_ADDRESS,
          abi: MNEMO_REGISTRY_ABI,
          functionName: "grantAccess",
          args: [input.app, input.policyTypes, input.expiresAt],
        });
        setPhase("confirming");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Grant failed";
        setError(message);
        setPhase("error");
      }
    },
    [address, writeContractAsync, resetWrite],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    resetWrite();
  }, [resetWrite]);

  return {
    grant,
    phase,
    error,
    txHash,
    isBusy: phase === "signing" || phase === "confirming",
    reset,
  };
}