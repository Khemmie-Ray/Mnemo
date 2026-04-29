'use client'

import { wagmiAdapter, projectId, customNetwork } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

const metadata = {
  name: 'Mnemo',
  description: 'A memory layer for AI agents. User-owned, portable across every app you use.',
  url: 'https://mnemo.app', 
  icons: ['https://mnemo.app/favicon.svg'], 
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [customNetwork],
  defaultNetwork: customNetwork,
  metadata,
  features: {
    analytics: true,
  },
})

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies,
  )

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider