export type SavedRecipient = {
  type: "saved_recipient";
  id: string; 
  name: string;
  address: `0x${string}`;
  chain: string;
  preferredToken: string;
  notes?: string;
  createdAt: number;
};

export type Preference = {
  type: "preference";
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

export type PaymentLog = {
  type: "payment_log";
  id: string;
  recipientName: string;
  recipientAddress: `0x${string}`;
  amount: string; 
  token: string;
  chain: string;
  txHash: `0x${string}`;
  createdAt: number;
};

export type MemoryChunk = SavedRecipient | Preference | PaymentLog;

export type ChunkType = MemoryChunk["type"];

export type ManifestChunks = {
  saved_recipients?: string[]; // array of rootHashes
  preferences?: string[];
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
  name = "My Vault",
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
      payment_log: [],
    },
  };
}

export function generateChunkId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}