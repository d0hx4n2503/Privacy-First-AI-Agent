# ⚙️ Hướng dẫn Cài đặt Môi trường (Environment Setup Guide)

Dự án này tích hợp 5 nhà tài trợ khác nhau. Việc ĐẦU TIÊN bạn cần làm là copy file `.env.example` sang `.env`:

```bash
cp .env.example .env
```

Trong file `.env.example` đã điền sẵn 80% các đường link RPC/Endpoint thiết yếu. Bạn **CHỈ CẦN** rà soát và ghi đè những **Key Bí Mật** dưới đây vào file `.env` vừa tạo để chạy Mạng Thật (Real Execution):

---

## 1. Hedera (Agent Kit & HCS-14)
Hedera yêu cầu tài khoản Testnet để trả phí HBAR (ví dụ: giao dịch HCS, chuyển tiền micropayment).

- **Bước 1**: Truy cập [Hedera Developer Portal](https://portal.hedera.com/register).
- **Bước 2**: Đăng ký hoặc đăng nhập. Hệ thống sẽ cấp sẵn cho bạn một tài khoản **Testnet**.
- **Bước 3**: Copy `Account ID` (định dạng `0.0.xxxxx`) điền vào `HEDERA_OPERATOR_ID`.
- **Bước 4**: Copy `DER Encoded Private Key` (hoặc ECDSA Hex) điền vào `HEDERA_OPERATOR_KEY`.

---

## 2. 0G Labs (Compute TEE & Storage)
Máy ảo 0G Compute yêu cầu có tài khoản trên mạng 0G Testnet (Newton/Galileo) để thực hiện Sealed Inference.

- **Bước 1**: Tạo một ví EVM mới trên MetaMask. Chọn Export Private Key (Chuỗi bắt đầu bằng `0x...`).
- **Bước 2**: Điền Private Key này vào `ZG_PRIVATE_KEY` và `TRADER_PRIVATE_KEY` trong file `.env`.
- **Bước 3**: Thêm mạng **0G Newton Testnet** vào MetaMask:
  - Network Name: `0G Newton Testnet`
  - RPC URL: `https://evmrpc-testnet.0g.ai` (Đã có sẵn trong `.env` mục `ZG_RPC_URL`)
  - Chain ID: `16600`
  - Currency Symbol: `A0GI`
- **Bước 4**: Xin Faucet token Testnet của 0G tại: [0G Faucet](https://faucet.0g.ai/). Điền địa chỉ ví của bạn vào để nhận token `A0GI` làm phí Gas cho mạng lưới trên.

---

## 3. Uniswap (Routing API & Execution)
Để tìm đường rate tốt nhất và swap trên mạng lưới Unichain Testnet (Sepolia), bạn cần API Key từ Uniswap.

- **Bước 1**: Truy cập [Uniswap Developer Portal](https://developers.uniswap.org/).
- **Bước 2**: Đăng ký tài khoản và tạo một API Key mới (Free tier).
- **Bước 3**: Sao chép API Key vào `UNISWAP_API_KEY`.
- **Bước 4**: Đảm bảo ví `TRADER_PRIVATE_KEY` (ví MetaMask ở mục 2) có chứa Sepolia ETH trên mạng **Unichain Sepolia**. Bạn có thẻ xin ETH ở các Faucet công cộng (như Alchemy, Infura). File `.env` đã gán sẵn `TRADER_CHAIN_ID=11155111` và `UNICHAIN_RPC_URL` cho mạng này.

---

## 4. Chainlink CRE (Workflow Orchestration)

Trong dự án này, toàn bộ quá trình tự động hóa (Orchestration) luồng của AI Agent được vận hành bởi **Chainlink Runtime Environment (CRE)**.

Để config các thông số này, bạn cần cài đặt Chainlink CRE CLI:

- **Bước 1**: Cài đặt CRE CLI toàn cầu trên máy:
   ```bash
   npm install -g @chainlink/cre-cli
   ```
- **Bước 2**: Khóa `CRE_SIGNING_KEY` trong `.env`: Đây là khóa để ký lên mạng lưới Oracle DON lúc đúc Workflow của riêng bạn. Bạn có thể dùng luôn Private Key của ví MetaMask trên hoặc tự sinh một cái mới cấu trúc `0x...`
- **Bước 3**: Giữ nguyên mạng ảo DON `CRE_DON_URL=https://don.testnet.chainlink.io`.
- **Bước 4**: Lấy **`CRE_WORKFLOW_ID`** bằng cách cho chạy giả lập (Simulate) mã Workflow của AI Agent thông qua CLI:
   ```bash
   cre simulate src/chainlink/workflow.ts --config src/chainlink/cre-config.yaml
   ```
   Nếu Simulate không lỗi, hãy chạy lệnh Deploy lên DON Testnet:
   ```bash
   cre deploy src/chainlink/workflow.ts --config src/chainlink/cre-config.yaml
   ```
   Sau khi hoàn tất, Terminal sẽ in ra một đoạn Hash (ví dụ: `wkf_1234abcd5678`). Hãy dán (Paste) mã này vào biến `CRE_WORKFLOW_ID` trong `.env` để Agent biết cách gọi quy trình chính xác!

---

## 5. Triển khai Smart Contract (Deployment)

Đây là các Smart Contract để lưu trữ Agent Identity và Privacy Hash. Việc deploy cần thực hiện **TRƯỚC** khi chạy ứng dụng thực tế.

### Môi trường cần thiết:
Ví thiết lập tại `HEDERA_OPERATOR_KEY` cần có Testnet HBAR.
Ví thiết lập tại `ZG_PRIVATE_KEY` cần có A0GI Token mạng 0G.

### Cú pháp Deploy:

1. **Cài đặt & Compile Contract:**
   ```bash
   npm install
   npx hardhat compile
   ```

2. **Deploy lên mạng Hedera Testnet (EVM):**
   ```bash
   npx hardhat run contracts/deploy.ts --network hedera-testnet
   ```
   *Terminal sẽ output ra 2 địa chỉ: `AgentRegistry` và `PrivacyVault`.*

3. **Deploy lên mạng 0G Chain (Tùy chọn cho iNFT):**
   ```bash
   npx hardhat run contracts/deploy.ts --network zerog-testnet
   ```

### Cập nhật `.env` sau khi deploy
Copy các địa chỉ in ra từ Terminal và ghi đè vào 2 trường còn trống trong `.env`:

```env
AGENT_REGISTRY_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
PRIVACY_VAULT_ADDRESS=0x8382d5Cc6634C0532925a3b844Bc454e4438f22f
```

---

## 6. Lấy AGENT_TOPIC_ID (Hedera HCS-14)

Để lấy được mã sổ cái chung của Agent trên Hedera, bạn hãy chắc chắn rằng `HEDERA_OPERATOR_KEY` trong `.env` đã được điền đúng. Sau đó chạy lệnh CLI:

```bash
npm run register-agent
```

Hệ thống sẽ kết nối lên Hedera, đăng ký một HCS Topic và trả về giá trị (VD: `0.0.456678`). Copy giá trị này bỏ vào `.env`:

```env
AGENT_TOPIC_ID=0.0.456678
```

🎉 Xin chúc mừng, bạn đã cấu hình xong 100% ứng dụng! Giờ có thể chạy `npm run start` thay cho `npm run demo`!
