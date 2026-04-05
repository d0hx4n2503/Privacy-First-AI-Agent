# 🛡️ 0G Network - $15,000 (AI Orchestration Track)

### Why are you applicable? 
GhostFi không chỉ tích hợp 0G mà còn xây dựng một lớp **"AI Attestation Rollup"** hoàn chỉnh. Chúng tôi giải quyết bài toán "Hộp đen AI" (AI Transparency) bằng cách sử dụng **iNFT (ERC-7857)** làm căn cước và **Agent Registry** làm sổ cái hành vi. Thay vì đẩy dữ liệu thô lên Chain (gây tốn kém và nghẽn mạng), chúng tôi áp dụng cơ chế **Decisional Epochs**: Toàn bộ nhật ký suy luận (Inference Logs) được lưu trữ trên **0G Storage**, trong khi chỉ có mã băm (State-root) được xác thực lên **0G Chain**. Điều này cung cấp khả năng kiểm toán (Auditability) 100% cho các dự án Sealed Inference mà vẫn giữ được tính bảo mật và hiệu suất cực cao.

### Link to the code 

*   **Registry Attestation Logic:** [src/AgentRegistry.sol:L78-L80](src/AgentRegistry.sol#L78-L80) — Hàm nộp bằng chứng hành động.
*   **State-root Binding:** [src/core/orchestrator.ts:L68-L72](src/core/orchestrator.ts#L68-L72) — Liên kết định danh iNFT với dấu vân tay của suy nghĩ AI.
*   **Encrypted Identity Factory:** [src/services/zero-g/mint.py:L122-L130](src/services/zero-g/mint.py#L122-L130) — Cơ chế mã hóa metadata chuẩn ERC-7857.
*   **Scalable RAG Memory:** [src/agent/agent.ts:L58-L63](src/agent/agent.ts#L58-L63) — Lưu trữ bối cảnh AI trên 0G Storage.

### Additional Feedback

1.  **Vấn đề: Sealed Inference Verification Gap.** Hiện nay 0G cung cấp **Sealed Inference (TEE)** đảm bảo quyền riêng tư, nhưng việc xác thực (Verify) các bản báo cáo Remote Attestation (RA) cho người dùng cuối vẫn cực kỳ phức tạp và thiếu giao diện Standard Registry để theo dõi lịch sử hành vi (Audit Trail).
2.  **Dẫn chứng:** Tài liệu **"0G Compute Architecture"** (docs.0g.ai) tập trung vào hạ tầng tính toán, nhưng việc liên kết giữa "Kết quả AI giải mã trong TEE" và "Bằng chứng On-chain" hiện đang để trống cho các Builder tự xử lý, dẫn đến sự thiếu đồng bộ trong việc minh bạch hóa AI. Hệ thống của chúng tôi giải quyết điều này bằng lớp Registry trung gian.

---

# 🦄 Uniswap Foundation - $10,000 (DeFi Strategy Track)

### Why are you applicable?

GhostFi giải quyết triệt để hai vấn đề lớn nhất của LPs hiện nay: **LVR (Loss-Versus-Rebalancing)** và **JIT (Just-In-Time) Liquidity**. Chúng tôi biến Uniswap V3 từ một AMM thụ động thành một **"Predictive Active LP"**. Agent AI của chúng tôi phân tích các Market Narratives và chênh lệch giá CEX/DEX theo thời gian thực để tái cân bằng (Rebalance) Tick Range **trước khi** biến động xảy ra. Thông qua **StrategyVault**, chúng thực thi các lệnh "Zapper" phức tạp, giúp người dùng thu phí (Fees) tối đa và giảm thiểu tổn thất tạm thời (IL) mà không cần can thiệp thủ công.

### Link to the code

*   **Dynamic V3 Management:** [src/services/uniswap/liquidity.ts:L109-L113](src/services/uniswap/liquidity.ts#L109-L113) — Thực thi nạp thanh khoản với Tick Range động.
*   **Zap Execution Pipeline:** [src/StrategyVault.sol:L66-L100](src/StrategyVault.sol#L66-L100) — Cơ chế Swap + Add LP trong 1 transaction để tránh trượt giá.
*   **AI Reasoning Analysis:** [src/agent/agent.ts:L45-L55](src/agent/agent.ts#L45-L55) — Logic phân tích tín hiệu thị trường để tìm Alpha.
*   **Auto-routing Logic:** [src/core/orchestrator.ts:L175-L181](src/core/orchestrator.ts#L175-L181) — Định tuyến giao dịch thông minh qua Uniswap API.

### Additional Feedback

1.  **Vấn đề: LVR (Loss-Versus-Rebalancing).** LPs trên Uniswap V3 đang bị các Bot Arbitrage "rút máu" do giá trong Pool luôn chậm hơn so với sàn tập trung (CEX).
2.  **Dẫn chứng:** Nghiên cứu **"LVR: Loss-Versus-Rebalancing"** (Milionis et al., 2022) chứng minh LPs thường xuyên thua lỗ so với chiến thuật tái cân bằng bên ngoài. GhostFi dùng AI để "Active Rebalance" nhằm giành lại phần lợi nhuận này.
3.  **Vấn đề: JIT Liquidity Dilution.** Các chiến thuật JIT (Just-In-Time) bơm thanh khoản chớp nhoáng đang làm loãng phí giao dịch của LPs dài hạn.
4.  **Dẫn chứng:** Nghiên cứu của **Delphi Digital (2023)** chỉ ra rằng trong các Pool lớn như WETH/USDC, Bot JIT chiếm tỷ lệ phí cực lớn, gây bất lợi cho LPs cá nhân. GhostFi giải quyết bằng cách AI dự đoán dòng tiền để định vị Range tối ưu hơn Bot.
