# 🤖 Groq Alpha AI: The Privacy-Preserving Autonomous DeFi Giant

![Banner](https://github.com/your-repo/banner.png)

> **Groq Alpha AI** là một hệ thống Agent AI DeFi thế hệ mới, được thiết kế để định nghĩa lại cách thức con người tương tác với thanh khoản phi tập trung. Bằng cách kết hợp tốc độ suy luận "vô đối" của **Groq Llama-3.3-70B** với nền tảng lưu trữ và xác thực của **0G Network**, chúng tôi mang đến một thực thể AI có khả năng tự quản hoàn toàn, bảo mật tuyệt đối và minh bạch On-chain.

---

## 🌌 Tầm nhìn và Triết lý (Philosophy)
Trong kỷ nguyên DeFi, tốc độ và sự bảo mật là hai yếu tố sống còn. Groq Alpha AI giải quyết bài toán này bằng cách:
*   **Tốc độ (Speed)**: Tận dụng cơ sở hạ tầng LPU của Groq để đưa ra quyết định đầu tư trong milliseconds.
*   **Riêng tư (Privacy)**: Sử dụng các giải pháp TEE và Chainlink CRE để giấu kín ý đồ chiến lược khỏi các Bot MEV.
*   **Bằng chứng (Trust)**: Mọi suy luận của AI không còn là một "hộp đen". Chúng được băm (hash) và lưu trữ bền vững trên 0G Storage làm bằng chứng vĩnh viễn.

---

## 🛠 Toàn cảnh Hệ sinh thái Công nghệ (Tech Stack)

### 🔹 Trí tuệ Nhân tạo (Intelligence Layer)
*   **Inference Engine**: Groq Llama-3-70B-Instruct (Primary) / 0G Compute TEE (Private).
*   **Strategic Brain**: Hệ thống Prompt kỹ thuật chuyên sâu (`StrategySkill.md`) mô phỏng tư duy của các nhà quản lý quỹ DeFi hàng đầu.
*   **Knowledge Bank**: Hệ thống RAG (Retrieval-Augmented Generation) lấy dữ liệu từ lịch sử giao dịch trên 0G Storage.

### 🔹 Giao thức 0G (0G Network Stack) - Hạ tầng cốt lõi
*   **0G Storage (Decentralized RAG)**: Lưu trữ phi tập trung cho bộ nhớ Agent. Được xử lý trong `src/services/zero-g/storage.ts`.
*   **0G Registry (On-chain Attestation)**: Hợp đồng thông minh ghi nhận mọi hành động (Attestation). Chi tiết tại `src/core/orchestrator.ts`.
*   **0G Compute (Sealed Inference)**: Môi trường thực thi tin cậy (TEE) cho việc gọi AI bảo mật.
*   **iNFT (Verifiable Identity)**: Danh tính định danh duy nhất của Agent trên chuỗi khối 0G.

### 🔹 DeFi & Infrastructure
*   **Uniswap V3**: Giao thức thực thi thanh khoản mục tiêu trên Sepolia/Unichain.
*   **Chainlink CRE (Workflow Orchestrator)**: Điều phối quy trình và định tuyến bảo mật thông minh. Đảm bảo lệnh giao dịch không bị can thiệp.

---

## 📦 Cài đặt & Thiết lập Môi trường (Environment Setup)

Để triển khai Groq Alpha AI, hãy thực hiện theo đúng 6 bước sau đây:

### Bước 1: Clone Source Code
```bash
git clone <your-repo-link>
cd <project-folder>
```

### Bước 2: Cài đặt Thư viện Node.js
Sử dụng npm hoặc yarn để cài đặt các Dependency cần thiết:
```bash
npm install
```

### Bước 3: Cài đặt Foundry (Nếu bạn muốn triển khai Smart Contracts)
Dự án sử dụng Foundry để quản lý Solidity Layer. Nếu máy bạn chưa có Forge/Cast, hãy chạy lệnh sau:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Bước 4: Cấu hình Biến môi trường (.env)
Tạo file `.env` từ file mẫu và điền chính xác các thông tin:
```bash
cp .env.example .env
```

**Bảng hướng dẫn lấy dữ liệu cho `.env`:**

| Biến (Variable) | Ý nghĩa & Nơi lấy dữ liệu (Where to get) |
| :--- | :--- |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com/keys) - Bộ não AI Agent. |
| `ZG_RPC_URL` | `https://evmrpc-testnet.0g.ai` (0G Newton Testnet). |
| `ZG_PRIVATE_KEY` | Private Key ví chứa 0G test token (Sử dụng để ghi log On-chain). |
| `ZG_INDEXER_URL` | `https://indexer-storage-testnet-standard.0g.ai`. |
| `TRADER_PRIVATE_KEY` | Private Key ví dùng để thực thi lệnh Swap/LP trên Sepolia. |
| `ETHEREUM_RPC_URL` | Endpoint mạng Sepolia (Dùng Infura, Alchemy hoặc `https://rpc.sepolia.org`). |
| `AGENT_REGISTRY_ADDRESS` | `0xa1cf32168fbc3967d3cd066925e01bd80766cd5d` |

### Bước 5: Biên dịch Smart Contracts
Dùng Forge để biên dịch các hợp đồng Solidity:
```bash
npm run compile   # Hoặc: forge build
```

### Bước 6: Khởi chạy lần đầu (First Run)
Sử dụng chế độ Scouter để kiểm tra xem AI đã phân tích được thị trường chưa:
```bash
npm run analyze -- --file examples/pools.json
```

---

## ⚡ Các câu lệnh Vận hành nhanh (NPM Scripts)

Bạn có thể chạy các phím tắt này thông qua `npm run <command>`:

| Lệnh (Shortcut) | Ý nghĩa thực thi (What it does) |
| :--- | :--- |
| `npm run start` | Kích hoạt bộ não tự quản ở chế độ lắng nghe thị trường 24/7. |
| `npm run analyze` | Quét, phân tích và xếp hạng Pool đầu tư Alpha nhất. |
| `npm run scout` | Nghiên cứu sâu thị trường và đẩy Proof lên 0G Storage. |
| `npm run mint-inft` | Tạo danh tính iNFT xác thực cho Agent trên mạng 0G. |
| `npm run balance` | Xem số dư ví giao dịch (ETH, USDC) trên mạng Sepolia & 0G. |
| `npm run withdraw` | Rút thanh khoản khỏi một Position trên Uniswap V3 ngay lập tức. |
| `npm run deploy:0g` | Triển khai Registry và Vault lên mạng 0G Galileo qua `deploy.sh`. |

---

## 🛠️ Tham chiếu câu lệnh thực thi (Direct CLI - npx ts-node)

Sử dụng `npx ts-node src/cli.ts` để có quyền kiểm soát tham số linh hoạt nhất:

### 1. Kịch bản Phân tích chuyên sâu (Analyze)
```bash
npx ts-node src/cli.ts analyze --file examples/pools.json --auto-invest --top 3
```

### 2. Kịch bản Nghiên cứu & Audit On-chain (Scout)
```bash
npx ts-node src/cli.ts scout --file examples/test-pools.json
```

### 3. Kịch bản Rút vốn & Quản lý vị thế (Withdraw)
```bash
npx ts-node src/cli.ts withdraw <Token_ID_Position>
```

### 4. Vận hành trí tuệ liên tục (Start)
```bash
npx ts-node src/cli.ts start --interval 30000
```

---

## 💡 Ví dụ kịch bản vận hành thực tế (Practical Usage SCENARIOS)

### 1. Phân tích thị trường & Tự động xuống tiền (Auto-Invest)
AI sẽ quét danh sách trong `pools.json`, xếp hạng và tự động thực hiện nạp 0.001 ETH vào Pool tốt nhất:
```bash
npm run analyze -- --file examples/pools.json --auto-invest
```

### 2. Nghiên cứu sâu & Ghi bằng chứng On-chain (Scouting Mode)
Ghi Reasoning làm chứng cứ audit vĩnh viễn trên 0G Storage:
```bash
npm run scout -- --file examples/pools.json
```

---

## ⛓️ Triển khai Smart Contracts (EVM Deployment)

Nếu bạn muốn tự vận hành các Contract riêng:
1.  **Biên dịch**: `npm run compile`
2.  **Triển khai Registry/Vault**: `npm run deploy:0g` (Script chạy `bash deploy.sh`)
3.  **Xác minh**: Kiểm tra TX trên [0G Chainscan](https://chainscan-newton.0g.ai/).

---

## 🛡 Mô hình Bảo mật (Security Model)
Groq Alpha AI bảo vệ người dùng thông qua 3 lớp:
1.  **Isolation**: Suy luận AI nằm trong TEE.
2.  **Privacy Routing**: Lệnh Swap không gửi trực tiếp mà qua một lớp trung gian (PrivacyVault).
3.  **Proof of Strategy**: Cho phép kiểm chứng AI đã làm gì qua 0G Registry.

---

**© 2026 Groq Alpha AI - Pioneers of Decentralized Intelligence.**
