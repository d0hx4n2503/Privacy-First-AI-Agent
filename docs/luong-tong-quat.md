**Báo Cáo Luồng Tổng Quát**
Dự án: Privacy-first AI Agent for DeFi
Ngày cập nhật: 2026-03-27

**Tóm Tắt**
Dự án xây dựng một tác nhân AI tự động cho DeFi với trọng tâm là quyền riêng tư. Hệ thống lắng nghe sự kiện thanh khoản đa chuỗi, hợp nhất tín hiệu thành một “câu chuyện thị trường”, chạy suy luận trong môi trường bảo mật (TEE) của 0G Compute, cho phép người dùng chọn chế độ riêng tư, sau đó điều phối thực thi qua Chainlink CRE và thực hiện giao dịch qua Uniswap. Luồng này vừa đáp ứng mục tiêu kỹ thuật, vừa tạo ra tính minh bạch có kiểm soát cho người dùng và đối tác kinh doanh.

**Ai Nên Đọc Phần Nào**
- Business: Tóm Tắt, Mục Tiêu & Giá Trị, Luồng End-to-End, Quyền Riêng Tư, Hạn Chế, Hướng Phát Triển.
- Non-dev: Tóm Tắt, Kiến Trúc Tổng Quan, Luồng End-to-End, Chế Độ Vận Hành.
- Dev: Toàn bộ tài liệu, đặc biệt Thành Phần Chính, Hợp Đồng, Cấu Hình, Hạn Chế.

**Mục Tiêu & Giá Trị**
- Tự động hoá phát hiện và thực thi cơ hội giao dịch DeFi dựa trên dữ liệu on-chain.
- Cung cấp cơ chế lựa chọn quyền riêng tư theo từng giao dịch (Private/Public).
- Tích hợp các hạ tầng đối tác: 0G (Compute + Storage), Chainlink CRE, Uniswap API, Naryo.
- Tạo nền tảng để thương mại hoá agent thông qua iNFT và registry on-chain.

**Kiến Trúc Tổng Quan**
Luồng điều phối tập trung tại `Orchestrator` và được kích hoạt qua CLI. Các khối chức năng chính:
- Naryo Listener: thu thập sự kiện swap từ Unichain (polling JSON-RPC).
- Event Correlator: gom sự kiện theo cặp token trong cửa sổ thời gian và sinh “story”.
- OpenClaw Agent: truy xuất ngữ cảnh RAG từ 0G Storage và gọi 0G Compute (TEE) để suy luận chiến lược.
- Privacy Manager: hỏi người dùng hoặc tự chọn chế độ Private/Public.
- Chainlink CRE Workflow: chuẩn hoá luồng kiểm tra, giá tham chiếu, tuyến riêng tư, kích hoạt Uniswap.
- Uniswap Router + Exec: lấy báo giá tối ưu và thực hiện giao dịch.
- 0G Storage: lưu lịch sử quyết định, phục vụ RAG.

**Sơ Đồ Tổng Quan (Mermaid)**
```mermaid
flowchart TD
  CLI[CLI / User Input] --> ORC[Orchestrator]
  ORC --> NARYO[Naryo Listener]
  NARYO --> CORR[Event Correlator]
  CORR --> AGENT[OpenClaw Agent]
  AGENT --> RAG[0G Storage (RAG Memory)]
  AGENT --> TEE[0G Compute (Sealed Inference)]
  AGENT --> PRIV[Privacy Manager]
  PRIV --> CRE[Chainlink CRE Workflow]
  CRE --> ROUTE[Uniswap Router (Quote)]
  ROUTE --> EXEC[Uniswap Exec (Swap)]
  EXEC --> CHAIN[On-chain Tx (Sepolia/Unichain)]

  REG[AgentRegistry.sol] -. planned .-> ORC
  VAULT[PrivacyVault.sol] -. planned .-> CRE
```

**Luồng End-to-End**
1. Lắng nghe sự kiện: `NaryoListener` poll Unichain Sepolia, đọc `eth_getLogs` để bắt sự kiện swap.
2. Tương quan sự kiện: `EventCorrelator` gom các event theo cặp token trong 30 giây, nếu đủ ngưỡng thì sinh “story”.
3. Suy luận chiến lược: `PrivacyDeFiAgent` lấy ngữ cảnh RAG từ 0G Storage (hoặc cache), gọi 0G Compute để trả về strategy.
4. Nhánh HOLD: nếu strategy là `hold`, hệ thống dừng và quay lại chế độ lắng nghe.
5. Chọn quyền riêng tư: `PrivacyManager` hỏi người dùng hoặc tự chọn theo khuyến nghị của AI.
6. Điều phối CRE: `CREOrchestratorWorkflow` chạy chuỗi bước validate, price feed, privacy route, trigger Uniswap.
7. Định tuyến Uniswap: `UniswapRouter` gọi Uniswap Routing API hoặc ước lượng nội bộ nếu thiếu API key.
8. Thực thi giao dịch: `UniswapExec` gửi giao dịch on-chain (hoặc mock trong DRY_RUN) và trả về txHash.
9. Lưu vết & log: kết quả hiển thị trên CLI; bộ nhớ RAG được lưu ở 0G Storage hoặc cache nội bộ.

**Quyền Riêng Tư (Privacy Toggle)**
- Private: suy luận được thực thi trong TEE, không ghi audit log công khai; dữ liệu on-chain lý tưởng sẽ là hash cam kết.
- Public: cho phép lưu thông tin chiến lược đầy đủ lên 0G Storage để minh bạch hoá.
- Hiện tại, cơ chế chọn chế độ đã có trong code điều phối; phần commit/link với `PrivacyVault` mới ở mức hợp đồng và chưa được gọi trong pipeline.

**Chế Độ Vận Hành**
Các lệnh CLI chính:
- `npm run demo`: DRY_RUN + SIMULATE + MOCK_USER_INPUT, chạy toàn bộ luồng với dữ liệu giả lập.
- `npm run start`: chạy live, lắng nghe sự kiện thật và thực thi on-chain nếu cấu hình đủ key.
- `npm run trigger-test [tokenIn] [tokenOut]`: bơm sự kiện test vào pipeline để kiểm tra end-to-end.
- `npm run mint-inft`: mint agent thành iNFT trên 0G Chain.

**Thành Phần Chính**
| Thành phần | Vai trò | Mã nguồn chính |
| --- | --- | --- |
| Orchestrator | Điều phối luồng end-to-end | `src/orchestrator.ts` |
| CLI | Điểm vào vận hành hệ thống | `src/cli.ts` |
| Naryo Listener | Poll sự kiện swap đa chuỗi | `src/naryo/listener.ts` |
| Event Correlator | Hợp nhất sự kiện thành story | `src/naryo/correlator.ts` |
| OpenClaw Agent | Điều phối RAG + suy luận 0G | `src/agent/openclaw.ts` |
| 0G Inference | Sealed inference (TEE) + fallback | `src/agent/inference.ts` |
| 0G RAG Memory | Lưu & truy xuất ký ức agent | `src/agent/rag.ts` |
| Privacy Manager | Quyết định Private/Public | `src/privacy.ts` |
| CRE Workflow | Bước điều phối Chainlink | `src/chainlink/workflow.ts` |
| Uniswap Router | Quote & routing | `src/uniswap/router.ts` |
| Uniswap Exec | Thực thi giao dịch | `src/uniswap/swap.ts` |
| iNFT Minter | Mint agent iNFT | `src/agent/inft.ts` |

**Hợp Đồng & On-chain**
- `AgentRegistry.sol`: đăng ký agent với metadata và trạng thái privacy.
- `PrivacyVault.sol`: lưu hash chiến lược (private) hoặc URI chiến lược (public).
- `INFT.sol`: mock ERC-7857 iNFT phục vụ hackathon.

**Dữ Liệu & Lưu Trữ**
- Dữ liệu event và story chỉ tồn tại trong bộ nhớ runtime cho tới khi suy luận xong.
- Kết quả suy luận được ghi vào RAG memory; ở DRY_RUN chỉ lưu local, ở live sẽ upload lên 0G Storage.
- Quyết định privacy được dùng để route luồng; phần ghi commit lên `PrivacyVault` là bước cần hoàn thiện.

**Cấu Hình Môi Trường (Tối Thiểu)**
- 0G: `ZG_PRIVATE_KEY`, `ZG_RPC_URL`, `ZG_COMPUTE_URL`.
- Uniswap: `UNISWAP_API_KEY`, `UNISWAP_API_BASE_URL`, `TRADER_PRIVATE_KEY`.
- Chainlink: `CRE_DON_URL`, `CRE_WORKFLOW_ID`, `CRE_SIGNING_KEY`.
- RPC: `UNICHAIN_RPC_URL`, `ETHEREUM_RPC_URL`.
- Flags: `DRY_RUN`, `SIMULATE`, `MOCK_USER_INPUT`.

**Hạn Chế Hiện Tại**
- Naryo hiện dùng polling JSON-RPC, chưa tích hợp SDK/event bus chính thức.
- Chainlink CRE đang mô phỏng trong code, chưa deploy workflow lên DON thực.
- PrivacyVault và AgentRegistry chưa được gọi trong luồng điều phối.
- Uniswap Exec hiện gửi transfer trực tiếp tới Universal Router, chưa gọi swap calldata chuẩn.
- Memory RAG truy vấn qua cache nội bộ để đảm bảo tốc độ, chưa có indexer chuyên dụng.

**Hướng Phát Triển Đề Xuất**
1. Tích hợp gọi `PrivacyVault` commit/link vào pipeline sau bước lựa chọn privacy và sau khi có txHash.
2. Chuẩn hoá swap execution với Universal Router calldata hoặc Uniswap SDK để đảm bảo swap thực.
3. Triển khai CRE workflow thật và kết nối trigger từ Naryo qua webhook hoặc message bus.
4. Bổ sung registry flow cho agent (đăng ký iNFT và metadata qua `AgentRegistry`).
5. Mở rộng bộ chỉ số đánh giá (PnL, win rate, latency) và xuất báo cáo cho business.
