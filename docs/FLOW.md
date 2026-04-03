# 🛡️ Privacy-first AI Agent for DeFi — Workflow & System Architecture 

Tài liệu này cung cấp mô tả chi tiết, **đồng bộ hoàn toàn với System Architecture (SOLUTION.md)**. Phân tích cụ thể `Tech sử dụng`, `Sử dụng như thế nào`, `Tại sao cần (Target)` và `Luồng chạy (Flow)` ở mức độ kỹ thuật sâu.

---

## 1. System Architecture (Kiến trúc Hệ thống Đồng bộ)

Kiến trúc dưới đây mô tả sự tương tác của 5 nền tảng tài trợ (Sponsors) dưới sự điều phối của **Chainlink CRE Workflow**, đóng vai trò là Orchestrator trung tâm.

```text
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

## 2. Các Tech sử dụng, Tính năng và Target (Tại sao cần?)

Các node công nghệ trong sơ đồ trên được phân bổ như sau:

### 2.1. Naryo (Multichain Listener)
- **Tech sử dụng:** Naryo Event Correlator, Hedera Mirror Node & Unichain JSON-RPC.
- **Tính năng:** Lắng nghe, lọc và gom cụm (correlate) các giao dịch swap/add/remove thanh khoản từ pool.
- **Sử dụng như thế nào?** Khởi chạy 1 tiến trình nền (background polling) liên tục query Hedera và Unichain. Khi có nhiều event lẻ tẻ (VD: cá mập xả ETH sang USDC trên cả 2 chuỗi trong vòng 30 giây), Naryo gộp chúng lại thành `CorrelatedStory`.
- **Target (Tại sao cần?):** Cần một "con mắt" theo dõi DLT thời gian thực. Độc lập thu thập từ 1 chuỗi dễ bị nhiễu do Arb bots. Gom cụm đa chuỗi giúp Agent thấy được bức tranh "dòng tiền" macro thực sự để ra quyết định sớm.

### 2.2. 0G Compute & Storage (OpenClaw Agent + Sealed TEE)
- **Tech sử dụng:** OpenClaw Framework, 0G Compute (Sealed Inference endpoint), 0G Storage, iNFT (ERC-7857).
- **Tính năng:** Cung cấp "Bộ não" đưa ra quyết sách (Inference) và "Bộ nhớ" tuần tự hóa của Agent.
- **Sử dụng như thế nào?**
  - Chainlink CRE đẩy `CorrelatedStory` từ Naryo vào module Agent.
  - Agent đọc lại Lịch sử từ `0G Storage RAG` (RAG context).
  - Đóng gói (Mã hóa) gửi lên `0G Compute TEE` thực thi thuật toán AI. Result trả về dạng JSON: `Action (Swap)`, `Risk Score`.
  - Identity tác nhân này được mint thành 1 thẻ `iNFT` trên mạng 0G.
- **Target (Tại sao cần?):** **Đây là linh hồn "Privacy-first" của giải pháp.** Không thể dùng API OpenAI hay ChatGPT thông thường vì dữ liệu truyền đi (và thuật toán prompt) sẽ bị log lại bởi máy chủ tập trung (dẫn tới lộ chiến thuật đánh/Front-run). TEE (Trusted Execution Environment) của 0G là hộp đen mật mã, bảo vệ hoàn toàn chiến lược AI.

### 2.3. Chainlink CRE Workflow (Orchestrator định tuyến)
- **Tech sử dụng:** Chainlink Runtime Environment (TS SDK), CLI config.
- **Tính năng:** Kịch bản luồng công việc (Workflow automation) chạy trên mạng lưới Oracle phi tập trung (DON).
- **Sử dụng như thế nào?** Viết file `workflow.ts` chia thành từng Node Task: `OnEvent -> Llama -> PromptUser -> Swap -> Settle`. Hệ thống DON của Chainlink sẽ duy trì vòng lặp sống, truyền data từ Naryo sang 0G, rồi chờ `User Interface` bật cờ Privacy, trước khi push lệnh xuống Uniswap.
- **Target (Tại sao cần?):** Tránh hiện tượng "PC sập là Agent chết" (Single point of failure). Workflow được thực thi phân tán, bất biến, và ko thể bị gián đoạn.

### 2.4. User Interface (Privacy Toggle)
- **Tech sử dụng:** CLI Interface / Node `readline` / Tương lai là Web App.
- **Tính năng:** Dựa trên `Risk Score` AI trả về, hỏi Người dùng hoặc Auto-mode để kích hoạt Privacy.
- **Sử dụng như thế nào?** Nếu User bấm "YES", CRE Workflow cấm việc publish log giao dịch public. Nếu "NO", đẩy tín hiệu cho Hedera ghi Audit Log on-chain.
- **Target (Tại sao cần?):** Trả lại quyền quyết định "Minh bạch" hay "Bảo mật" cho chính chủ Agent. 

### 2.5. Uniswap API (Execution)
- **Tech sử dụng:** Uniswap Universal Router API, ethers.js.
- **Tính năng:** Routing và thực thi Permissionless Swap on-chain.
- **Sử dụng như thế nào?** CRE nhận lệnh Swap từ Agent (VD: Đổi 0.1 ETH lấy khooảng 350 USDC). Gọi /quote API tìm đường rẻ nhất, sau đó dùng Private Key của Agent ký giao dịch đẩy thẳng vào Unichain Sepolia L2 mạng ETH.
- **Target (Tại sao cần?):** Đảm bảo tính thanh khoản cao nhất. Không dựa dẫm vào CEX, mọi thứ phải phi tập trung hoàn toàn.

### 2.6. Hedera Agent Kit & HCS-14 (Payment & Audit)
- **Tech sử dụng:** Hedera Agent Kit (JS), HCS (Consensus Service), x402 header.
- **Tính năng:** Lõi thanh toán vi mô (Micropayments), định danh Agent (Universal ID).
- **Sử dụng như thế nào?**
  - **Audit:** Mỗi Agent lúc sinh ra được tạo 1 `Topic HCS-14`. Mọi hành vi (trừ khi bật cờ Privacy) đều dán JSON string vào Topic này.
  - **Payment/A2A:** CRE gọi `AgentWallet.payAgent(...)` để chuyển khoản siêu vi (VD: 0.001 HBAR) trực tiếp từ ví User cho ví của đội ngũ làm chiến lược mô hình AI hoặc Data Provider.
  - **x402:** Bất cứ API từ ngoài gọi vào Agent đều kèm header chứa proof đã đóng hụi bằng HBAR.
- **Target (Tại sao cần?):** Agent economy cần thanh toán liên tục (mỗi 10s một luồng suy luận). Dùng L2 Ethereum trả phí 0.5$ cho 1 tác vụ 0.01$ là vô nghĩa. Hedera là platform duy nhất thực hiện việc này với phí 0.0001$ cố định, cộng hưởng sổ cái kiểm toán HCS chống chối bỏ.

---

## 3. Luồng Vận hành Chi tiết (Detailed Main Flow)

Luồng (Flow) dưới đây ánh xạ 100% khớp với biểu đồ kiến trúc hệ thống bên trên.

1. **Scan DeFi pool (Naryo Listener)**  
   *Module liên đới:* `Naryo`  
   Naryo lắng nghe và gộp 2 giao dịch xả (sell) khối lượng lớn của ETH/USDC từ 2 chuỗi Hedera L1 và Unichain L2 trong 30s thành một `CorrelatedStory`. Câu chuyện này được đẩy vào Queue của **Chainlink CRE**.

2. **Recommend strategy (Chainlink CRE + 0G Compute & RAG)**  
   *Module liên đới:* `Chainlink CRE` -> `0G Compute` -> `0G Storage`  
   Chainlink CRE kích hoạt step phân tích. Nó lấy thêm 5 giao dịch cũ trong bộ nhớ phi tập trung từ `0G Storage RAG`. Đóng gói làm Context gửi `Sealed Inference` cho 0G. Môi trường TEE (bảo mật tuyệt đối, owner phần cứng 0G cũng ko đọc được) tính toán RiskScore là 3/10 (High Volume). Đề xuất: Hành động (Action) SWAP lập tức. Trả Output JSON về cho Chainlink CRE.

3. **Privacy option (User Interface - Privacy Toggle)**  
   *Module liên đới:* `Chainlink CRE` lên `USER INTERFACE`  
   Quy trình tạm dừng. UI hiển thị thông số RiskScore. Người dùng thấy rủi ro thấp (3/10) và bấm "NO" (Không cần che giấu/Private). 
   *Lưu ý: Nếu bật Auto-mode, hệ thống tự giải quyết qua Privacy Vault.*

4. **Automate investing (Uniswap swap + Hedera micropayment)**  
   *Module liên đới:* `Chainlink CRE` -> `Uniswap API L2` & `Hedera Agent Kit`  
   Bởi User chọn thực thi, CRE đi tiếp 2 nhánh chạy song song (Parralel Execution):
   - **Nhánh Swap:** Gọi Uniswap API lấy định tuyến tối ưu (Route), ký giao dịch xả lượng ETH trên Unichain L2. Thu USDC về.
   - **Nhánh Hedera Settle:** Vì cờ Privacy=NO, Hedera Agent Kit đẩy message: `{"action": "swap ETH", "timestamp": "...", "status": "success"}` đính vào cuốn sổ cái `HCS-14` của Agent. Tiếp tục sử dụng `AgentKit` để bắn phí công lao/x402 (0.001 HBAR) cho ví của Data Provider (hoặc Developer).

Toàn bộ quy trình hoàn tất trong vài giây mà không cần một server Backend (Node.js) cứng nhắc nào. 100% On-chain và Decentralized Network (Chainlink, Hedera, 0G).

---

## 4. Đánh giá Điểm Mạnh, Điểm Yếu và System Impact

### Đánh giá Điểm mạnh & Yếu 
| Tính năng | Điểm Mạnh (Strengths) | Điểm Yếu (Weaknesses) |
|---|---|---|
| **Privacy Sealed Inference** | Đảm bảo tính chống front-run hoàn hảo. | User phải tin tưởng TEE network của 0G (Chưa có zk-proof 100%). |
| **A2A / Pay-per-request** | Cấu trúc Web3 đầu tiên cho phép "Bóc lột" Agent thay vì Server. Sub-cent fees qua Hedera. | Phức tạp cho User mới khi cài đặt (cần ví Hedera lẫn ví EVM). |
| **Decentralized Cron (CRE)** | Zero Downtime, không sợ server sập. | Thêm Dependency lớn từ API của Chainlink DON. |
| **Multichain Naryo** | Alpha trade mở rộng vượt L1. Thấy cả Hedera DEX và Uniswap L2 gộp lại bằng toán học. | Arbitrage cơ bản bị rào cản độ trễ (latency) của cross-chain RPC. |

### System Impact (Ảnh hưởng Hệ thống)
Hệ thống này chứng minh phương pháp ghép Lego Web3 chuẩn mực cho **Nền kinh tế Đại lý (Agentic Economy)**: 
1. Không còn AI Agent đồ chơi (Chỉ chat qua lại bằng OpenAPI OpenAI).
2. Agent có danh tính (HCS-14, iNFT), có não bộ nhớ dai (0G Storage), biết giấu nghề (Sealed TEE 0G), biết mượn tay trung gian mạnh (Uniswap V3), tự biết xài tiền trả nợ (Hedera x402), và tự chạy mà không cần ông chủ cắm điện (Chainlink CRE).

---

## 5. Đánh giá Cost (Phân tích chi phí thực thi Demo Testnet / Mainnet)

Đây là chi phí vận hành cho việc AI Agent giữ vị thế 24/7 (Cứ 30s lại Scan và Inference 1 lần).

| Thao tác (Operation) | Testnet Cost | Ước tính Mainnet | Tech Provider | Đánh dấu |
|---|---|---|---|---|
| Gọi phân tích AI / Cụm Naryo | Free | $0.001 - $0.005 | 0G Compute | Liên tục |
| Lưu lịch sử ngắn RAG | Free | < $0.0001 | 0G Storage | Liên tục |
| Ghi sổ cái On-chain (HCS) | Free | ~ $0.0001 cố định | Hedera | Theo Swap |
| Micropayment thù lao A2A | Free | ~ $0.0001 cố định | Hedera | Theo Swap |
| CRE Workflow (Event trigger) | Free | $0.01 (LINK vi mô) | Chainlink | Liên tục |
| Tiền GAS swap Token | L2 Sepolia | $0.3 - $2.00 | Unichain/Base L2 | Theo Swap |

**Kết luận Cost Assessment:** 
Thiết kế của chúng ta là cực kỳ tối ưu vì **bóc tách hoàn toàn lớp Tư duy AI và lớp Thanh toán Blockchain**.
Nếu dồn tất cả tư duy và Smart contract vào 1 khối L1 Ethereum hay L2, gas để duy trì AI sẽ đốt bay hàng chục đô mỗi phút. Với kiến trúc này, 0G gánh phần não siêu rẻ, Hedera gánh phần thanh toán vi mô siêu rẻ. Điểm tốn kém duy nhất là Unichain Swap L2 (Chỉ xảy ra khi AI chắc chắn lệnh trade có lãi > $3.00 để bù gas). 
Hệ thống này hoàn toàn **Commercially Viable (Có khả năng thương mại hóa thực tiễn).**
