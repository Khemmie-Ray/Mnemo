import abi from "@/constant/abi.json"

export const MNEMO_REGISTRY_ABI = abi;

export const MNEMO_REGISTRY_ADDRESS = process.env
  .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

if (!MNEMO_REGISTRY_ADDRESS) {
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not set");
}