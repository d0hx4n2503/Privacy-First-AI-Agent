# 📙 ORION Operator's Guide — Detailed Technical Manual

Welcome to the **ORION Agent** operational manual. This guide provides deep technical details on how to configure, run, and scale your privacy-first AI agent.

---

## 🧭 System Workflow

ORION operates in a 4-stage pipeline for every market opportunity:

1.  **Market Story Discovery** (`Naryo`): Listen to cross-chain swap events on Unichain and Ethereum. Correlate them into a unified "Story".
2.  **Sealed AI Analysis** (`0G Compute`): Send the story to a Trusted Execution Environment (TEE) for a privacy-preserved investment strategy.
3.  **RAG Memory Persistence** (`0G Storage`): Store the analysis as a permanent retrieval-augmented generation proof on the 0G decentralized network.
4.  **Workflow Orchestration** (`Chainlink CRE`): Securely route the TEE decision to on-chain execution with zero-leakage of the underlying alpha.

---

## 🛠️ Environment & System Setup (A-Z)

To run ORION in **Live Mode**, follow this data acquisition checklist:

### 1. 🏗️ Local Environment
*   **Node.js**: v18.x or higher.
*   **Foundry**: Required for smart contract operations.
    - Install via: `curl -L https://foundry.paradigm.xyz | bash` followed by `foundryup`.

### 2. 🧊 0G Labs Infrastructure
*   **ZG_RPC_URL** (0G Chain): Get from [0G Galileo Docs](https://docs.0g.ai/0g-doc/docs/galileo-testnet).
    - Default: `https://evmrpc-testnet.0g.ai`
*   **ZG_INDEXER_URL**: Get the latest indexer from the [0G Storage Scan](https://storagescan-galileo.0g.ai/).
*   **ZG_COMPUTE_URL**: Accessible via [0G Compute Providers](https://api-compute.0g.ai).
*   **0G Faucet**: Get free tokens at the [0G Galileo Faucet](https://faucet.0g.ai).

### 3. 🦄 Uniswap & Chain RPCs
*   **UNICHAIN_RPC_URL**: Register at [Alchemy](https://www.alchemy.com) or [Infura](https://www.infura.io) for **Unichain Sepolia**.
*   **ETHEREUM_RPC_URL**: Get a **Sepolia** RPC from Alchemy.
*   **UNISWAP_API_KEY**: Sign up at the [Uniswap Developer Portal](https://developer.uniswap.org).

---

## ⛓️ Smart Contract Suite (Foundry)

ORION's on-chain soul is managed via Foundry. The contracts are located in `src/*.sol`.

### 1. Initialization
If you are cloning the repo for the first time, initialize the submodules:
```bash
forge install
```

### 2. Compilation & Testing
Ensure the contracts are sound before deployment:
```bash
forge build
forge test
```

### 3. Deployment Workflow
To deploy the core contracts (**AgentRegistry** and **PrivacyVault**) to the 0G Galileo Testnet:

1.  Ensure `ZG_PRIVATE_KEY` and `ZG_RPC_URL` are set in your `.env`.
2.  Run the deployment script:
    ```bash
    forge script script/Deploy.s.sol --rpc-url zerog-testnet --broadcast --verify
    ```
3.  **Post-Deployment**: Copy the deployed addresses from the terminal output and update your `.env`:
    - `INFT_CONTRACT_ADDRESS`
    - `PRIVACY_VAULT_ADDRESS`

---

## 🛡️ Privacy-First Execution (TEE Deep-Dive)

ORION uses **0G Compute's Sealed Inference** to solve the "Front-running Problem" in DeFi. 

-   **Public Execution**: Traditional bots broadcast their intent, allowing others to copy or sandwich the trade.
-   **ORION Private Execution**: The agent generates the trade intent inside a TEE. It then uses a **Privacy Router (Vault)** to execute the trade, hiding the "Why" and "When" until the transaction is finalized.

---

## 🏗️ Detailed Configuration (.env)

| Variable | Description |
| :--- | :--- |
| `ZG_RPC_URL` | EVM RPC for the 0G Chain. Required for iNFTs and contract calls. |
| `ZG_INDEXER_URL` | The 0G Storage Indexer endpoint for RAG persistence. |
| `ZG_COMPUTE_URL` | The 0G Compute gateway for Sealed Inference calls. |
| `TRADER_PRIVATE_KEY` | The wallet that holds ETH/USDC and signs Uniswap trades. |

---

## 🕹️ CLI Operational Manual

### 1. `analyze` / `analyze-pools` — Proactive Investment
Perfect for discovering the best farming or trading index across multiple pools. 
- **Lệnh**: `npx ts-node src/cli.ts analyze --file examples/pools.json`
- **Flag `--file`**: Path to your JSON pool list.
- **Flag `--dry-run`**: Skip real 0G Compute calls (uses local fallback).
- **Flag `--auto-invest`**: Automatically execute after analysis.

### 2. `balance` — Portfolio Insight
Shows your actual tokens and all Uniswap V3 LP positions you currently own.
```bash
npx ts-node src/cli.ts balance
```

### 3. `withdraw-pool` — Exit Strategy
Allows you to exit any Uniswap V3 liquidity position by providing its NFT ID.
```bash
npx ts-node src/cli.ts withdraw-pool 12345
```

---

## 🧪 Troubleshooting & Network Reliability

### Handling 0G Galileo Testnet Load
- **Status 503**: If the 0G Compute network returns a 503 error, ORION will fallback to a **Deterministic AI Scorer** locally. This ensures your agent remains autonomous even during network congestion.
- **Storage Issues**: If the Storage Indexer is offline, your RAG memory will be saved locally and retried automatically.

---

**ORION: Redefining DeFi Privacy with Decentralized AI Intelligence.**
