# 📙 ORION Operator's Guide — Detailed Technical Manual

Welcome to the **ORION Agent** operational manual. Use this guide to configure, run, and scale your AI-powered investment agent.

---

## 🏗️ Phase 1: Environment & System Setup (A-Z)

To run ORION in **Live Mode**, follow this checklist:

### 1. External Infrastructure
*   **Node.js**: v20.x or higher.
*   **0G RPC**: `https://evmrpc-testnet.0g.ai` (Requires testnet tokens).
*   **Unichain RPC**: Registered at [Alchemy](https://alchemy.com) for **Unichain Sepolia**.
*   **0G Storage**: Ensure `ZG_INDEXER_URL` points to a live 0G Storage gateway.

### 2. .env Preparation
Ensure these critical values are populated:
```env
ZG_PRIVATE_KEY=your_private_key
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
TRADER_PRIVATE_KEY=your_trading_wallet
UNICHAIN_RPC_URL=your_unichain_rpc
```

---

## ⛓️ Phase 2: Sovereign Infrastructure (WSL/Linux Deployment)

The system's core relies on Foundry-native contracts. These MUST be deployed for the "Triple Proof" standard to function.

### 1. Build & Deploy
We recommend using **WSL** for a consistent Linux environment:
```bash
# 1. Update line-endings and gas-prices automatically
npm run deploy:0g
```
*   **Contract 1 (AgentRegistry)**: Deployed to 0G Galileo. Manages action logs.
*   **Contract 2 (PrivacyVault)**: Deployed to 0G Galileo. Handles shielded capital.

### 2. Configure Identifiers
After deployment, update your `.env` with the terminal output:
- `AGENT_REGISTRY_ADDRESS=0x...`
- `PRIVACY_VAULT_ADDRESS=0x...`

---

## 🎭 Phase 3: Identity & Minting (iNFT)

Your agent requires a soul. By default, it uses a generic ID. To give it on-chain identity:

```bash
# 1. Mint the ERC-7857 iNFT and register on-chain
npm run mint-inft

# 2. Audience Auditor check
npm run check-id
```
- This command uploads metadata to **0G Storage**.
- It creates a permanent record in the **AgentRegistry**.
- All subsequent logs will use your unique Agent ID.

---

## 🚀 Phase 4: Operational Masterclass (Demo Scripts)

ORION offers three primary modes of operation. Choose the one that suits your demo needs:

### 1. Full Sovereign Demo (Recommended)
Showcases the entire invest-and-exit lifecycle in a single flow:
```bash
# Command: Swap -> LP -> Withdraw (All verifiable)
npm run run-agent
```

### 2. Comparative Market Analysis (Intelligence)
Analyzes a list of pools and auto-invests into the highest-yield candidate:
```bash
# Analyze 'pools.json' and auto-invest in Rank #1
npx ts-node src/cli.ts analyze --file examples/pools.json --auto-invest
```

### 3. Verification & Proof of Life (Auditor Mode)
Connects directly to the 0G Chain to pull real-time cryptographic action logs:
```bash
# Verify Swap, LP, and Withdraw Proofs on-chain
npm run verify
```

---

## 🕹️ CLI Operational Suite — File Reference

| File | Type | Purpose |
| :--- | :--- | :--- |
| **`tools/run-agent.ts`** | Script | Orchestrates the full Swap + LP + Withdraw demo. |
| **`tools/verify-onchain.ts`** | Script | Queries 0G Chain events for 'ActionLogged' certificates. |
| **`tools/check-identity.ts`** | Script | Audits your iNFT balances and Token IDs. |
| **`src/cli.ts`** | CLI | Professional management suite (analyze, mint, balance, withdraw). |

---

## 🔧 Troubleshooting

### Gas Price Failure (2 Gwei Requirement)
0G Galileo testnet requires a specific gas price (currently 2 Gwei). If deployment fails, `deploy.sh` automatically attempts to fix this for you using `--gas-price 2gwei`.

### Block range is too large
If the `verify` command fails due to RPC limits, we have defaulted the block look-back in `tools/verify-onchain.ts` to **1000 blocks**. You can further reduce this if the RPC remains unstable.

---

**ORION: Verifiable Intelligence for the Decentralized Era.**
