# 🛡️ Orion Privacy-First AI Agent (Triple-Proof Edition)

[![0G Network](https://img.shields.io/badge/Network-0G%20Newton-blue)](https://0g.ai)
[![Chainlink](https://img.shields.io/badge/Oracle-Chainlink%20CRE-blue)](https://chain.link)
[![ERC-7857](https://img.shields.io/badge/Identity-ERC--7857%20iNFT-green)](https://eips.ethereum.org/EIPS/eip-7857)

Dự án này là một **AI Agent tự hành (Autonomous Agent)** tập trung vào quyền riêng tư, được xây dựng trên **0G Network**, **Chainlink CRE**, và **Uniswap**. Agent sử dụng tiêu chuẩn **iNFT (ERC-7857)** để thiết lập danh tính On-chain và thực hiện các chiến thuật DeFi (Liquidity/Swap) một cách minh bạch nhưng vẫn bảo mật tuyệt đối.

---

## 🔥 Các tính năng cốt lõi (Core Innovation)

### 1. 🧬 ERC-7857: Intelligence NFT (iNFT)
Một AI Agent không chỉ là một chiếc ví. Chúng tôi sử dụng tiêu chuẩn **ERC-7857** để đúc iNFT, biến Agent thành một thực thể có "hệ điều hành" riêng (Model, Resource, Metadata) được đăng ký trên **0G Agent Registry**.

### 2. 🧠 0G Compute: Sealed Inference (TEE)
Mọi quyết định đầu tư được xử lý thông qua **0G Compute** (Môi trường thực thi tin cậy - TEE). Điều này đảm bảo phân tích của AI là "Sealed" (được niêm phong), không thể bị can thiệp và chỉ có chủ sở hữu mới truy cập được nội dung chi tiết.

### 3. 💿 0G Storage: Decentralized RAG Memory
Agent lưu giữ "trí nhớ" (Lịch sử giao dịch và phân tích quá khứ) trực tiếp trên **0G Storage**. Mọi hành động đều được đóng dấu mã Hash (Proof of Action), tạo ra một nhật ký hành vi bất biến.

### 4. 🏛️ StrategyVault & PrivacyVault
- **StrategyVault**: Thực hiện các lệnh phức tạp (Swap + Add Liquidity) trên Sepolia chỉ trong **01 giao dịch (Zapper)**.
- **PrivacyVault**: Tạo liên kết mật mã giữa Phân tích AI và kết quả giao dịch thực tế, giúp Agent chứng minh được là mình đã làm đúng nhưng không làm lộ chiến thuật cho đối thủ.

---

## 🛠️ Kiến trúc "Triple Proof"

Hệ thống cung cấp 03 lớp bằng chứng cho mọi hành động:
1.  **Proof of Identity**: Xác thực qua iNFT (Registry).
2.  **Proof of Intelligence**: Xác thực phân tích AI qua 0G Storage Hash.
3.  **Proof of Execution**: Xác thực giao dịch qua Uniswap VM (Sepolia).

---

## 🚀 Bắt đầu nhanh (Quick Start)

### Cài đặt
```bash
npm install
cp .env.example .env
# Nhập các Private Keys: ADMIN_PRIVATE_KEY, USER_PRIVATE_KEY, CRE_SIGNING_KEY...
```

### Triển khai hệ thống (Dành cho Admin)
```bash
# Deploy bộ 3 0G Infra (Registry, INFT, Vault)
node lightning_deploy.js
```

### Định danh Agent (Dành cho User)
```bash
# Đúc iNFT của riêng bạn và đăng ký trên 0G
npx ts-node src/cli.ts mint-inft
```

### Vận hành & Phân tích
```bash
# Phân tích danh sách Pool và đầu tư tự chọn
npx ts-node src/cli.ts analyze --file examples/pools.json --top 3
```

### Kiểm chứng On-chain
```bash
# Đọc toàn bộ nhật ký hành trình của Agent trên 0G Chain
npx ts-node tools/verify-onchain.ts
```
