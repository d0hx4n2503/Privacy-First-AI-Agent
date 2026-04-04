# 📘 Master Guide: Orion AI Agent (Step-by-Step)

Tài liệu này hướng dẫn chi tiết cách khởi chạy, sử dụng và kiểm chứng hệ thống **Privacy-First AI Agent** trên 0G Network.

---

## 🛠️ Bước 1: Thiết lập .env (Preparation)

Hãy đảm bảo rằng file `.env` của bạn chứa đầy đủ thông tin sau:

```env
# ── Private Keys ──
ADMIN_PRIVATE_KEY=0x... # Key dùng để Deploy hạ tầng
USER_PRIVATE_KEY=0x...  # Key của bạn (Dòng này cực kỳ quan trọng)
CRE_SIGNING_KEY=0x...   # Key dùng để xác thực Chainlink CRE

# ── 0G Infrastructure ──
ZG_RPC_URL=https://evmrpc-testnet.0g.ai
ZG_STORAGE_URL=https://indexer-storage-testnet-standard.0g.ai
ZG_COMPUTE_URL=https://api-compute.testnet.0g.ai

# ── Contract Addresses ──
AGENT_ADDRESS=0x... (Địa chỉ ví USER tương ứng với USER_PRIVATE_KEY)
AGENT_REGISTRY_ADDRESS=0x...
INFT_CONTRACT_ADDRESS=0x...
PRIVACY_VAULT_ADDRESS=0x...
STRATEGY_VAULT_ADDRESS=0x... (Trên Sepolia)
```

---

## 🌐 Bước 2: Triển khai hạ tầng (Admin Only)

Nếu bạn chưa triển khai Smart Contract lên 0G Network, hãy chạy lệnh sau để tự động cấu hình (Deployment):

```bash
# Script này tự động Deploy: AgentRegistry, INFT, và PrivacyVault
# Nó cũng tự động cập nhật địa chỉ mới vào file .env cho bạn.
node lightning_deploy.js
```

---

## 👤 Bước 3: Đúc iNFT (Onboarding)

Agent của bạn cần một danh tính để bắt đầu hoạt động. Bạn hãy thực hiện đúc iNFT (Intelligence NFT) đầu tiên:

```bash
# Mint iNFT và đăng ký trên 0G Agent Registry
npx ts-node src/cli.ts mint-inft --model "ORION-Llama3-Sealed" --resource "0G-Compute-Cluster-1" --uri "ipfs://production-v1"
```

---

## 🧠 Bước 4: Chạy Phân tích & Thực thi (Manual Mode)

Khi đã có iNFT, bạn có thể thực hiện chạy Agent ở chế độ **Thủ công** để tự chọn Pool và nhập số lượng đầu tư (Amount):

```bash
npx ts-node src/cli.ts analyze --file examples/pools.json --top 3
```

Trong quá trình chạy:
1. **Selection**: Chọn Rank của Pool (nhập số `1`, `2` hoặc `3`).
2. **Amount**: Nhập số lượng ETH muốn đầu tư (ví dụ: `0.005`).
3. **Privacy**: Chọn `Y` để bật liên kết bảo mật PrivacyVault.

---

## 🚀 Bước 5: Chạy Tự hành (Autonomous Auto-invest)

Nếu bạn muốn Agent tự động phân tích và chọn Pool tốt nhất để đầu tư:

```bash
# Agent sẽ tự chọn Pool có Rank 1 và thực hiện đầu tư 0.001 ETH
npx ts-node src/cli.ts analyze --file examples/pools.json --auto-invest --top 3
```

---

## 🛡️ Bước 6: Kiểm chứng On-chain (Verification)

Để chứng minh với mọi người rằng Agent của bạn đã thực sự hoạt động và lưu bằng chứng lên chuỗi:

```bash
npx ts-node tools/verify-onchain.ts
```

Bạn sẽ thấy báo cáo:
- **Status: OFFICIALLY REGISTERED**
- **Action Logs**: Danh sách toàn bộ các chiến thuật mà Agent đã chọn.
- **Proof Hash**: Link tới các giao dịch thực tế trên 0G Scan.

---

## 🖋️ Phân bổ Chữ ký (Signing Map)

Dưới đây là bảng phân bổ chi tiết các bước cần thực hiện Ký (Signature) khi vận hành Agent:

| Hành động | Ai Ký? | Key sử dụng | Mục đích |
| :--- | :--- | :--- | :--- |
| **Triển khai Hạ tầng** | **Admin** | `ADMIN_PRIVATE_KEY` | Tạo ra các Contract trên 0G và Sepolia. |
| **Đúc iNFT** | **User** | `USER_PRIVATE_KEY` | Tạo danh tính và xác lập quyền sở hữu Agent. |
| **Nạp tiền (Deposit)** | **User** | `USER_PRIVATE_KEY` | Chuyển ETH vào Vault để Agent có vốn hoạt động. |
| **Ghi hồ sơ 0G** | **User** | `USER_PRIVATE_KEY` | Đóng dấu bằng chứng AI trên 0G Registry (Proof of Action). |
| **Workflow CRE** | **User** | `CRE_SIGNING_KEY` | Xác thực chiến thuật qua cổng Chainlink CRE. |
| **Thực thi Zapper** | **Admin** | `ADMIN_PRIVATE_KEY` | Kích hoạt giao dịch DeFi trên Sepolia (Relayer/Operator). |
| **Bảo mật (Linking)** | **User** | `USER_PRIVATE_KEY` | Liên kết Chiến thuật và Giao dịch vào PrivacyVault. |

---

## 💡 Lưu ý quan trọng
- Luôn giữ một ít **A0GI (0G Token)** trong ví Admin và User để trả phí Gas.
- Luôn giữ một ít **ETH Sepolia** trong ví User để thực thi lệnh Zapper trên Uniswap.
- Link 0G Newton Explorer: [https://chainscan-newton.0g.ai/](https://chainscan-newton.0g.ai/)
