# ETHGlobal Pragma Cannes Hackathon - Sponsor Prizes

## Hedera
**$15,000**

**hedera.com**

**hedera**

### About
Hedera stands apart as a leading EVM blockchain through its distinctive developer experience, enabling developers of all backgrounds to leverage familiar tools like Solidity or its JavaScript SDK* to build breakthrough applications. Linux Foundation Decentralized Trust manages Hedera’s open-source codebase (as Project Hiero) including the hashgraph consensus algorithm which enables 10,000+ TPS, 3s finality, low fees priced in USD, and the highest grade (aBFT) of security. Meanwhile, the Hedera public network is governed by a diverse council of the world’s leading institutions to ensure transparent and fair decision-making. By empowering the development of applications that solve real-world challenges across DeFi, tokenization, AI, digital identity, and more, Hedera is the trust layer that underpins a decentralized future. For more information, visit www.hedera.com, or follow us on X at @hedera, Telegram at t.me/hederahashgraph, or Discord at www.hedera.com/discord. The Hedera whitepaper can be found at www.hedera.com/papers. *Hedera also hasSDKs for Java, Python, Rust, Go, and Swift!

### Prizes

#### 🤖 AI & Agentic Payments on Hedera — $6,000
Up to 2 teams will receive $3,000

Build AI agents that move value autonomously on Hedera. The agentic economy needs payment infrastructure that works at machine speed: sub-second finality, predictable sub-cent fees, and native token operations without smart contract overhead. Hedera is built for this. Use the Hedera Agent Kit, OpenClaw's Agent Commerce Protocol, the x402 payment standard, or any combination of agentic tooling to build agents that discover services, negotiate terms, and settle payments on Hedera. Whether it's micropayment streaming, agent-to-agent commerce, or autonomous DeFi, the best projects will demonstrate real payment flows between agents or between agents and services.

**Qualification Requirements**  
1. Build an AI agent or multi-agent system that executes at least one payment, token transfer, or financial operation on Hedera Testnet.  
2. Use one or more of the following: Hedera Agent Kit (JS/TS or Python), OpenClaw ACP, x402, A2A protocol, or Hedera SDKs directly.  
3. Provide source code in a public GitHub repo with a README covering setup, architecture, and how the payment flow works.  
4. Include a ≤ 5-minute demo video showing the agent performing autonomous payment actions.  

**Optional enhancements**:  
- Multi-agent payment negotiation and settlement using A2A or OpenClaw ACP  
- Implementation of x402 for pay-per-request API or service access  
- On-chain agent identity using ERC-8004 or HCS-14 (Universal Agent IDs via Hedera Consensus Service)  
- Agent discovery and communication via UCP (Universal Commerce Protocol)  
- Token creation, custom fee schedules, or royalty flows via the Hedera Token Service (HTS)  
- Scheduled or recurring payments using Hedera Scheduled Transactions  
- Verifiable payment audit trails using Hedera Consensus Service (HCS)  
- Use of the Hedera CLI for agent workflow automation  

**Links and Resources**  
- Hedera Agent Kit (JS/TS)  
  https://github.com/hashgraph/hedera-agent-kit ↗  
- Hedera Agent Kit (Python)  
  https://github.com/hashgraph/hedera-agent-kit-python ↗  
- OpenClaw ACP Docs  
  https://docs.openclaw.ai/tools/acp-agents ↗  
- x402 Protocol  
  https://www.x402.org/ ↗  
- ERC-8004: Trustless Agents  
  https://eips.ethereum.org/EIPS/eip-8004 ↗  
- HCS Standards (including HCS-14)  
  https://hashgraphonline.com/docs/standards/ ↗  
- A2A Protocol  
  https://developers.google.com/agent-to-agent ↗  
- Hedera Token Service  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service ↗  
- Hedera Consensus Service  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service ↗  
- Getting Started with Hedera  
  https://docs.hedera.com/hedera/getting-started ↗  
- Hedera Code Snippets  
  https://github.com/hedera-dev/hedera-code-snippets ↗  
- Hedera Discord  
  https://hedera.com/discord ↗  

#### 🪙 Tokenization on Hedera — $2,500
Up to 2 teams will receive $1,250

Build a tokenization application using the Hedera Token Service (HTS). Hedera's native token service lets you create, configure, and manage tokens at the protocol level with built-in compliance controls, custom fee schedules, and atomic operations, no smart contract required. This bounty is focused on real-world asset tokenization: securities, real estate fractions, invoices, carbon credits, commodities, fund shares, or any asset class where on-chain representation unlocks liquidity, transparency, or automation. Projects that demonstrate a clear path from physical asset to on-chain token with meaningful compliance or lifecycle management will be favoured.

**Qualification Requirements**  
1. Create, manage, or interact with tokens using the Hedera Token Service (via SDK, system contracts, or both).  
2. Deploy and demonstrate on Hedera Testnet.  
3. Provide source code in a public GitHub repo. Smart contracts verified on Hashscan if applicable.  
4. Include a ≤ 5-minute demo video showing token creation, configuration, and at least one lifecycle operation (transfer, compliance check, fee distribution, etc.).  

**Optional enhancements (extra points)**:  
- Use the @hiero-ledger/hiero-contracts NPM package for HTS system contract imports  
- Implement compliance controls: KYC grants, account freezing, or token pause  
- Custom fee schedules (fixed fees, fractional fees, royalty fees on transfers)  
- Cross-chain token operations using LayerZero, CCIP, or HashPort  
- Oracle integration (Chainlink, Pyth, Supra) for asset pricing or external data  
- Scheduled token operations (vesting, distributions) using Hedera Scheduled Transactions  

**Links and Resources**  
- Hedera Token Service Docs  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service ↗  
- HTS System Contracts Guide  
  https://docs.hedera.com/hedera/smart-contracts/hts-system-contracts ↗  
- @hiero-ledger/hiero-contracts NPM  
  https://www.npmjs.com/package/@hiero-ledger/hiero-contracts ↗  
- Getting Started (EVM)  
  https://docs.hedera.com/hedera/getting-started/evm-developers ↗  
- Contract Verification on Hashscan  
  https://docs.hedera.com/hedera/tutorials/smart-contracts/how-to-verify-a-smart-contract-on-hashscan ↗  
- Hedera Code Snippets  
  https://github.com/hedera-dev/hedera-code-snippets ↗  
- Hedera Discord  
  https://hedera.com/discord ↗  

#### 🛠️ "No Solidity Allowed" — Build with Hedera SDKs — $3,000
Up to 3 teams will receive $1,000

Build a working application on Hedera using only the Hedera SDK. No Solidity, no smart contracts. Use native Hedera services directly: create tokens, post messages to the Consensus Service, schedule transactions, manage accounts, or combine multiple services into something new. This bounty is designed for developers who are new to Hedera or new to blockchain. Hedera's SDK lets you do things that typically require smart contracts on other chains: create fungible and non-fungible tokens, set up custom fee schedules, schedule future transactions, and publish verifiable messages, all with a few lines of JavaScript or Python.

**Qualification Requirements**  
1. Use the Hedera JavaScript/TypeScript SDK (@hashgraph/sdk) or Python SDK. No Solidity smart contracts.  
2. Incorporate at least two native Hedera services (e.g., HTS + HCS, HTS + Scheduled Transactions, HCS + Mirror Node).  
3. Provide source code in a public GitHub repo with a README covering setup and usage.  
4. Include a ≤ 5-minute demo video showing the application in action.  

**Optional enhancements (extra points)**:  
- Coherent end-to-end user experience (not just API calls)  
- Integration with the Hedera Mirror Node REST API for querying network data  
- Creative use of Hedera Consensus Service for data integrity, logging, or messaging  
- Use of the Hedera Agent Kit for AI-driven workflows (counts as SDK usage)  
- Thoughtful security approach (key management, access controls)  

**Ideas to get you started**:  
- Timestamped Proof System  
- Token-Gated Access  
- Scheduled Payment Bot  
- Supply Chain Tracker  
- Verifiable Messaging  

**Links and Resources**  
- Getting Started with Hedera  
  https://docs.hedera.com/hedera/getting-started ↗  
- Hedera JavaScript SDK  
  https://github.com/hashgraph/hedera-sdk-js ↗  
- Hedera Python SDK  
  https://github.com/hashgraph/hedera-sdk-python ↗  
- Hedera Token Service  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service ↗  
- Hedera Consensus Service  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service ↗  
- Scheduled Transactions  
  https://docs.hedera.com/hedera/sdks-and-apis/sdks/schedule-transaction ↗  
- Mirror Node REST API  
  https://docs.hedera.com/hedera/sdks-and-apis/rest-api ↗  
- Hedera Code Snippets  
  https://github.com/hedera-dev/hedera-code-snippets ↗  
- Hedera Discord  
  https://hedera.com/discord ↗  

#### 🌐 ioBuilders Naryo Builder Challenge — $3,500
**🥇 1st place $2,000**  
**🥈 2nd place $750**  
**🥉 3rd place $750**

Build and deploy innovative applications using the Naryo multichain event listener. Leverage Naryo to capture and filter events from at least one DLT. Entries making exhaustive use of Naryo will be favoured.

**Qualification Requirements**  
1. Deploy smart contracts on Hedera Testnet using the Hedera Smart Contracts Service (EVM).  
2. Leverage the Naryo multichain event listener.  
3. Make use of the Hedera Mirror Node and/or JSON-RPC relay.  
4. Provide source code in a public GitHub repo with contracts verified on Hashscan.  
5. Include a ≤ 5-minute demo video showing functionality and setup.  

**Optional enhancements (extra points)**:  
- Use of a Hedera Mirror Node  
- Correlation of events from multiple DLTs into one consistent "story"  
- Use multiple Hedera services (HTS, HCS, Scheduled Txns, Mirror Node, etc.)  
- Employ open-source tooling that improves the Hedera EVM developer experience  

**Links and Resources**  
- Naryo Website  
  https://naryo.io ↗  
- Naryo GitHub  
  https://github.com/LF-Decentralized-Trust-labs/Naryo ↗  
- Naryo YouTube Explanation  
  https://www.youtube.com/live/eAgAhi-vT18?si=-mhI8ndHHAWsHelR ↗  
- Getting Started (EVM)  
  https://docs.hedera.com/hedera/getting-started/evm-developers ↗  
- HTS System Contracts Guide  
  https://docs.hedera.com/hedera/smart-contracts/hts-system-contracts ↗  
- Hedera Discord  
  https://hedera.com/discord ↗  

---

## 0G
**$15,000**

**https**

**0g_labs**

### About
0G is the intelligent Layer 1 for onchain AI powered by first decentralized AI operating system (dAIOS) that provides the complete infrastructure stack for building AI-powered applications on-chain. Developers can leverage 0G's four core components: 0G Storage, 0G DA (infinitely scalable data availability layer), 0G Compute Network (decentralized AI inference and training), and 0G Chain (EVM-compatible blockchain).

### Prizes

#### 🤖 Best OpenClaw Agent on 0G — $6,000
**🥇 1st place $3,000**  
**🥈 2nd place $2,000**  
**🥉 3rd place $1,000**

Build the best applications or extensions that integrate OpenClaw (the viral open-source AI agent framework) or alternative Claw agents (ZeroClaw, NullClaw, etc) with 0G’s decentralized infrastructure. Use 0G Compute, Storage for persistent memory, Chain for on-chain actions/payments, and iNFTs (ERC-7857) for agent ownership/composability.  

**Ideas to get you started**:  
🔹 OpenClaw-powered personal “Digital Twin” agent that uses 0G Compute for private inference and 0G Storage for evolving memory/RAG  
🔹 Multi-agent OpenClaw swarm (trading + research + automation) that coordinates via 0G Compute and settles actions on-chain  
🔹 OpenClaw agent reputation & KYA system with on-chain history tied to iNFT identity  
🔹 Sandboxed OpenClaw execution environment with TEE safety rails + automatic royalty splits  
🔹 Interactive AI companion or content creator as an OpenClaw agent minted as iNFT with persistent 0G Storage memory  

**Qualification Requirements**  
🔹 Project name and a short description  
🔹 Contract deployment addresses  
🔹 Public GitHub repo (README + setup instructions)  
🔹 Demo video & live demo link (keep the video under 3 mins!)  
🔹 Explain which protocol features or SDKs you used  
🔹 Team member names and contact info (Telegram & X)  

**Links and Resources**  
- 0G Documentation  
  https://docs.0g.ai/ ↗  
- Builder Hub  
  https://build.0g.ai/ ↗  
- Zero Coding guide  
  https://build.0g.ai/zero-coding/ ↗  

#### 💰 Best DeFi App on 0G — $6,000
**🥇 1st place $3,000**  
**🥈 2nd place $2,000**  
**🥉 3rd place $1,000**

Build the most innovative DeFi applications on 0G. Leverage any combination of the full stack (Chain for settlement, Storage for models/data, Compute for verifiable AI inference, DA for scalability). We’re looking for AI-native DeFi experiences that are autonomous, verifiable, and economically self-sustaining.  

**Ideas to get you started**:  
🔹 Multi-agent DeFi swarm (autonomous trading + risk + liquidity + yield agents that coordinate on 0G Compute, share memory on Storage, settle on Chain)  
🔹 AI-powered prediction market with on-chain model provenance + verifiable/Sealed Inference  
🔹 Niche AI model marketplace focused on DeFi strategies with licensing, royalties, and provenance tracking  
🔹 Federated LoRA/QLoRA fine-tuning platform where contributors train DeFi models on 0G Compute and own them via iNFTs  

**Qualification Requirements**  
🔹 Project name and a short description  
🔹 Contract deployment addresses  
🔹 Public GitHub repo (README + setup instructions)  
🔹 Demo video & live demo link (keep the video under 3 mins!)  
🔹 Explain which protocol features or SDKs you used  
🔹 Team member names and contact info (Telegram & X)  

**Links and Resources**  
- 0G Documentation  
  https://docs.0g.ai/ ↗  
- Builder Hub  
  https://build.0g.ai/ ↗  
- Zero Coding guide  
  https://build.0g.ai/zero-coding/ ↗  

#### 🎆 Wildcard on 0G — $3,000
Up to 2 teams will receive $1,500

Build anything creative that showcases the full power of 0G’s AI-native L1 but doesn’t fit neatly into OpenClaw or DeFi categories. Use any layers of the stack (Chain, Storage, Compute, DA, iNFTs) for novel dApps in gaming, RWAs, healthcare, infrastructure, or completely new verticals.  

**Ideas to get you started**:  
🔹 Niche AI model marketplace with licensing, royalties, and provenance tracking (non-DeFi focus)  
🔹 Decentralized AI job/fine-tuning marketplace with automatic verification via 0G Compute + on-chain bounties  
🔹 Autonomous AI DAO governance layer (agents propose/vote/execute using 0G Compute for analysis)  
🔹 iNFT launchpad/marketplace where agents are minted with live 0G Compute inference  
Composable/evolving iNFT collections (breeding, merging, or fine-tuning agents together using 0G Compute)  
🔹 AI music/art generation with automated royalty splits (iNFT holds the model + pays creators)  
🔹 Interactive AI companions/characters as iNFTs with persistent memory that evolve based on owner interaction  

**Qualification Requirements**  
🔹 Project name and a short description  
🔹 Contract deployment addresses  
🔹 Public GitHub repo (README + setup instructions)  
🔹 Demo video & live demo link (keep the video under 3 mins!)  
🔹 Explain which protocol features or SDKs you used  
🔹 Team member names and contact info (Telegram & X)  

**Links and Resources**  
- 0G Documentation  
  https://docs.0g.ai/ ↗  
- Builder Hub  
  https://build.0g.ai/ ↗  
- Zero Coding guide  
  https://build.0g.ai/zero-coding/ ↗  

**Resources**  
- Documentation  
  https://docs.0g.ai ↗  
- Builder Hub  
  https://build.0g.ai ↗  

---

## Chainlink
**$5,000**

**chain.link**

**chainlink**

### About
The industry standard oracle network for powering trust-minimized applications across Web2 and Web3 ⬡

### Prizes

#### 🔗 Best workflow with Chainlink CRE — $4,000
Up to 2 teams will receive $2,000

Build your first workflow with CRE! Chainlink Runtime Environment (CRE) is an all-in-one orchestration layer that enables developers to build institutional-grade smart contracts — data-connected, compliance-ready, privacy-preserving, and interoperable across blockchains and traditional systems. With CRE, you can connect blockchains to external APIs, enterprise systems, data sources, LLMs, or AI agents. Using the CRE SDK (available in Go and TypeScript), you’ll build Workflows — modular programs that orchestrate logic across on-chain and off-chain environments. With the CRE CLI, you can compile, simulate, and deploy these workflows to CRE, where they run on a Decentralized Oracle Network (DON) for fault-tolerant execution.

**Qualification Requirements**  
Requirements:  
✅ Goal: Build, simulate, or deploy a CRE Workflow that’s used as an orchestration layer within your project.  
✅ Your workflow should:  
- Integrate at least one blockchain with an external API, system, data source, LLM, or AI agent.  
- Demonstrate a successful simulation (via the CRE CLI) or a live deployment on the CRE network.  
- Be meaningfully used in your project  
💡 If you show us a successfully simulated workflow execution, our team will deploy it to the live CRE network for you during the hackathon!

**Links and Resources**  
- CRE Documentation  
  https://docs.chain.link/cre ↗  
- CRE Bootcamp  
  https://smartcontractkit.github.io/cre-bootcamp-2026/ ↗  
- CRE Templates  
  https://github.com/smartcontractkit/cre-templates/ ↗  

#### 🌎 Connect the World with Chainlink — $1,000
Build something awesome using Chainlink! Specifically using CCIP, Price Feeds, Data Streams, PoR or VRF. Note: Please use CRE instead of using Chainlink Functions or Automation. These products will be deprecated, and any project that needs this type of functionality should use CRE instead.

**Qualification Requirements**  
- Each project must use a Chainlink service in some form to make a state change on a blockchain, otherwise it will not be eligible for the Chainlink core prizes. This means that a front end simply reading from Chainlink Data Feeds doesn't count. Using Chainlink inside your smart contracts is required.  
- While all project submissions are evaluated holistically, there will be bonus points given to projects that use multiple Chainlink services in a meaningful way.  
- Please let us know how you use Chainlink in the project description.

**Links and Resources**  
- Chainlink Documentation  
  http://docs.chain.link ↗  

---

## Uniswap Foundation
**$10,000**

**uniswapfoundation.org**

**uniswapfnd**

### About
The Uniswap Protocol is one of the largest decentralized exchange protocol for swapping value onchain across Ethereum and other supported blockchains. The Uniswap ecosystem has evolved into a full stack platform for onchain finance, including smart contracts such as v2, v3, and v4, developer tools, APIs, and emerging infrastructure like Unichain. This enables developers to build applications on top of shared, permissionless liquidity.

### Prizes

#### 🦄 Best Uniswap API Integration — $10,000
**🥇 1st place $5,000**  
**🥈 2nd place $3,000**  
**🥉 3rd place $2,000**

Build with the Uniswap API to access liquidity and execute value onchain. Projects must integrate the Uniswap API with a valid API key from the Uniswap Developer Platform for core functionality such as trade execution, routing, payments, or coordination between agents or systems. This may include trading applications, agent-based systems, automated strategies, or new financial primitives, leveraging Uniswap’s permissionless liquidity and emerging capabilities such as AI-driven systems. Submissions should reflect forward-looking approaches to onchain finance, using the Uniswap stack as a foundation for building new financial infrastructure.

**Qualification Requirements**  
A user interface is not required, but projects must provide clear evidence of functional code. Each team must submit:  
- Transaction IDs demonstrating real onchain execution (testnet and/or mainnet)  
- A public GitHub repository with open-source code and a clear README.md  
- A demo link or setup instructions  
- A demo video (maximum 3 minutes)  
- A completed submission to the Uniswap Developer Feedback Form: https://developers.uniswap.org/feedback  

**Links and Resources**  
- Uniswap Developer Platform  
  https://developers.uniswap.org/?utm_medium=eco&utm_source=platform&utm_campaign=20260318-ethglobal_pragma_cannes&utm_content=callout&utm_term=self-serve ↗  
- Uniswap AI Toolkit  
  https://github.com/Uniswap/uniswap-ai ↗  
- Uniswap Docs  
  https://docs.uniswap.org/contracts/v4/overview?utm_medium=eco&utm_source=platform&utm_campaign=20260318-ethglobal_pragma_cannes&utm_content=callout&utm_term=self-serve ↗  
- Uniswap API Docs  
  https://api-docs.uniswap.org/guides/integration_guide?utm_medium=eco&utm_source=platform&utm_campaign=20260318-ethglobal_pragma_cannes&utm_content=callout&utm_term=self-serve ↗  