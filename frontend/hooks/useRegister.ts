"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  MNEMO_REGISTRY_ABI,
  MNEMO_REGISTRY_ADDRESS,
} from "@/lib/contract/mnemoRegistry";
import { buildEmptyManifest } from "@/lib/manifest";

type Phase = "idle" | "uploading" | "signing" | "confirming" | "done" | "error";

export function useRegisterAgent() {
  const { address } = useAccount();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rootHash, setRootHash] = useState<string | null>(null);

  const {
    writeContractAsync,
    data: txHash,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  const register = async (vaultName?: string) => {
    if (!address) {
      setError("No wallet connected");
      setPhase("error");
      return;
    }

    setError(null);
    resetWrite();

    try {
      
      setPhase("uploading");
      const manifest = buildEmptyManifest(address, vaultName);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manifest),
      });

      if (!res.ok) {
        const { error: uploadError } = await res.json().catch(() => ({}));
        throw new Error(uploadError ?? "Upload to 0G failed");
      }

      const { rootHash: hash } = (await res.json()) as { rootHash: string };
      setRootHash(hash);

      setPhase("signing");
      await writeContractAsync({
        address: MNEMO_REGISTRY_ADDRESS,
        abi: MNEMO_REGISTRY_ABI,
        functionName: "registerAgent",
        args: [hash],
      });

      setPhase("confirming");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      setPhase("error");
    }
  };

  if (phase === "confirming" && isConfirmed) {
    setPhase("done");
  }

  return {
    register,
    phase,
    error,
    rootHash,
    txHash,
    isConfirming,
  };
}
