"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { MNEMO_REGISTRY_ADDRESS } from "@/lib/contract/mnemoRegistry";

export type AccessGrantRecord = {
  app: `0x${string}`;
  policyTypes: string[];
  grantedAt: number;
  expiresAt: number;
  isExpired: boolean;
};

const GRANTED_EVENT = parseAbiItem(
  "event AccessGranted(address indexed user, address indexed app, string[] policyTypes, uint64 expiresAt, uint256 nonce)",
);

const REVOKED_EVENT = parseAbiItem(
  "event AccessRevoked(address indexed user, address indexed app, uint256 nonce)",
);

export function useAccessGrants() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [grants, setGrants] = useState<AccessGrantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!address || !publicClient) {
      setGrants([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [grantedLogs, revokedLogs] = await Promise.all([
        publicClient.getLogs({
          address: MNEMO_REGISTRY_ADDRESS,
          event: GRANTED_EVENT,
          args: { user: address } as any, 
          fromBlock: "earliest",
          toBlock: "latest",
        }),
        publicClient.getLogs({
          address: MNEMO_REGISTRY_ADDRESS,
          event: REVOKED_EVENT,
          args: { user: address } as any,
          fromBlock: "earliest",
          toBlock: "latest",
        }),
      ]);

      const revocations = new Map<string, bigint>();
      for (const log of revokedLogs) {
        const app = log.args.app!.toLowerCase();
        const nonce = log.args.nonce!;
        const current = revocations.get(app);
        if (!current || nonce > current) {
          revocations.set(app, nonce);
        }
      }

      const latestGrantByApp = new Map<
        string,
        {
          policyTypes: string[];
          grantedAt: number;
          expiresAt: number;
          nonce: bigint;
        }
      >();

     
      for (const log of grantedLogs) {
        const app = log.args.app!.toLowerCase();
        const nonce = log.args.nonce!;
        const existing = latestGrantByApp.get(app);

        if (!existing || nonce > existing.nonce) {
          latestGrantByApp.set(app, {
            policyTypes: log.args.policyTypes! as string[],
           
            grantedAt: Math.floor(Date.now() / 1000), 
            expiresAt: Number(log.args.expiresAt!),
            nonce,
          });
        }
      }

      const now = Math.floor(Date.now() / 1000);
      const active: AccessGrantRecord[] = [];

      for (const [appLower, grant] of latestGrantByApp.entries()) {
        const revokedAtNonce = revocations.get(appLower);
        if (revokedAtNonce !== undefined && revokedAtNonce >= grant.nonce) {
          continue;
        }
        active.push({
          app: appLower as `0x${string}`,
          policyTypes: grant.policyTypes,
          grantedAt: grant.grantedAt,
          expiresAt: grant.expiresAt,
          isExpired: grant.expiresAt !== 0 && now > grant.expiresAt,
        });
      }

      active.sort((a, b) => b.grantedAt - a.grantedAt);
      setGrants(active);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load access grants";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { grants, isLoading, error, refetch };
}