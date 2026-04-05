// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/contracts/StrategyVault.sol";
import "../src/contracts/PrivacyVault.sol";

contract SmartVaultsTest is Test {
    StrategyVault public strategyVault;
    PrivacyVault public privacyVault;

    // Sepolia Addresses
    address public constant V2_ROUTER = 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008;
    address public constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    address public owner = makeAddr("owner");
    address public operator = makeAddr("operator");
    address public stranger = makeAddr("stranger");

    function setUp() public {
        string memory rpcUrl = vm.envString("ETHEREUM_RPC_URL");
        vm.createSelectFork(rpcUrl);

        vm.startPrank(owner);
        strategyVault = new StrategyVault(V2_ROUTER);
        privacyVault = new PrivacyVault();
        
        // strategyVault.operator is msg.sender by default (owner here)
        // Let's set the operator in the vault
        // Wait, StrategyVault doesn't have a setOperator function, but it sets it in constructor
        vm.stopPrank();

        vm.deal(owner, 10 ether);
        vm.prank(owner);
        strategyVault.deposit{value: 10 ether}();
    }

    // --- StrategyVault Tests ---

    function testZapLiquidity() public {
        vm.startPrank(owner);
        
        uint256 initBalance = address(strategyVault).balance;
        uint256 amount = 0.01 ether;
        
        strategyVault.executeV2ZapLiquidity(owner, USDC, amount);
        
        // Final balance should be around initBalance - amount (could be slightly more if ETH returned)
        assertGe(address(strategyVault).balance, initBalance - amount);
        
        // Check if we have LP tokens or tokens received?
        // The vault doesn't track LP tokens but they are sent to the vault
        // We can check if usdc balance is GT 0 (usually some is left over or kept)
        // Actually, USDC might be fully used in addLiquidity.
        
        vm.stopPrank();
    }

    function testSwapOnly() public {
        vm.startPrank(owner);
        
        uint256 amount = 0.01 ether;
        strategyVault.executeV2Swap(owner, USDC, amount, 0);
        
        uint256 usdcBalance = IERC20(USDC).balanceOf(address(strategyVault));
        assertGt(usdcBalance, 0);
        
        vm.stopPrank();
    }

    function testNonOperatorExecuteRevert() public {
        vm.startPrank(stranger);
        uint256 amount = 0.01 ether;
        vm.expectRevert("Only operator");
        strategyVault.executeV2Swap(owner, USDC, amount, 0);
        vm.stopPrank();
    }

    function testWithdraw() public {
        vm.startPrank(owner);
        
        uint256 vaultBalance = address(strategyVault).balance;
        uint256 withdrawAmount = 1 ether;
        
        strategyVault.withdraw(address(0), withdrawAmount);
        
        assertEq(address(strategyVault).balance, vaultBalance - withdrawAmount);
        assertEq(owner.balance, withdrawAmount);
        
        vm.stopPrank();
    }

    // --- PrivacyVault Tests ---

    function testCommitAndReveal() public {
        vm.startPrank(operator);
        
        bytes32 commitmentHash = keccak256("private_strategy_data");
        string memory uri = "ipfs://0G-Storage-CID-123";
        
        // 1. Commit private
        privacyVault.commitStrategy(commitmentHash, uri, true);
        
        (address agent, bytes32 hash, string memory storedUri, bool isPrivate,,) = privacyVault.strategies(commitmentHash);
        assertEq(agent, operator);
        assertEq(hash, commitmentHash);
        assertEq(storedUri, ""); // Should be empty because isPrivate = true
        assertTrue(isPrivate);
        
        // 2. Reveal
        privacyVault.revealStrategy(commitmentHash, uri);
        (,, storedUri,,,) = privacyVault.strategies(commitmentHash);
        assertEq(storedUri, uri);
        
        vm.stopPrank();
    }

    function testLinkExecution() public {
        vm.startPrank(operator);
        
        bytes32 commitmentHash = keccak256("strategy_2");
        privacyVault.commitStrategy(commitmentHash, "uri", false);
        
        string memory txHash = "0xabcdef123456789";
        privacyVault.linkExecution(commitmentHash, txHash);
        
        (,,,,, string memory executedTx) = privacyVault.strategies(commitmentHash);
        assertEq(executedTx, txHash);
        
        vm.stopPrank();
    }
}
