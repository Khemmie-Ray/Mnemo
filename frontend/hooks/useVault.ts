"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  MNEMO_REGISTRY_ABI,
  MNEMO_REGISTRY_ADDRESS,
} from "@/lib/contract/mnemoRegistry";
import {
  type VaultManifest,
  type MemoryChunk,
  type SavedRecipient,
  type Preference,
  type PaymentLog,
} from "@/lib/manifest";
import { downloadJsonFromZeroG } from "@/lib/zerog/download";

type AgentRecord = {
  owner: `0x${string}`;
  vaultManifestHash: string;
  registeredAt: bigint;
  manifestUpdatedAt: bigint;
  exists: boolean;
};

export type VaultData = {
  manifest: VaultManifest | null;
  recipients: SavedRecipient[];
  preferences: Preference[];
  paymentLog: PaymentLog[];
  allChunks: MemoryChunk[];
  totalMemories: number;
};

export type UseVaultResult = {
  data: VaultData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const EMPTY_VAULT: VaultData = {
  manifest: null,
  recipients: [],
  preferences: [],
  paymentLog: [],
  allChunks: [],
  totalMemories: 0,
};

export function useVault(): UseVaultResult {
  const { address } = useAccount();
  const [data, setData] = useState<VaultData | null>(null);
  const [isLoadingChunks, setIsLoadingChunks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: agentData,
    isLoading: isReadingAgent,
    refetch: refetchAgent,
  } = useReadContract({
    address: MNEMO_REGISTRY_ADDRESS,
    abi: MNEMO_REGISTRY_ABI,
    functionName: "getAgent",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const agent = agentData as AgentRecord | undefined;

  const fetchVault = useCallback(async () => {
    if (!agent || !agent.exists || !agent.vaultManifestHash) {
      setData(EMPTY_VAULT);
      return;
    }

    setIsLoadingChunks(true);
    setError(null);

    try {
      const manifest = await downloadJsonFromZeroG<VaultManifest>(
        agent.vaultManifestHash,
      );

      const recipientHashes = manifest.chunks.saved_recipients ?? [];
      const preferenceHashes = manifest.chunks.preferences ?? [];
      const paymentHashes = manifest.chunks.payment_log ?? [];

      const [recipients, preferences, paymentLog] = await Promise.all([
        Promise.all(
          recipientHashes.map((h) => downloadJsonFromZeroG<SavedRecipient>(h)),
        ),
        Promise.all(
          preferenceHashes.map((h) => downloadJsonFromZeroG<Preference>(h)),
        ),
        Promise.all(
          paymentHashes.map((h) => downloadJsonFromZeroG<PaymentLog>(h)),
        ),
      ]);

      const allChunks: MemoryChunk[] = [
        ...recipients,
        ...preferences,
        ...paymentLog,
      ].sort((a, b) => b.createdAt - a.createdAt);

      setData({
        manifest,
        recipients,
        preferences,
        paymentLog,
        allChunks,
        totalMemories: allChunks.length,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load vault";
      console.error("Vault load error:", err);
      setError(message);
      setData(EMPTY_VAULT);
    } finally {
      setIsLoadingChunks(false);
    }
  }, [agent]);

  useEffect(() => {
    if (agent !== undefined) {
      fetchVault();
    }
  }, [agent, fetchVault]);

  const refetch = useCallback(async () => {
    await refetchAgent();
    await fetchVault();
  }, [refetchAgent, fetchVault]);

  return {
    data,
    isLoading: isReadingAgent || isLoadingChunks,
    error,
    refetch,
  };
}