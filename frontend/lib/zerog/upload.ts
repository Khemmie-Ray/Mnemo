import { Indexer, MemData } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";

const RPC_URL = process.env.ZEROG_RPC_URL!;
const INDEXER_RPC = process.env.ZEROG_INDEXER_RPC!;
const UPLOAD_PRIVATE_KEY = process.env.ZEROG_UPLOAD_PRIVATE_KEY!;

if (!RPC_URL || !INDEXER_RPC || !UPLOAD_PRIVATE_KEY) {
  throw new Error(
    "Missing 0G env vars: ZEROG_RPC_URL, ZEROG_INDEXER_RPC, ZEROG_UPLOAD_PRIVATE_KEY"
  );
}

let indexer: Indexer | null = null;
let signer: ethers.Wallet | null = null;

function getSigner(): ethers.Wallet {
  if (!signer) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(UPLOAD_PRIVATE_KEY, provider);
  }
  return signer;
}

function getIndexer(): Indexer {
  if (!indexer) {
    indexer = new Indexer(INDEXER_RPC);
  }
  return indexer;
}


export async function uploadJsonToZeroG(data: unknown): Promise<{
  rootHash: string;
  txHash: string;
}> {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);

  const memData = new MemData(bytes);

  const [tree, treeErr] = await memData.merkleTree();
  if (treeErr !== null) {
    throw new Error(`0G merkle tree error: ${treeErr}`);
  }
  if (!tree) {
    throw new Error("0G merkle tree returned null");
  }

  const rootHash = tree.rootHash();
  if (!rootHash) {
    throw new Error("0G merkle tree returned no rootHash");
  }

  const idx = getIndexer();
  const sgn = getSigner();

  const [tx, uploadErr] = await idx.upload(memData, RPC_URL, sgn);
  if (uploadErr !== null) {
    throw new Error(`0G upload error: ${uploadErr}`);
  }

  const txHash =
    "txHash" in tx
      ? tx.txHash
      : Array.isArray(tx.txHashes)
        ? tx.txHashes[0]
        : "unknown";

  return { rootHash, txHash };
}