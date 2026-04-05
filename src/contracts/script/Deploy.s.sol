// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "src/AgentRegistry.sol";
import "src/PrivacyVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("ZG_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));

        PrivacyVault privacyVault = new PrivacyVault();
        console.log("PrivacyVault deployed at:", address(privacyVault));

        vm.stopBroadcast();
    }
}
