# 🛡️ Privacy-first AI Agent for DeFi (Hackathon Submission)

An **Autonomous AI Agent** that prioritizes privacy in the DeFi ecosystem. Built for the **ETHGlobal Pragma Cannes Hackathon**.

The agent automatically scans multichain liquidity pools, analyzes strategies using *Sealed Inference (TEE)*, allows users to select a **Privacy Mode**, and executes autonomous trades using **permissionless APIs** and **Agentic Micropayments**.

---

## 🏆 Hackathon Sponsor Targets

This project was built to satisfy **100% of the core requirements** for the following bounties:

1. **Hedera ($15k)**: AI & Agentic Payments — Integrates *Hedera Agent Kit*, *HCS-14 Universal Agent IDs*, *x402 pay-per-request*, and sub-cent *A2A micropayments*.
2. **0G ($15k)**: Best OpenClaw Agent / Best DeFi App — Uses *OpenClaw* framework, *0G Compute (Sealed Inference)*, *0G Storage (RAG Memory)*, and mints agents as *ERC-7857 iNFTs*.
3. **Chainlink ($5k)**: Best workflow with CRE — Orchestrates the entire flow via *Chainlink Runtime Environment (TypeScript SDK)*.
4. **Uniswap ($10k)**: Best Uniswap API Integration — Executes real on-chain trades and optimal routing using the *Uniswap API*.
5. **ioBuilders / Naryo ($3.5k)**: Naryo Builder Challenge — Exhaustive event correlation across *Hedera Mirror Node* and *Unichain*.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                       USER INTERFACE (CLI)                      │
│                   Privacy Toggle: [Yes] / [No]                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Chainlink CRE Workflow (Orchestrator)
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌─────────────┐   ┌─────────────────┐   ┌─────────────────┐
  │   Naryo     │   │  0G Compute     │   │  Uniswap API    │
  │ Multichain  │──▶│ (OpenClaw Agent │──▶│  (Swap / Route) │
  │  Listener   │   │  + Sealed TEE)  │   │                 │
  └─────────────┘   └────────┬────────┘   └────────┬────────┘
                             │                     │
                    ┌────────┴────────┐             │
                    │   0G Storage    │    ┌────────┴────────┐
                    │  (RAG Memory)   │    │  Hedera Agent   │
                    └─────────────────┘    │  Kit + HCS-14   │
                                           │  (Payment + ID) │
                                           └─────────────────┘
```

### Flow Breakdown
1. **Event**: Naryo correlates events from Hedera & Unichain into a "market story".
2. **AI Inference**: OpenClaw agent prompts 0G Compute (Sealed TEE) with RAG context from 0G Storage.
3. **Privacy Toggle**: User decides whether to execute the strategy privately or publicly.
4. **Execution**: Chainlink CRE workflow coordinates the Uniswap API trade.
5. **Payment & Audit**: Hedera handles sub-cent A2A micropayments and logs the action to a public HCS topic (if Privacy Mode is OFF).

---

## 🔐 The Privacy Toggle

The core differentiator of this agent is the user-selectable **Privacy Mode**:

- **If YES (Private)**:
  - 0G Compute processes inference entirely inside a TEE (Sealed environment).
  - No public audit log is emitted to Hedera HCS.
  - Only an encrypted hash is stored in the `PrivacyVault.sol` contract.
- **If NO (Public)**:
  - Hedera Consensus Service receives an immutable logic trail of the agent's decisions.
  - The strategy is saved fully to 0G Storage for public reference.

---

## 🚀 Setup & Run (Local Demo)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the template and fill in your Testnet keys:
```bash
cp .env.example .env
```
_Note: To run the real execution flow, you need Hedera Testnet Operator keys, a 0G Private Key, and a Uniswap API key._

### 3. Dry-Run (Demo Mode)
If you don't have all API keys configured, you can run the full flow in simulated `DRY-RUN` mode. This mocks the network responses while exercising the entire local orchestration codebase.

```bash
npm run demo
```

### 4. Real Execution (Mainsnet/Testnet)
```bash
npm run start
```

---

## 📜 Smart Contracts

Contracts are deployed on **Hedera Testnet (EVM)** and **0G Testnet**.

- **AgentRegistry.sol**: Maps HCS-14 Universal Agent IDs to on-chain EVs addresses and 0G iNFT tokens.
- **PrivacyVault.sol**: Stores strategy commitments (hashed in private mode, clear in public mode).

*Deployment addresses will be added here prior to hackathon submission deadline.*

### To Deploy Yourself:
```bash
npx hardhat run contracts/deploy.ts --network hedera-testnet
npx hardhat run contracts/deploy.ts --network zerog-testnet
```

---

## 📹 Hackathon Videos

*(Placeholders for submission videos)*
- **[Video 1: Hedera Agentic Payment + HCS-14 + x402](#)** (≤ 5 mins)
- **[Video 2: OpenClaw + 0G + Privacy + Uniswap + CRE](#)** (≤ 3 mins)

### ✅ Uniswap Developer Feedback Form
Completed: Yes

---
*Built with ❤️ for the Agentic Economy at Pragma Cannes 2026.*
