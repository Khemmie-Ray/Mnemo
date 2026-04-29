import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from '@reown/appkit/networks'

export const projectId = process.env.NEXT_PUBLIC_PROJECTID
if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECTID is not defined')
}

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL!

export const customNetwork = defineChain({
  id: 16602,
  caipNetworkId: 'eip155:16602',
  chainNamespace: 'eip155',
  name: '0G Galileo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chainscan',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
})

export const networks = [customNetwork]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [customNetwork.id]: http(rpcUrl),
  },
})

export const config = wagmiAdapter.wagmiConfig