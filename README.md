# 🌌 ORION: Sovereign Privacy-First AI Agent for Decentralized Finance

**ORION** (Open Robust Intelligence & On-chain Network) is a cutting-edge autonomous AI Agent that bridges the gap between **Sealed Privacy** and **Institutional-Grade DeFi Execution**. 

Built for the **0G Hackathon**, ORION leverages the full power of the 0G Labs ecosystem to ensure that sophisticated trading strategies remain confidential while executing verifiable, non-custodial swaps and liquidity management.

---

## 🏗️ Project Architecture & Directory Map

Our codebase is meticulously organized into a 4-layered modular architecture:

### 1. 🧠 Core Orchestration (`/src/core`)
- **`orchestrator.ts`**: The central brain. Tying together Data discovery, AI reasoning, and On-chain execution.
- **`privacy.ts`**: Manages the TEE-shielded user-approval flow.

### 2. 🧊 Sponsor Module Integrations (`/src/services`)
- **`zero-g/`**: 
    - `inft.ts`: Logic for ERC-7857 iNFT minting & registration.
    - `inference.ts`: 0G Compute (Sealed TEE Inference) client.
    - `storage.ts`: 0G Storage (Decentralized RAG) client.
- **`uniswap/`**:
    - `liquidity.ts`: Uniswap V3 LP Position management.
    - `swap.ts`: High-performance trade execution.
    - `router.ts`: Intelligent path discovery.
- **`chainlink/`**:
    - `workflow.ts`: CRE Workflow orchestration and verification.
- **`naryo/`**:
    - `listener.ts`: Cross-chain swap event discovery (Unichain/Ethereum).

### 3. 🤖 ACP AI Agent (`/src/agent`)
- **`agent.ts`**: The OpenClaw-compatible AI persona. Interprets market stories and generates strategies.

### 4. ⛓️ Smart Contract Suite (`/src` - Solidity)
- **`AgentRegistry.sol`**: On-chain verified registry for Agent IDs and Action Logs.
- **`PrivacyVault.sol`**: Private liquidity router for shielded transactions.

---

## 🛡️ Triple Proof Verification Standard

1.  **Proof of Reasoning**: Every strategy is signed within a TEE (**0G Compute**).
2.  **Proof of Existence**: Finalized strategies are hashed and committed to **0G Storage** *before* execution.
3.  **Proof of Identity**: Every on-chain trade is attested in the **0G AgentRegistry**, linking the transaction to the specific Agent ID (iNFT).

---

## 🚀 Quick Launch (Real Autonomous Mode)

```bash
# 1. Deploy the Sovereign Infrastructure (WSL/Linux)
npm run deploy:0g

# 2. Mint the Agent's Soul (ERC-7857 iNFT)
npm run mint-inft

# 3. Launch the Sovereign Investment Session
npm run run-agent

# 4. Auditor Check: Verify Action Proofs on-chain
npm run verify
```

---

## 🕹️ CLI Operational Suite

| Category | File/Command | Description |
| :--- | :--- | :--- |
| **Intelligence** | `npm run analyze` | Comparative analysis of N pools + Auto-invest optional. |
| **Sovereign** | `npm run run-agent` | **Master Demo**: Performs Swap -> LP -> Withdraw in one flow. |
| **Audit** | `npm run verify` | Queries 0G Chain for all Action certificates (Swap/LP/Withdraw). |
| **Identity** | `npm run check-id` | Audits your iNFT ownership and latest Token ID status. |
| **Portfolio** | `npm run balance` | Real-time view of assets and active Uniswap NFT positions. |

---

**Developed for the 0G Hackathon | Defining the future of Decentralized AI.**
