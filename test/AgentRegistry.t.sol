// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgentRegistry.sol";
import "../src/INFT.sol";

contract AgentRegistryTest is Test {
    AgentRegistry public registry;
    INFT public inft;

    address public user = makeAddr("user");
    address public stranger = makeAddr("stranger");

    event AgentRegistered(uint256 indexed tokenId, address indexed owner, bool privacyEnabled);
    event ActionLogged(uint256 indexed tokenId, address indexed owner, string actionType, string dataHash);

    function setUp() public {
        registry = new AgentRegistry();
        // Since oracle is address(0), validProof modifier in INFT will be skipped
        inft = new INFT(address(0));
    }

    function testMintAndRegister() public {
        vm.startPrank(user);

        string memory uri = "ipfs://test_uri";
        bytes32 metaHash = keccak256("test_hash");
        
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, user, true);

        registry.mintAndRegister(address(inft), uri, metaHash, true);

        // Verify state
        AgentRegistry.AgentInfo memory info = registry.getAgent(1);
        assertEq(info.owner, user);
        assertEq(info.inftTokenId, 1);
        assertEq(info.metadata, uri);
        assertTrue(info.privacyEnabled);
        assertGt(info.registeredAt, 0);

        uint256 tokenOwned = registry.registeredTokens(0);
        assertEq(tokenOwned, 1);

        // INFT Ownership
        assertEq(inft.ownerOf(1), user);
        
        vm.stopPrank();
    }

    function testMultipleMintAndRegister() public {
        vm.startPrank(user);

        string memory uri1 = "ipfs://test_uri_1";
        bytes32 metaHash1 = keccak256("test_hash_1");
        registry.mintAndRegister(address(inft), uri1, metaHash1, true);

        string memory uri2 = "ipfs://test_uri_2";
        bytes32 metaHash2 = keccak256("test_hash_2");
        registry.mintAndRegister(address(inft), uri2, metaHash2, false);

        // User should own both
        assertEq(inft.ownerOf(1), user);
        assertEq(inft.ownerOf(2), user);

        // Registry should have both
        AgentRegistry.AgentInfo memory info1 = registry.getAgent(1);
        AgentRegistry.AgentInfo memory info2 = registry.getAgent(2);

        assertEq(info1.inftTokenId, 1);
        assertEq(info2.inftTokenId, 2);
        assertTrue(info1.privacyEnabled);
        assertFalse(info2.privacyEnabled);

        vm.stopPrank();
    }

    function testLogAction() public {
        vm.startPrank(user);
        registry.mintAndRegister(address(inft), "uri", keccak256("hash"), true);
        
        vm.expectEmit(true, true, false, true);
        emit ActionLogged(1, user, "SWAP", "hash_data");
        registry.logAction(1, "SWAP", "hash_data");
        vm.stopPrank();
    }

    function testLogActionRevertsIfNotOwner() public {
        vm.startPrank(user);
        registry.mintAndRegister(address(inft), "uri", keccak256("hash"), true);
        vm.stopPrank();

        vm.startPrank(stranger);
        vm.expectRevert("Not owner");
        registry.logAction(1, "SWAP", "hash_data");
        vm.stopPrank();
    }
    
    function testLogActionRevertsIfNotRegistered() public {
        vm.startPrank(user);
        vm.expectRevert("Agent not registered");
        registry.logAction(999, "SWAP", "hash_data");
        vm.stopPrank();
    }
}
