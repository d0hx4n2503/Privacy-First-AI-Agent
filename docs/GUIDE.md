# 📘 Privacy-First AI Agent: Production Guide

Hệ thống AI Agent thế hệ mới trên 0G Chain sử dụng mô hình **1-Click Factory (Mint-and-Register)** và kiến trúc **Multi-Agent**.

---

## 🏗️ 1. Kiến trúc Identity (ERC-7857 iNFT)

Sử dụng mô hình **Factory**. Khi chạy lệnh Mint, AgentRegistry sẽ:
1. **Mint iNFT**: Tạo Token định danh trên 0G Chain.
2. **Auto-Register**: Tự động liên kết chủ sở hữu vào danh bạ `AgentRegistry`.

### 🎨 Tùy chỉnh Agent Identity (SVG Metadata)
Bạn có thể cá nhân hóa Agent của mình tại:
- **File**: `src/services/zero-g/inft.ts`
- **Hàm**: `generateOnChainSVG()`
- **Chỉnh sửa**: Thay đổi mã màu HSL, Gradient hoặc Emoji hiển thị (Robot/Ghost) để Agent nổi bật trên ví.

---

## 🤖 2. Vận hành Multi-Agent

Hệ thống hỗ trợ quản lý không giới hạn số lượng Agent. Mỗi Agent có lịch sử (Proof) riêng biệt trên 0G Chain.

### Bước 1: Tạo Agent mới (iNFT #2)
```bash
npx ts-node src/cli.ts mint-inft --uri "ipfs://agent-v2" --model "Llama-3-TEE"
```

### Bước 2: Chạy phân tích với Agent cụ thể
Lệnh `analyze` sẽ kích hoạt trình chọn Agent tương tác:
```bash
npx ts-node src/cli.ts analyze --file examples/pools.json --top 3
```
> **Prompt**: `Select Agent ID to use (Default: 1):` -> Nhập `2`.

---

## 🏦 3. Quản lý tài sản (StrategyVault)

`StrategyVault` là quỹ ủy thác nơi AI thực thi lệnh trên Sepolia (Uniswap).

### Nạp tiền vào quỹ
```bash
npx ts-node tools/deposit-vault.ts --amount 0.01
```

### Kiểm toán túi tiền (Audit)
Để xem số dư thực tế trong hợp đồng:
```bash
npm run balance
```

---

## 🛡️ 4. Tính năng Privacy & Anti-Duplicate

1. **Privacy Mode**: Khi bật, chiến lược sẽ được băm (Hash) trước khi ghi đè Proof.
2. **Lỗi "Already Executed"**: Hệ thống tự động bỏ qua nếu một lệnh đã được thực thi và link thành công, tránh lãng phí Gas.

---

## 🔗 Liên kết quan trọng
- **0G Registry**: `0xA398A2f9f2f4D0d952fCe7216c6a08c142090a66`
- **StrategyVault**: `0x597fe5D330536ed0213a06Ef24dCA0eF45235996`
- **PrivacyVault**: `0xb5C043ab5e7a929885272CFEb3246D254460b293`
