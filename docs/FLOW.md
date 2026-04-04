# 🌊 Hệ thống Agent Privacy-First: Luồng vận hành (Operational Flow)

Tài liệu này giải thích cách hệ thống kết hợp **0G Network**, **Chainlink CRE** và **Uniswap** để tạo ra một Agent AI có danh tính trên chuỗi, có khả năng phân tích và thực thi lệnh một cách an toàn.

---

## 🛠️ 1. Giai đoạn Triển khai (Infrastructure Deployment)
Trước khi sử dụng, hạ tầng 0G phải được triển khai để tạo ra các "điểm chạm" On-chain.

- **AgentRegistry**: Danh bạ chính chủ để định danh Agent.
- **INFT (ERC-7857)**: Smart Contract tạo ra "hộ chiếu" cho Agent.
- **PrivacyVault**: Nơi lưu trữ các liên kết bảo mật (Privacy Links) giữa Phân tích AI và Giao dịch thực tế.
- **StrategyVault (Sepolia)**: Hợp đồng thực thi (Executor) giúp Agent Zapper vào các Pool thanh khoản.

**KEY liên quan:** `ADMIN_PRIVATE_KEY` (Dùng để Deploy hạ tầng).

---

## 👤 2. Giai đoạn Định danh (Identity Phase)
User khởi tạo Agent bằng cách đúc một **iNFT**.

1. **Minting**: User dùng `USER_PRIVATE_KEY` để đúc iNFT qua contract `INFT`.
2. **Registration**: iNFT này được tự động đăng ký vào `AgentRegistry`, liên kết địa chỉ ví User với ID Token.
3. **Identity Verification**: Từ đây, mọi hành động của User đều được ký dưới danh nghĩa của iNFT ID này.

---

## 🧠 3. Giai đoạn Vận hành AI (The Execution Loop)
Đây là quy trình diễn ra mỗi khi bạn chạy lệnh `analyze`.

### Bước A: Phân tích (Sealed Inference)
- Agent quét danh sách Pool (`pools.json`).
- Gửi dữ liệu tới **0G Compute (Sealed Inference - TEE)**. AI sẽ trả về chiến thuật tối ưu (Swap/Liquidity) kèm theo **Metadata Proof**.
- Kết quả được ghi lại vào **0G Storage** (Mã hóa và lưu trữ phi tập trung).

### Bước B: Xác thực Workflow (Chainlink CRE)
- Chiến thuật được gửi qua **Chainlink CRE Workflow**.
- **Ký xác thực**: Agent sử dụng `CRE_SIGNING_KEY` để ký vào thông điệp strategy, đảm bảo tính toàn vẹn của dữ liệu phân tích khi gửi tới mạng lưới Oracle.
- **Kiểm tra**: Hệ thống kiểm tra: Oracle giá (Price Feed), Chính sách an toàn (Policy), và Tuyến đường (Routing). 
- Nếu Privacy được bật, CRE sẽ xác nhận tuyến đường "Sealed Route".

### Bước C: Thực thi Privacy-Ready (Sepolia)
- Agent gửi lệnh tới **StrategyVault** trên Sepolia.
- Vault thực hiện ZAP (Ví dụ: Swap ETH -> Token và Add Liquidity vào Uniswap) trong **01 giao dịch duy nhất**.
- Trả về Transaction Hash thành công.

### Bước D: Liên kết Bảo mật (Privacy Linking)
- Đây là bước quan trọng nhất: Một liên kết mật (Commitment) chứa `Hash(Strategy)` và `TX_Hash(Uniswap)` được gửi vào **PrivacyVault** trên 0G Chain.
- **Kết quả**: Bạn có bằng chứng là Agent đã làm, nhưng nội dung chi tiết chiến thuật được bảo vệ.

---

## 🛡️ 4. Giai đoạn Kiểm chứng (Verification)
Sử dụng công cụ `verify-onchain.ts` để đọc các **Events** từ `AgentRegistry`:
- Agent ID #1 đã làm gì? (Hành động: `PROVIDE_LIQUIDITY_STRATEGY`)
- Bằng chứng lưu trữ ở đâu? (Proof Hash: `0x...`)
- Giao dịch thực tế ở đâu? (Sepolia TX)

---

## 🔐 Phân nhiệm Key (Role Separation)

Hệ thống Orion được thiết kế theo mô hình **Delegated Execution** (Uỷ quyền thực thi) để tối ưu bảo mật và trải nghiệm:

1. **User (`USER_PRIVATE_KEY`)**: 
   - Là chủ sở hữu tài sản và iNFT.
   - Thực hiện: Nạp tiền vào Vault (`deposit-vault`), Ký bằng chứng định danh trên **0G Network**.
   - **Mục đích**: Đảm bảo quyền sở hữu tuyệt đối và sự riêng tư (Sovereignty).

2. **Admin/Agent (`ADMIN_PRIVATE_KEY`)**:
   - Đóng vai trò là **Operator** (Người vận hành) được uỷ quyền trong `StrategyVault`.
   - Thực hiện: Kích hoạt Zapper trên **Sepolia**, Chi trả Gas cho các giao dịch thực thi.
   - **Mục đích**: Giúp User không cần phải online 24/7 để "bóp cò" các lệnh DeFi phức tạp.

---

## 🔑 Quản lý Key & Biến môi trường

| Nhóm biến | Biến | Tác dụng |
| :--- | :--- | :--- |
| **Identity** | `USER_PRIVATE_KEY` | Key chính của User/Agent. Dùng để Mint iNFT và Ký lệnh. |
| **Infra** | `ADMIN_PRIVATE_KEY` | Key của người vận hành hệ thống hạ tầng 0G ban đầu. |
| **CRE Signer**| `CRE_SIGNING_KEY` | Key ký xác thực chiến thuật khi gửi tới Chainlink CRE. Đảm bảo workflow chỉ chấp nhận lệnh từ Agent chính chủ. |
| **AI Brain** | `GROQ_API_KEY` | LLM API fallback nếu 0G Compute bận. |
| **Network** | `ZG_RPC_URL` | Endpoint kết nối 0G Newton Testnet. |
| **Sepolia** | `ETHEREUM_RPC_URL` | Endpoint kết nối Sepolia (Hành lang thanh khoản Uni v3). |


### Luồng chạy chính:
- Nạp tiền (Deposit): Do User thực hiện (Chủ sở hữu vốn).
- Phân tích (AI Analysis): Ghi nhận bằng chứng lên 0G dưới tên User (Chủ sở hữu trí tuệ/iNFT).
- Thực thi (Zapper): Do Admin thực hiện (Với tư cách là Operator của Vault - Để User không cần sign).
- Liên kết bảo mật (Privacy Link): Do User thực hiện (Để xác thực quyền sở hữu độc quyền với chiến thuật đó).