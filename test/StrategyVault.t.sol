// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/StrategyVault.sol";

contract StrategyVaultTest is Test {
    StrategyVault public vault;
    address public constant V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    address public constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    function setUp() public {
        // Fork Sepolia
        string memory rpcUrl = vm.envString("ETHEREUM_RPC_URL");
        vm.createSelectFork(rpcUrl);

        console.log("Current Chain ID:", block.chainid);
        console.log("Router address:", V2_ROUTER);
        console.log("Router code size:", V2_ROUTER.code.length);

        vault = new StrategyVault(V2_ROUTER);
        
        // Give some ETH to the vault for testing if needed
        vm.deal(address(vault), 1 ether);
    }

    function testZapLiquidity() public {
        uint256 amount = 0.001 ether;
        
        // Ensure vault has ETH
        assertGe(address(vault).balance, amount);

        // Try to execute zap liquidity
        console.log("Executing Zap Liquidity with", amount, "ETH");
        vault.executeV2ZapLiquidity(USDC, amount);
        
        console.log("Zap Liquidity successful!");
    }

    function testSwap() public {
        uint256 amount = 0.001 ether;
        
        console.log("Executing Swap with", amount, "ETH");
        vault.executeV2Swap(USDC, amount, 0);
        
        uint256 usdcBalance = IERC20(USDC).balanceOf(address(vault));
        console.log("USDC Balance after swap:", usdcBalance);
        assertGt(usdcBalance, 0);
    }
}
