# 🛡️ Privacy-first AI Agent for DeFi — Solution Document

> **ETHGlobal Pragma Cannes Hackathon**  
> Tech Stack: OpenClaw · 0G (Compute / Storage / iNFT) · Hedera Agent Kit · HCS-14 · Chainlink CRE · Uniswap API · Naryo

---

## 1. Tổng quan Giải pháp

Dự án xây dựng một **Autonomous AI Agent** ưu tiên quyền riêng tư (privacy-first) trong hệ sinh thái DeFi. Agent tự động:

1. **Scan** pool thanh khoản đa chuỗi theo thời gian thực (Naryo).
2. **Phân tích** và đề xuất chiến lược đầu tư với AI private (0G Sealed Inference + RAG).
3. **Hỏi ý kiến** người dùng về chế độ **Privacy Yes/No** trước khi thực thi.
4. **Thực thi** swap tự động qua Uniswap API + thanh toán micropayment qua Hedera, toàn bộ được điều phối bởi Chainlink CRE Workflow.

**Mục tiêu thi**: Đáp ứng **100% yêu cầu chính** và phần lớn **optional** của 5 sponsor — Hedera ($15k), 0G ($15k), Chainlink ($5k), Uniswap ($10k), ioBuilders (Naryo) ($3.5k).

---

## 2. Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                       USER INTERFACE (CLI / Web)                │
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

---

## 3. Luồng Vận hành Chi tiết (End-to-End Demo Flow)

### Bước 1 — Scan DeFi Pool (Naryo)
- Naryo lắng nghe events từ **Hedera Testnet** (Mirror Node + JSON-RPC relay) và **Ethereum/Unichain**.
- Filter các pool có biến động thanh khoản đáng kể → emit event chuẩn hóa → push vào Chainlink CRE Workflow.
- **Optional nâng điểm**: Correlation events từ Hedera + Unichain thành một "story" duy nhất → trigger Agent với context đầy đủ.

### Bước 2 — Phân tích Chiến lược AI (0G + OpenClaw)
- Chainlink CRE Workflow nhận event từ Naryo → gọi **OpenClaw AI Agent**.
- Agent sử dụng **0G Compute (Sealed Inference + TEE)** để suy luận chiến lược hoàn toàn private.
- **0G Storage (RAG)**: Agent truy vấn lịch sử đầu tư và market context từ persistent memory.
- Kết quả: danh sách chiến lược + risk score + recommended action (swap pair, amount, slippage).

### Bước 3 — Privacy Option (User Decision)
- Agent trả về recommendation qua UI/CLI.
- Người dùng chọn:
  - **Yes (Private)**: Inference chạy 100% trong TEE; transaction KHÔNG publish chi tiết lên HCS public; sử dụng private Hedera HTS path.
  - **No (Public)**: Sử dụng public Hedera HTS transaction + ghi log lên HCS.

### Bước 4 — Thực thi Tự động (Uniswap + Hedera)
- CRE Workflow phát lệnh swap đến **Uniswap API** (routing + trade execution permissionless).
- Hedera Agent Kit thực hiện:
  - **Micropayment** (sub-cent fee) cho Agent-to-Agent (A2A) settlement.
  - **HCS-14** Universal Agent ID để xác thực danh tính agent on-chain.
  - **x402** pay-per-request cho từng inference call (optional nâng điểm).
- **iNFT (ERC-7857)**: Agent được mint thành iNFT — sở hữu, composability và có thể giao dịch.

---

## 4. Tuân thủ Yêu cầu Nhà tài trợ (Compliance Checklist)

### 🟢 Hedera — AI & Agentic Payments ($6,000)

| Yêu cầu | Trạng thái | Chi tiết |
|---|---|---|
| AI Agent thực thi ≥ 1 payment trên Hedera Testnet | ✅ | Micropayment A2A via Hedera Agent Kit |
| Dùng Hedera Agent Kit / OpenClaw ACP / x402 | ✅ | Hedera Agent Kit (JS/TS) + x402 |
| Public GitHub + README (setup, architecture, payment flow) | ✅ | Tài liệu đầy đủ |
| Video ≤ 5 phút demo autonomous payment | ✅ | Hedera Agentic Payment + HCS-14 + x402 |
| **Optional**: HCS-14 Universal Agent IDs | ✅ | Triển khai đầy đủ |
| **Optional**: x402 pay-per-request | ✅ | Mỗi inference call = 1 x402 request |
| **Optional**: A2A Agent settlement | ✅ | OpenClaw ACP |
| **Optional**: Scheduled Transactions | ⬜ | Nếu còn thời gian |

### 🟢 0G — Best OpenClaw Agent & Best DeFi App ($6,000 + $6,000)

| Yêu cầu | Trạng thái | Chi tiết |
|---|---|---|
| Tích hợp OpenClaw với 0G infrastructure | ✅ | Core agent framework |
| 0G Compute (Sealed Inference) | ✅ | Private strategy inference |
| 0G Storage (persistent RAG memory) | ✅ | Agent học từ lịch sử |
| iNFT (ERC-7857) cho agent ownership | ✅ | Agent được mint khi khởi tạo |
| Contract deployment addresses | ✅ | Deploy trên 0G Chain + Hedera |
| Public GitHub + README | ✅ | |
| Video ≤ 3 phút | ✅ | OpenClaw + Privacy + Uniswap + CRE |
| Giải thích protocol features / SDKs đã dùng | ✅ | Trong README |

### 🟢 Chainlink — Best Workflow with CRE ($4,000)

| Yêu cầu | Trạng thái | Chi tiết |
|---|---|---|
| Build + simulate CRE Workflow | ✅ | Orchestrate toàn bộ luồng |
| Integrate ≥ 1 blockchain với external API/LLM/AI | ✅ | Hedera ↔ 0G Compute ↔ Uniswap |
| Successful simulation via CRE CLI | ✅ | Chainlink team deploy lên DON |
| Meaningfully used in project | ✅ | CRE là orchestrator chính |

### 🟢 Uniswap Foundation — Best Uniswap API Integration ($10,000)

| Yêu cầu | Trạng thái | Chi tiết |
|---|---|---|
| Tích hợp Uniswap API với valid API key | ✅ | API key từ Uniswap Developer Platform |
| Transaction IDs (testnet/mainnet execution) | ✅ | Swap thực tế on-chain |
| Public GitHub + README | ✅ | |
| Demo video ≤ 3 phút | ✅ | |
| Hoàn thành Uniswap Developer Feedback Form | ✅ | Bắt buộc |

### 🟡 ioBuilders Naryo Builder Challenge ($3,500)

| Yêu cầu | Trạng thái | Chi tiết |
|---|---|---|
| Deploy smart contracts trên Hedera Testnet | ✅ | Verified trên Hashscan |
| Sử dụng Naryo multichain event listener | ✅ | Scan pool Hedera + Unichain |
| Hedera Mirror Node + JSON-RPC relay | ✅ | |
| Public GitHub + contracts verified Hashscan | ✅ | |
| Video ≤ 5 phút | ✅ | |
| **Optional**: Correlation events multi-DLT | ✅ | Hedera + Unichain → 1 "story" |

---

## 5. Tech Stack Chi tiết

| Layer | Technology | Vai trò |
|---|---|---|
| **AI Agent Framework** | OpenClaw (ZeroClaw/NullClaw variant) | Core agent logic |
| **AI Inference** | 0G Compute + Sealed TEE | Private strategy inference |
| **Memory / RAG** | 0G Storage | Persistent evolving memory |
| **Agent Identity** | iNFT (ERC-7857) + HCS-14 | Ownership + Universal Agent ID |
| **Orchestration** | Chainlink CRE (SDK TypeScript) | Workflow điều phối toàn bộ luồng |
| **Data Feeds** | Chainlink Data Feeds | Giá tài sản thời gian thực (optional) |
| **Cross-chain** | Chainlink CCIP | Bridge nếu cần (optional) |
| **Event Listener** | Naryo | Scan DeFi pool đa chuỗi |
| **Payment / Identity** | Hedera Agent Kit (JS/TS) | Micropayment + A2A settlement |
| **Payment Protocol** | x402 | Pay-per-request inference |
| **Token Service** | Hedera HTS | Token transfer, fee schedule |
| **Audit Log** | Hedera HCS | Verifiable on-chain log |
| **Trade Execution** | Uniswap API | Permissionless swap + routing |
| **Blockchain** | Hedera Testnet + 0G Chain | Settlement layer |
| **Language** | TypeScript / Go | CRE Workflow + Agent Kit |

---

## 6. Cấu trúc Repository

```
📦 privacy-defi-agent/
├── 📁 agent/                   # OpenClaw AI Agent core
│   ├── agent.ts                # Main agent logic
│   ├── inference.ts            # 0G Compute / Sealed Inference client
│   ├── rag.ts                  # 0G Storage RAG memory
│   └── inft.ts                 # ERC-7857 iNFT minting
├── 📁 chainlink-cre/           # CRE Workflow
│   ├── workflow.ts             # Main orchestration workflow
│   └── cre-config.yaml         # CRE CLI config
├── 📁 hedera/                  # Hedera integration
│   ├── agentKit.ts             # Hedera Agent Kit wrapper
│   ├── hcs14.ts                # HCS-14 Universal Agent ID
│   ├── x402.ts                 # x402 pay-per-request
│   └── micropayment.ts         # A2A micropayment logic
├── 📁 naryo/                   # Naryo event listener
│   ├── listener.ts             # Multichain event scanner
│   └── correlator.ts           # Multi-DLT event correlation
├── 📁 uniswap/                 # Uniswap API integration
│   ├── swap.ts                 # Trade execution
│   └── router.ts               # Route optimization
├── 📁 contracts/               # Smart contracts (Solidity)
│   ├── AgentRegistry.sol       # On-chain agent registry
│   └── PrivacyVault.sol        # Optional private vault
├── 📁 docs/                    # Documentation
│   ├── IDEA.md
│   ├── REQUIREMENT.md
│   └── SOLUTION.md             ← (file này)
├── .env.example                # Environment variables template
└── README.md                   # Setup + Architecture + Demo
```

---

## 7. Kế hoạch Triển khai (Implementation Plan)

### Phase 1 — Foundation (Day 1)
- [ ] Khởi tạo repo, cài đặt dependencies (OpenClaw, Hedera Agent Kit, 0G SDK, CRE SDK)
- [ ] Setup Hedera Testnet account + HCS-14 Universal Agent ID
- [ ] Mint iNFT (ERC-7857) trên 0G Chain
- [ ] Deploy smart contracts lên Hedera Testnet, verify trên Hashscan

### Phase 2 — Core Agent Logic (Day 1–2)
- [ ] Tích hợp Naryo listener (Hedera Mirror Node + Unichain)
- [ ] Xây dựng OpenClaw Agent với 0G Compute (Sealed Inference)
- [ ] Setup 0G Storage RAG memory (học từ lịch sử giao dịch)
- [ ] Implement Privacy Toggle logic (Yes/No)

### Phase 3 — Orchestration & Payment (Day 2)
- [ ] Build Chainlink CRE Workflow (TypeScript) điều phối toàn luồng
- [ ] Simulate với CRE CLI → liên hệ Chainlink team deploy lên DON
- [ ] Tích hợp x402 pay-per-request cho từng inference call
- [ ] Implement Hedera micropayment A2A settlement

### Phase 4 — Trade Execution (Day 2–3)
- [ ] Tích hợp Uniswap API (API key + routing + swap)
- [ ] Test real swap trên Testnet → lưu Transaction IDs
- [ ] Optional: Chainlink CCIP bridge nếu cần cross-chain

### Phase 5 — Demo & Submission (Day 3)
- [ ] Quay video demo ≤ 5 phút (Hedera payment + HCS-14 + x402)
- [ ] Quay video demo ≤ 3 phút (OpenClaw + Privacy + Uniswap + CRE)
- [ ] Hoàn thành Uniswap Developer Feedback Form
- [ ] Deploy README.md đầy đủ: setup, architecture, payment flow, privacy toggle
- [ ] Thu thập contract addresses + Transaction IDs → điền vào submission

---

## 8. Bằng chứng Nộp Bài Cần Chuẩn bị

| Hạng mục | Mô tả |
|---|---|
| **GitHub Repo** | Public, open-source, README đầy đủ |
| **Contract Addresses** | Hedera Testnet + 0G Chain, verified Hashscan |
| **Transaction IDs** | Hedera micropayment + Uniswap swap (testnet) |
| **Video 1 (≤5 phút)** | Hedera Agentic Payment + HCS-14 + x402 |
| **Video 2 (≤3 phút)** | OpenClaw + 0G Sealed Inference + Privacy + Uniswap + CRE |
| **Uniswap Feedback Form** | Bắt buộc — https://developers.uniswap.org/feedback |
| **Team Info** | Tên, Telegram, X/Twitter của từng thành viên |

---

## 9. Rủi ro và Phương án Dự phòng

| Rủi ro | Khả năng | Phương án |
|---|---|---|
| 0G Sealed Inference chưa ổn định | Trung bình | Fallback sang 0G Compute không-TEE, vẫn đạt yêu cầu |
| CRE CLI simulate thất bại | Thấp | Chainlink team hỗ trợ trực tiếp tại hackathon |
| Uniswap API key chưa kịp | Thấp | Đăng ký sớm tại developers.uniswap.org |
| Naryo setup phức tạp | Trung bình | Dùng Hedera Mirror Node REST API trực tiếp làm fallback |
| Thời gian không đủ | Cao | MVP ưu tiên: Hedera + 0G + Uniswap; CRE + Naryo thêm sau |

---

## 10. Lý do Thắng Giải

- **Privacy thực sự**: 0G Sealed Inference + TEE — không phải privacy "checkbox".
- **Tự trị cao**: OpenClaw Agent + CRE Workflow orchestration end-to-end.
- **DeFi thực tế**: Uniswap real swap + Hedera sub-cent fees.
- **Event-driven**: Naryo multichain correlation — không poll, không fake.
- **5 sponsor coverage**: 100% yêu cầu chính + nhiều optional nâng điểm.
- **MVP scope rõ ràng**: Demo chạy được trên Testnet, không over-engineer.

> 💡 **Total Prize Potential**: $15k (Hedera) + $12k (0G) + $4k (Chainlink) + $10k (Uniswap) + $2k (Naryo) = **~$43,000**
