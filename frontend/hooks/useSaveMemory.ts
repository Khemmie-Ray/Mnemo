"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  MNEMO_REGISTRY_ABI,
  MNEMO_REGISTRY_ADDRESS,
} from "@/lib/contract/mnemoRegistry";
import {
  type VaultManifest,
  type MemoryChunk,
  type ChunkType,
  generateChunkId,
} from "@/lib/manifest";
import { useVault } from "@/hooks/useVault";

type SavePhase =
  | "idle"
  | "uploading_chunk"
  | "uploading_manifest"
  | "signing"
  | "confirming"
  | "done"
  | "error";

type ChunkInput =
  | { type: "saved_recipient"; data: Omit<Extract<MemoryChunk, { type: "saved_recipient" }>, "type" | "id" | "createdAt"> }
  | { type: "preference"; data: Omit<Extract<MemoryChunk, { type: "preference" }>, "type" | "id" | "createdAt"> }
  | { type: "payment_log"; data: Omit<Extract<MemoryChunk, { type: "payment_log" }>, "type" | "id" | "createdAt"> };

const TYPE_TO_MANIFEST_KEY: Record<ChunkType, keyof VaultManifest["chunks"]> = {
  saved_recipient: "saved_recipients",
  preference: "preferences",
  payment_log: "payment_log",
};

export function useSaveMemory() {
  const { address } = useAccount();
  const { data: vaultData, refetch: refetchVault } = useVault();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<SavePhase>("idle");
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
    refetchVault();
    queryClient.invalidateQueries({ queryKey: ["readContract"] });
  }

  const save = useCallback(
    async (input: ChunkInput) => {
      if (!address || !vaultData?.manifest) {
        setError("Vault not ready");
        setPhase("error");
        return;
      }

      setError(null);
      resetWrite();

      try {
        const now = Math.floor(Date.now() / 1000);
        const id = generateChunkId();
        const newChunk: MemoryChunk = {
          ...input.data,
          type: input.type,
          id,
          createdAt: now,
        } as MemoryChunk;

        setPhase("uploading_chunk");
        const chunkRes = await fetch("/api/storage/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newChunk),
        });
        if (!chunkRes.ok) {
          const { error: e } = await chunkRes.json().catch(() => ({}));
          throw new Error(e ?? "Failed to upload chunk");
        }
        const { rootHash: chunkHash } = await chunkRes.json() as {
          rootHash: string;
        };

        const manifestKey = TYPE_TO_MANIFEST_KEY[input.type];
        const newManifest: VaultManifest = {
          ...vaultData.manifest,
          updatedAt: now,
          chunks: {
            ...vaultData.manifest.chunks,
            [manifestKey]: [
              ...(vaultData.manifest.chunks[manifestKey] ?? []),
              chunkHash,
            ],
          },
        };

        setPhase("uploading_manifest");
        const manifestRes = await fetch("/api/storage/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newManifest),
        });
        if (!manifestRes.ok) {
          const { error: e } = await manifestRes.json().catch(() => ({}));
          throw new Error(e ?? "Failed to upload manifest");
        }
        const { rootHash: manifestHash } = await manifestRes.json() as {
          rootHash: string;
        };

        setPhase("signing");
        await writeContractAsync({
          address: MNEMO_REGISTRY_ADDRESS,
          abi: MNEMO_REGISTRY_ABI,
          functionName: "updateVaultManifest",
          args: [manifestHash],
        });

        setPhase("confirming");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Save failed";
        setError(message);
        setPhase("error");
      }
    },
    [address, vaultData, writeContractAsync, resetWrite],
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  return {
    save,
    phase,
    error,
    isBusy:
      phase === "uploading_chunk" ||
      phase === "uploading_manifest" ||
      phase === "signing" ||
      phase === "confirming",
    reset,
  };
}