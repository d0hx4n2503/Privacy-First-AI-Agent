#!/bin/bash
# ── Dọn dẹp và nạp chuẩn Foundry ──
sed -i 's/\r$//' .env
source .env
export PATH="$HOME/.foundry/bin:$PATH"

echo "🚀 Đang triển khai AgentRegistry (Legacy Mode + 2 Gwei) lên 0G Galileo..."
# Use legacy gas for 0G Galileo stability
forge script script/Deploy.s.sol --rpc-url $ZG_RPC_URL --broadcast --private-key $ZG_PRIVATE_KEY --legacy --gas-price 2000000000
