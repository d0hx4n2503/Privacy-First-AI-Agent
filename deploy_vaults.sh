#!/bin/bash
# ── Dọn dẹp môi trường ──
sed -i 's/\r$//' .env
source .env
FORGE_BIN="/home/bitlab-pc/.foundry/bin/forge"

echo "🚀 Bắt đầu Triển khai TOÀN BỘ (Sử dụng Forge Script + Broadcast)..."

# 1. Deploy StrategyVault lên Sepolia
echo "🏦 [Sepolia] Triển khai StrategyVault via Script..."
STRATEGY_RES=$($FORGE_BIN script script/DeployVaults.s.sol --rpc-url "$ETHEREUM_RPC_URL" --broadcast --legacy)
STRATEGY_ADDR=$(echo "$STRATEGY_RES" | grep "Deployed StrategyVault to:" | awk '{print $4}')

# 2. Deploy PrivacyVault lên 0G Newton
echo "🔐 [0G Newton] Triển khai PrivacyVault via Script..."
PRIVACY_RES=$($FORGE_BIN script script/DeployVaults.s.sol --sig "runPrivacy()" --rpc-url "$ZG_RPC_URL" --broadcast --legacy --gas-price 2000000000)
PRIVACY_ADDR=$(echo "$PRIVACY_RES" | grep "Deployed PrivacyVault to:" | awk '{print $4}')

# 3. Cập nhật .env tự động
echo "📝 Cập nhật địa chỉ thực tế vào .env..."
if [ ! -z "$STRATEGY_ADDR" ]; then
    sed -i "/STRATEGY_VAULT_ADDRESS/d" .env
    echo "STRATEGY_VAULT_ADDRESS=$STRATEGY_ADDR" >> .env
    echo "✅ Success: StrategyVault @ $STRATEGY_ADDR"
fi

if [ ! -z "$PRIVACY_ADDR" ]; then
    sed -i "/PRIVACY_VAULT_ADDRESS/d" .env
    echo "PRIVACY_VAULT_ADDRESS=$PRIVACY_ADDR" >> .env
    echo "✅ Success: PrivacyVault @ $PRIVACY_ADDR"
fi

echo "🎉 Triển khai hoàn tất! AGENT đã sẵn sàng tiếp quản 0.5 ETH của bạn trên On-Chain."
