# Mnemo
![cover](/frontend/public/cover.png)

A persistent memory layer for AI agents on 0G. User-owned and portable across applications.

[Live on 0G Galileo](https://chainscan-galileo.0g.ai/address/0x9f0997c0CD7E5C7Db88f96973f54ed37C3ecA9Fa)

## What it is

Most AI agents lose context between sessions. Any memory that exists is confined to a single application. What one tool learns about a user is not accessible to another, forcing users to repeat context and developers to rebuild memory systems.

Mnemo stores user-defined context and policies on 0G so they can persist beyond a single session or interface. Recipients, preferences, payment rules, and interaction history are stored in a vault that can be referenced by agents the user authorizes.

The agent reads from this memory. The user signs transactions directly. The vault remains independent of any single application.

## What it uses on 0G

* **0G Storage** stores memory chunks such as recipients, preferences, and payment logs as structured JSON
* **0G Chain** holds the `MnemoRegistry` contract, which manages agent identity, the vault manifest pointer, and access permissions
* **0G Galileo Testnet** is used for deployment and testing

## How it works

A user connects their wallet and registers an agent identity through the smart contract on 0G Chain. An initial vault manifest is created and uploaded to 0G Storage, with its reference stored on-chain.

Through the chat interface, the user can save information in natural language. For example, a user might say “save my mom’s address as 0x... on Celo, prefers USDC.” The agent, powered by GPT-4o-mini, interprets the request and structures it into a memory entry. Once confirmed, the memory is uploaded to 0G Storage, the manifest is updated, and the contract is called to point to the new version.

When the user initiates an action such as “send mom 1 USDC,” the agent retrieves the relevant stored recipient and constructs the transaction flow. The user reviews and signs the ERC20 transfer. After execution, the transaction is recorded as a new memory entry.

## Screenshots

![screenshot-landingpage](/frontend/public/1.png)
---
![screenshot-onboarding](/frontend/public/3.png)
---
![screenshot-dashboard](/frontend/public/4.png)
---
![screenshot-chat](/frontend/public/2.png)


## Contract

`MnemoRegistry` is deployed on 0G Galileo at `0x9f0997c0CD7E5C7Db88f96973f54ed37C3ecA9Fa`.

The contract includes:

* `registerAgent(string vaultManifestHash)` to register and attach a vault reference
* `updateVaultManifest(string newHash)` to update memory state
* `grantAccess(address app, string[] policyTypes, uint64 expiresAt)` to allow another application to read specific memory types
* `revokeAccess(address app)` to remove access
* `logRecall(address user, string policyType, bytes32 queryHash)` to record memory usage

Events are emitted on each update so external tools can track vault changes without directly querying contract storage.

## Stack

* Next.js 16 with Tailwind CSS
* wagmi v2, viem, and Reown AppKit for wallet interaction
* `@0gfoundation/0g-ts-sdk` for storage upload and retrieval
* OpenAI GPT-4o-mini for intent interpretation
* Foundry for smart contract development

## Run locally

```bash
npm install
cp .env.example .env.local
```

Fill in:

* NEXT_PUBLIC_PROJECTID (Reown projectId)
* NEXT_PUBLIC_CONTRACT_ADDRESS (deployed registry)
* NEXT_PUBLIC_RPC_URL=[https://evmrpc-testnet.0g.ai](https://evmrpc-testnet.0g.ai)
* NEXT_PUBLIC_ZEROG_INDEXER_RPC=[https://indexer-storage-testnet-turbo.0g.ai](https://indexer-storage-testnet-turbo.0g.ai)
* ZEROG_UPLOAD_PRIVATE_KEY (funded 0G testnet wallet for uploads)
* OPENAI_API_KEY

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo path

1. Connect wallet and register an agent
2. Save a recipient: `save my friend's address as 0x... on 0G, prefers USDC`
3. Save a preference: `remember I prefer concise responses`
4. Send a payment: `send <name> 1 USDC` and follow the constructed transaction flow

Recipient addresses must hold mock USDC at `0x79b86b6A8c346afB480f1bf526F6cE2580A39Dda` for testing.

## Scope

Version 1 includes registration, chat-based memory creation, retrieval, transaction construction, and payment logging.

Version 1 does not include client-side encryption, semantic retrieval, or a cross-application access interface. These are planned improvements.

## Author

@khemmie-ray