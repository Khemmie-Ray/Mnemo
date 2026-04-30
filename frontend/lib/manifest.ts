export type ManifestChunks = {
  saved_recipients?: string[];
  preferences?: string[];
  payment_rules?: string[];
  conversation?: string[];
  payment_log?: string[];
};

export type VaultManifest = {
  version: number;
  owner: `0x${string}`;
  name: string;
  createdAt: number;
  updatedAt: number;
  chunks: ManifestChunks;
};

export function buildEmptyManifest(
  owner: `0x${string}`,
  name = "My Vault"
): VaultManifest {
  const now = Math.floor(Date.now() / 1000);
  return {
    version: 1,
    owner,
    name,
    createdAt: now,
    updatedAt: now,
    chunks: {
      saved_recipients: [],
      preferences: [],
      payment_rules: [],
      conversation: [],
      payment_log: [],
    },
  };
}