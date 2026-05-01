"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits } from "viem";
import { useSaveMemory } from "@/hooks/useSaveMemory";
import { type ProposedAction } from "@/hooks/useChat";
import { ERC20_TRANSFER_ABI, getTokenConfig } from "@/lib/contract/token";

export type ReasoningStep = {
  id: string;
  label: string;
  state: "pending" | "active" | "done";
};

export type PaymentPhase =
  | "idle"
  | "reasoning"
  | "awaiting_signature"
  | "broadcasting"
  | "confirming"
  | "logging"
  | "done"
  | "error";

const STEP_DELAY_MS = 600;

export function usePaymentExecution() {
  const { address } = useAccount();
  const { save: saveMemory } = useSaveMemory();

  const [phase, setPhase] = useState<PaymentPhase>("idle");
  const [steps, setSteps] = useState<ReasoningStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedTxHash, setCompletedTxHash] = useState<string | null>(null);

  const {
    writeContractAsync,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const advanceStep = useCallback(
    (stepId: string) =>
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, state: "done" } : s)),
      ),
    [],
  );

  const activateStep = useCallback(
    (stepId: string) =>
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, state: "active" } : s)),
      ),
    [],
  );

  const execute = useCallback(
    async (action: ProposedAction) => {
      if (!address) {
        setError("No wallet connected");
        setPhase("error");
        return;
      }

      const tokenConfig = getTokenConfig(action.token);
      if (!tokenConfig) {
        setError(`Unknown token: ${action.token}`);
        setPhase("error");
        return;
      }

      setError(null);
      resetWrite();
      setCompletedTxHash(null);

      const initialSteps: ReasoningStep[] = [
        {
          id: "read_recipient",
          label: `Reading saved recipient: ${action.recipientName}`,
          state: "pending",
        },
        {
          id: "check_chain",
          label: `Confirming ${action.chain} as preferred chain`,
          state: "pending",
        },
        {
          id: "check_token",
          label: `Confirming ${action.token} as preferred token`,
          state: "pending",
        },
        {
          id: "construct_tx",
          label: `Constructing ${action.amount} ${action.token} transfer`,
          state: "pending",
        },
        {
          id: "request_signature",
          label: "Requesting your signature",
          state: "pending",
        },
      ];

      setSteps(initialSteps);
      setPhase("reasoning");

      for (let i = 0; i < initialSteps.length - 1; i++) {
        const step = initialSteps[i];
        activateStep(step.id);
        await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
        advanceStep(step.id);
      }

      activateStep("request_signature");
      setPhase("awaiting_signature");

      try {
        const amountInUnits = parseUnits(action.amount, tokenConfig.decimals);

        const sentTxHash = await writeContractAsync({
          address: tokenConfig.address,
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [action.to as `0x${string}`, amountInUnits],
        });

        advanceStep("request_signature");
        setPhase("broadcasting");
        setCompletedTxHash(sentTxHash);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction rejected";
        setError(message);
        setPhase("error");
      }
    },
    [
      address,
      writeContractAsync,
      resetWrite,
      activateStep,
      advanceStep,
    ],
  );

  useEffect(() => {
    if (phase === "broadcasting" && completedTxHash && !isConfirmed) {
      setPhase("confirming");
    }
  }, [phase, completedTxHash, isConfirmed]);

  const finalizeIfConfirmed = useCallback(
    async (action: ProposedAction) => {
      if (phase !== "confirming") return;
      if (!isConfirmed || !completedTxHash) return;

      setPhase("logging");

      try {
        await saveMemory({
          type: "payment_log",
          data: {
            recipientName: action.recipientName,
            recipientAddress: action.to as `0x${string}`,
            amount: action.amount,
            token: action.token,
            chain: action.chain,
            txHash: completedTxHash as `0x${string}`,
          },
        });

        setPhase("done");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to log payment";
        setError(message);
        setPhase("error");
      }
    },
    [phase, isConfirmed, completedTxHash, saveMemory],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setSteps([]);
    setError(null);
    setCompletedTxHash(null);
    resetWrite();
  }, [resetWrite]);

  return {
    execute,
    finalizeIfConfirmed,
    phase,
    steps,
    error,
    txHash: completedTxHash,
    reset,
  };
}