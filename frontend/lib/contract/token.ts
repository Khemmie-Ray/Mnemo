export const MOCK_USDC_ADDRESS =
  "0x79b86b6A8c346afB480f1bf526F6cE2580A39Dda" as const;

export const ERC20_TRANSFER_ABI = [
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
] as const;

export const TOKENS = {
  USDC: {
    address: MOCK_USDC_ADDRESS,
    decimals: 6, 
    symbol: "USDC",
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export function getTokenConfig(symbol: string) {
  const upper = symbol.toUpperCase();
  if (upper in TOKENS) {
    return TOKENS[upper as TokenSymbol];
  }
  return null;
}