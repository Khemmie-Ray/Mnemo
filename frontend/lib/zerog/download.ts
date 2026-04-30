"use client";

import { Indexer, StorageNode } from "@0gfoundation/0g-ts-sdk";
import { ethers } from "ethers";

const INDEXER_RPC =
  process.env.NEXT_PUBLIC_ZEROG_INDEXER_RPC!;

const DEFAULT_CHUNK_SIZE = 256;
const DEFAULT_SEGMENT_MAX_CHUNKS = 1024;
const ROOT_HASH_REGEX = /^0x[0-9a-fA-F]{64}$/;

let indexer: Indexer | null = null;

function getIndexer(): Indexer {
  if (!indexer) {
    indexer = new Indexer(INDEXER_RPC);
  }
  return indexer;
}

function getSplitNum(total: number, unit: number): number {
  return Math.floor((total - 1) / unit + 1);
}

type FileInfo = {
  tx: { size: number; seq: number; startEntryIndex: number };
  finalized: boolean;
};


export async function downloadJsonFromZeroG<T = unknown>(
  rootHash: string,
): Promise<T> {
  if (!ROOT_HASH_REGEX.test(rootHash)) {
    throw new Error(`Invalid rootHash: ${rootHash}`);
  }

  const idx = getIndexer();

  const locations = await idx.getFileLocations(rootHash);
  if (!locations || locations.length === 0) {
    throw new Error("File not found on any storage node yet — may still be propagating");
  }

  const nodes: StorageNode[] = locations.map((loc) => new StorageNode(loc.url));
  let fileInfo: FileInfo | null = null;
  for (const node of nodes) {
    try {
      const info = await node.getFileInfo(rootHash, true);
      if (info) {
        fileInfo = info as unknown as FileInfo;
        break;
      }
    } catch {
      continue;
    }
  }
  if (fileInfo === null) {
    throw new Error("Could not retrieve file info from any storage node");
  }

  const fileSize = Number(fileInfo.tx.size);
  const txSeq = Number(fileInfo.tx.seq);
  const startEntryIndex = Number(fileInfo.tx.startEntryIndex);

  const numChunks = getSplitNum(fileSize, DEFAULT_CHUNK_SIZE);
  const startSegmentIndex = Math.floor(startEntryIndex / DEFAULT_SEGMENT_MAX_CHUNKS);
  const endSegmentIndex = Math.floor(
    (startEntryIndex + numChunks - 1) / DEFAULT_SEGMENT_MAX_CHUNKS,
  );
  const numTasks = endSegmentIndex - startSegmentIndex + 1;

  const segments: Uint8Array[] = new Array(numTasks);

  await Promise.all(
    Array.from({ length: numTasks }).map(async (_, taskInd) => {
      const segmentIndex = taskInd;
      const startIndex = segmentIndex * DEFAULT_SEGMENT_MAX_CHUNKS;
      let endIndex = startIndex + DEFAULT_SEGMENT_MAX_CHUNKS;
      if (endIndex > numChunks) endIndex = numChunks;

      let segArray: Uint8Array | null = null;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[(taskInd + i) % nodes.length];
        try {
          const segment = await node.downloadSegmentByTxSeq(
            txSeq,
            startIndex,
            endIndex,
          );
          if (segment === null) continue;

          segArray = ethers.decodeBase64(segment as string);

          if (startSegmentIndex + segmentIndex === endSegmentIndex) {
            const lastChunkSize = fileSize % DEFAULT_CHUNK_SIZE;
            if (lastChunkSize > 0) {
              const paddings = DEFAULT_CHUNK_SIZE - lastChunkSize;
              segArray = segArray.slice(0, segArray.length - paddings);
            }
          }
          break;
        } catch {
          continue;
        }
      }

      if (!segArray) {
        throw new Error(`Failed to download segment ${segmentIndex}`);
      }
      segments[taskInd] = segArray;
    }),
  );

  const blob = new Blob(segments as BlobPart[]);
  const text = await blob.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Chunk at ${rootHash} is not valid JSON`);
  }
}