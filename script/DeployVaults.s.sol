// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "src/StrategyVault.sol";
import "src/PrivacyVault.sol";
import "src/AgentRegistry.sol";
import "src/INFT.sol";

contract DeployVaults is Script {
    function run() external {
        uint256 pk = vm.envUint("ADMIN_PRIVATE_KEY");
        vm.startBroadcast(pk);
        
        StrategyVault strategyVault = new StrategyVault(0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008);
        console.log("Deployed StrategyVault to:", address(strategyVault));
        
        vm.stopBroadcast();
    }
    
    function runPrivacy() external {
        uint256 pk = vm.envUint("ADMIN_PRIVATE_KEY");
        vm.startBroadcast(pk);
        
        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("Deployed AgentRegistry to:", address(agentRegistry));

        // Use the deployer as initial oracle for testing
        INFT inft = new INFT(vm.addr(pk));
        console.log("Deployed INFT to:", address(inft));

        PrivacyVault privacyVault = new PrivacyVault();
        console.log("Deployed PrivacyVault to:", address(privacyVault));
        
        vm.stopBroadcast();
    }

}
