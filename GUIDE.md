# 📜 Technical Architecture Guide: Groq Alpha AI Internal Logic

Chào mừng bạn đến với tài liệu hướng dẫn kỹ thuật chuyên sâu dành cho các nhà phát triển. Đây là bản đặc tả kỹ thuật (Technical Specification) mô tả chi tiết "hệ thần kinh", "đôi tay thực thi" và "hệ giác quan" của Groq Alpha AI.

---

## 🏛 1. Kiến trúc ECA (Event-Condition-Action) & Loop Tự quản

Toàn bộ logic của Agent hoạt động trong một vòng lặp sự kiện bất đối xứng, kết hợp giữa AI và Blockchain:

1.  **Lớp Cảm nhận (Sensing Layer)**: `src/services/naryo/listener.ts` 
    - Quét các Blocks hằng giây trên các mạng EVM. 
    - Lọc các sự kiện `Swap` và `Mint` từ Uniswap V3 Factory. 
    - Nhận diện các sự kiện lớn vượt ngưỡng (Threshold) để báo động cho AI.
2.  **Lớp Phân tích Chiến lược (Strategy Layer)**: `src/agent/agent.ts`
    - Nhận `CorrelatedStory` (Câu chuyện thị trường đã được lọc nhiễu).
    - Gọi hệ thống **RAG (Retrieval-Augmented Generation)**: Truy xuất các quyết định tương tự trong quá khứ từ 0G Storage Nodes.
    - Gọi **GroqService (Llama-3.3-70B)**: Phân tích 4 Quadrant với bộ kỹ năng `StrategySkill.md`.
3.  **Lớp Điều phối & Attestation (Orchestration Layer)**: `src/core/orchestrator.ts`
    - Chốt phương án đầu tư (INVEST/HOLD/WITHDRAW).
    - Ghi Proof (Hash của Reasoning) lên Smart Contract **0G Registry** qua hàm `logAction`.
    - Trình bằng chứng lên mạng lưới 0G để công khai hóa quyết định của AI.
4.  **Lớp Thực thi (Execution Layer)**: `src/services/uniswap/`
    - `LiquidityManager`: Tính toán các thông số Tick/Price để cung cấp thanh khoản tối ưu (V3 NFT Position).
    - `UniswapExec`: Thực hiện lệnh Swap để cân bằng rổ tài sản.

---

## 🌐 2. Infrastructure Deep-Dive: 0G Network & Chainlink CRE

Đây là lớp nền tảng tạo nên sự tin cậy (Trustless) của dự án:

### 🧩 0G Network (0-Gravity Stack)
*   **0G Storage (Đĩa cứng phi tập trung)**:
    - **Vị trí**: `src/services/zero-g/storage.ts`.
    - **Vai trò**: Lưu trữ dữ liệu lớn (JSON, Reasoning, Logs). Dữ liệu được băm Merkle Tree để đảm bảo không thể bị sửa đổi sau khi đã lưu.
    - **Tại sao?**: Làm bộ nhớ tri thức cho AI, giúp AI không bị "mất trí" khi Server tắt.
*   **0G Registry (Dấu vân tay On-chain)**:
    - **Vị trí**: `src/core/orchestrator.ts` -> Calls Contract trên 0G Galileo.
    - **Vai trò**: Lưu vết (Audit Trail). Mọi bước đi của Agent đều để lại dấu vết vĩnh viễn trên Explorer.
*   **0G Compute (Sealed Inference/TEE)**:
    - **Vị trí**: `src/services/zero-g/inference.ts`.
    - **Vai trò**: Bảo mật suy luận. Giấu kín các câu Prompt nhạy cảm của chuyên gia Strategy trong môi trường phần cứng tin cậy.

### ⛓ Chainlink CRE (Workflow Orchestrator)
Dự án không gọi trực tiếp các lệnh DeFi mà đưa qua Chainlink Compute Runtime Environment (CRE).
- **Vị trí**: `src/services/chainlink/workflow.ts` & `cre-config.yaml`.
- **Logic**: CRE kiểm tra `Validate Input` (Lệnh có đúng từ Agent không?) -> `Price Check` (Giá Oracle có khớp giá AI không?) -> `Order Execution`.
- **Giá trị**: Ngăn chặn AI bị hack hoặc ra lệnh đầu tư vào các token rác không có thanh khoản thực.

---

## 📂 3. Phân tích Chi tiết Thư mục & Dòng Code (Full Folder Breakdown)

### 🔹 `src/agent/` - Trí tuệ AI
*   `agent.ts`: Class chính điều khiển LLM. Định nghĩa Identity thông qua iNFT Profile.
*   `inft.ts`: Logic quản lý iNFT (Metadata, URI on 0G Storage).

### 🔹 `src/core/` - Hệ điều hành
*   `orchestrator.ts`: File trung tâm điều phối Sensing -> Reasoning -> Execution. Chứa hàm `handleStory()` xử lý mọi biến động thị trường.
*   `privacy.ts`: Logic định tuyến bảo mật cho người dùng (Privacy Preserving Routing).

### 🔹 `src/services/ai/` - Giao tiếp Groq
*   `groq.ts`: Dịch vụ kết nối API tốc độ cao. Sử dụng cơ chế JSON Extraction để bóc tách chiến lược từ LLM Output.

### 🔹 `src/services/uniswap/` - Kỹ thuật DeFi
*   `swap.ts`: Thực hiện Swap qua Universal Router.
*   `liquidity.ts`: Quản lý V3 NFT Positions (Mint, Burn, Collect Fees).
*   `screener.ts` & `reporter.ts`: Logic phân tích đồng thời nhiều Pool và in báo cáo chuyên nghiệp.

### 🔹 `src/services/naryo/` - Giác quan
*   `listener.ts`: Quét sự kiện phi tập trung qua RPC.
*   `correlator.ts`: Logic thông minh gom nhóm sự kiện theo cặp Token.

---

## 📜 4. Chi tiết về Smart Contracts (Solidity Layer)

Dự án sử dụng Foundry để quản lý 4 hợp đồng cốt lõi trong `src/`:

1.  **`AgentRegistry.sol`**: Lưu trữ lịch sử `logAction`. Đây là nơi tất cả bằng chứng của AI được chốt sổ (Finality).
2.  **`INFT.sol`**: Khởi tạo danh tính "Digital Persona" cho Agent trên On-chain.
3.  **`PrivacyVault.sol`**: Lưu trữ và quản lý tài sản chuyển tiếp, giúp giao dịch của Agent không lộ chi tiết ví Trader ban đầu.
4.  **`StrategyVault.sol`**: Hợp đồng thực thi các chiến lược đầu tư tự động từ AI.

---

## 🧠 5. Mô hình Tư duy 4-Quadrant (StrategySkill.md)

AI được cấu hình để phân tích theo 4 trục chính:
1.  **Market Sentiment (🌐)**: Đo lường độ "nóng" của thị trường qua Volume/TVL Ratio.
2.  **Technical Health (🧬)**: Phân tích cấu trúc Pool, Liquidity Depth và Price Impact.
3.  **Yield Analysis (💰)**: Đánh giá APY, phí giao dịch và hiệu quả sử dụng vốn.
4.  **Risk Mitigation (🛡️)**: Chấm điểm rủi ro rổ tài sản và đưa ra thông số trượt giá (Slippage) tối ưu.

---

## 🛠 6. Developer Workflow: Cách mở trợ hệ thống

1.  **Nâng cấp trí tuệ**: Sửa `StrategySkill.md` để AI học thêm kỹ năng mới.
2.  **Thêm cặp Token mới**: Cập nhật danh sách quan sát trong `PoolScreener`.
3.  **Đổi Brain**: Thay thế `GroqService` bằng một Provider khác thông qua Interface AI chuẩn hóa.

---

**Tài liệu này cung cấp toàn bộ kiến thức cần thiết để một Developer có thể làm chủ hệ sinh thái Groq Alpha AI.**
