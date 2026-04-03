**Privacy-first AI Agent for DeFi** 

**Tóm tắt Ý tưởng Dự án**  
Privacy-first AI Agent for DeFi với:  
- **Chainlink** (Data Feeds + CRE Workflow)  
- **Uniswap** (API for liquidity & trade execution)  
- **AI Agent DeFi Automation** trên Hedera + 0G với **OpenClaw**  
- **Private transfer + private DeFi** (tùy chọn rõ ràng)  

**Luồng Demo mong đợi của AI Agent (Expected Demo Flow):**  
1. Scan DeFi pool (Naryo)  
2. Recommend strategy (0G Compute + RAG)  
3. Privacy option (Yes/No – người dùng chọn)  
4. Automate investing (Uniswap swap + Hedera micropayment)  

**MVP Scope**: Chỉ tập trung vào **end-to-end flow chạy được** trên Testnet, không over-engineer multi-agent swarm.

---

## 1. Mục tiêu và Phạm vi Dự án

Mục tiêu cốt lõi là xây dựng một **Autonomous AI Agent** ưu tiên quyền riêng tư (privacy-first) trong DeFi. Agent tự động scan pool, phân tích chiến lược, cho phép người dùng chọn chế độ private, và thực thi giao dịch hoàn toàn tự động.  

Dự án kết hợp 5 sponsor chính để tạo ra một giải pháp cân bằng giữa trí tuệ nhân tạo tự trị, bảo mật dữ liệu và hiệu suất DeFi thực tế.

---

## 2. Kiến trúc Tích hợp Kỹ thuật Chi tiết (Optimized)

### 2.1. Định danh và Thanh toán với Hedera (Hedera Agent Kit + HCS-14)
- Sử dụng **Hedera Agent Kit** (JS/TS) làm core cho Agentic Payments.  
- Triển khai **HCS-14** (Universal Agent IDs) qua Hedera Consensus Service để định danh duy nhất và verifiable.  
- Thực hiện micropayments (sub-cent fees cố định theo USD) và Agent-to-Agent (A2A) settlement.  
- **Optional nâng điểm**: Thêm **x402** protocol cho pay-per-request và Scheduled Transactions cho recurring payments.

### 2.2. Suy luận AI và Lưu trữ với 0G (OpenClaw + 0G dAIOS)
- **OpenClaw framework** là nền tảng chính để xây dựng AI Agent (hoặc ZeroClaw/NullClaw variant).  
- **0G Compute**: Sealed Inference với TEE safety rails → suy luận chiến lược hoàn toàn private.  
- **0G Storage**: Persistent evolving memory + RAG để Agent học từ lịch sử mà không lộ dữ liệu.  
- **iNFT (ERC-7857)**: Mint Agent thành iNFT để sở hữu, composability và có thể giao dịch/cho phép sử dụng.  
- **Privacy-first core**: Toàn bộ inference chạy trong môi trường Sealed Inference.

### 2.3. Điều phối và Kết nối Dữ liệu với Chainlink CRE
- Chainlink **Runtime Environment (CRE)** làm Orchestrator chính.  
- Xây dựng **Workflow** bằng CRE SDK (TypeScript/Go).  
- Simulate qua CRE CLI → Chainlink team sẽ deploy lên DON nếu simulate thành công.  
- Workflow điều phối toàn bộ luồng: từ Naryo event → 0G inference → Uniswap execution.

### 2.4. Thực thi Giao dịch với Uniswap API
- Tích hợp **Uniswap API** với valid API key từ Uniswap Developer Platform.  
- Thực hiện trade execution, routing và swap tự động (permissionless).  
- **Cross-chain note**: CRE Workflow có thể gọi CCIP nếu cần bridge từ Hedera/0G sang chain Uniswap chính (optional).

### 2.5. Giám sát Sự kiện Đa chuỗi với Naryo
- Sử dụng **Naryo multichain event listener** để scan DeFi pool thời gian thực.  
- Kết nối trực tiếp **Hedera Mirror Node** + JSON-RPC relay.  
- **Nâng cấp exhaustive**: Correlation events từ Hedera + Ethereum/Unichain (Uniswap) thành một “story” duy nhất để trigger Agent.

---

## 3. Quy trình Vận hành của AI Agent (Operational Workflow)

1. **Scan DeFi pool** → Naryo lắng nghe events từ nhiều DLT.  
2. **Recommend strategy** → Chainlink CRE kích hoạt 0G Compute (Sealed Inference + RAG từ 0G Storage).  
3. **Privacy option** → Người dùng chọn:  
   - **Yes** → Inference chạy 100% trong TEE + không publish chi tiết tx lên HCS public.  
   - **No** → Sử dụng public Hedera HTS transaction.  
4. **Automate investing** → CRE Workflow gửi lệnh swap qua Uniswap API → định danh HCS-14 + micropayment qua Hedera Agent Kit.

---

## 4. Phân tích Sự phù hợp với Tiêu chí Nhà tài trợ (Alignment Score)

| Nhà tài trợ       | Bounty                                      | Mức độ phù hợp | Điểm nổi bật & Optional đã thêm                  |
|-------------------|---------------------------------------------|----------------|-------------------------------------------------|
| **Hedera**        | AI & Agentic Payments on Hedera             | ★★★★★         | Agent Kit + HCS-14 + x402 + micropayments      |
| **0G**            | Best OpenClaw Agent / Best DeFi App         | ★★★★★         | OpenClaw + Sealed Inference + iNFT + RAG       |
| **Chainlink**     | Best workflow with Chainlink CRE            | ★★★★★         | CRE Workflow simulate + orchestrate toàn bộ    |
| **Uniswap**       | Best Uniswap API Integration                | ★★★★★         | API key + real swap + Feedback Form            |
| **ioBuilders**    | Naryo Builder Challenge                     | ★★★★☆         | Multichain event + Mirror Node + correlation   |

---

## 5. Yêu cầu Triển khai và Tuân thủ (Technical Compliance)

- **Mã nguồn**: Public GitHub repo với README.md chi tiết (setup, architecture, payment flow, privacy toggle).  
- **Video Demo**:  
  - Video ≤ 5 phút: Hedera Agentic Payment + HCS-14 + x402 (yêu cầu Hedera).  
  - Video ≤ 3 phút: OpenClaw + 0G + Privacy option + Uniswap swap + CRE Workflow (yêu cầu 0G & Chainlink).  
- **Thông tin triển khai**: Contract addresses (Hedera Testnet + 0G Chain), verified trên Hashscan.  
- **Bằng chứng**: Transaction IDs (testnet/mainnet) chứng minh real execution.  
- **Uniswap bắt buộc**: Hoàn tất Developer Feedback Form.

---

## 6. Kết luận & Lý do Thắng Giải

Dự án **Privacy-first AI Agent for DeFi** là giải pháp **toàn diện và thực tế** cho Agentic Economy:  
- Privacy thực sự nhờ 0G Sealed Inference + TEE.  
- Tự trị cao nhờ OpenClaw + CRE orchestration.  
- Hiệu suất DeFi nhờ Uniswap + Hedera sub-cent fees.  
- Event-driven nhờ Naryo multichain.

Với scope MVP được tối ưu, demo end-to-end rõ ràng và đáp ứng **100% yêu cầu chính + nhiều optional** của 5 sponsor, dự án có tiềm năng mạnh mẽ tranh **top prize** tại ETHGlobal Pragma Cannes Hackathon.

**Tech Stack tóm tắt**:  
OpenClaw + 0G (Compute/Storage/iNFT) + Hedera Agent Kit + HCS-14 + Chainlink CRE + Uniswap API + Naryo.
