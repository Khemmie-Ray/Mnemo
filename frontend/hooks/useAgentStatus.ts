"use client";

import { useAccount, useReadContract } from "wagmi";
import {
  MNEMO_REGISTRY_ABI,
  MNEMO_REGISTRY_ADDRESS,
} from "@/lib/contract/mnemoRegistry";

type AgentRecord = {
  owner: `0x${string}`;
  vaultManifestHash: string;
  registeredAt: bigint;
  manifestUpdatedAt: bigint;
  exists: boolean;
};

export type AgentStatus = {
  address: `0x${string}` | undefined;
  isRegistered: boolean;
  isLoading: boolean;
  needsRegistration: boolean;
  queryKey: readonly unknown[] | undefined;
  refetch: () => void;
};

export function useAgentStatus(): AgentStatus {
  const { address, isConnecting, isReconnecting } = useAccount();

  const {
    data,
    isLoading: isReading,
    queryKey,
    refetch,
  } = useReadContract({
    address: MNEMO_REGISTRY_ADDRESS,
    abi: MNEMO_REGISTRY_ABI,
    functionName: "getAgent",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const agent = data as AgentRecord | undefined;

  const isLoading = isConnecting || isReconnecting || (!!address && isReading);
  const exists = agent?.exists === true;

  return {
    address,
    isRegistered: !!address && exists,
    isLoading,
    needsRegistration: !!address && !isLoading && !exists,
    queryKey,
    refetch,
  };
}