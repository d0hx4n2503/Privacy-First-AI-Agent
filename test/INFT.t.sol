// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/INFT.sol";

/**
 * @title MockOracle
 * @dev Một Oracle giả lập để test mechanism verifyProof của ERC-7857.
 */
contract MockOracle is IOracle {
    function verifyProof(bytes calldata proof) external view override returns (bool) {
        // Đơn giản: Nếu proof không rỗng thì coi là hợp lệ
        return proof.length > 0;
    }
}

contract INFTTest is Test {
    INFT public inft;
    MockOracle public oracle;
    address public owner = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);

    function setUp() public {
        vm.startPrank(owner);
        oracle = new MockOracle();
        inft = new INFT(address(oracle));
        vm.stopPrank();
    }

    function testMint() public {
        string memory uri = "ipfs://test-agent-metadata";
        bytes32 mHash = keccak256("initial_secret");
        
        vm.prank(owner);
        uint256 tokenId = inft.mint(user1, uri, mHash);

        assertEq(inft.ownerOf(tokenId), user1);
        assertEq(inft.getEncryptedUri(tokenId), uri);
        assertEq(inft.getMetadataHash(tokenId), mHash);
    }

    function testTransferWithProof() public {
        uint256 tokenId = inft.mint(user1, "uri", keccak256("h1"));
        
        bytes memory sealedKeyForUser2 = "newSealedKeyForUser2";
        bytes memory proof = "TEE_ATTESTATION_PROOF";

        vm.prank(user1);
        inft.transfer(user1, user2, tokenId, sealedKeyForUser2, proof);

        assertEq(inft.ownerOf(tokenId), user2);
        // Sau khi transfer, hash metadata phải là hash của sealedKey mới
        assertEq(inft.getMetadataHash(tokenId), keccak256(sealedKeyForUser2));
    }

    function testTransferWithInvalidProof() public {
        uint256 tokenId = inft.mint(user1, "uri", keccak256("h1"));
        
        bytes memory sealedKeyForUser2 = "newSealedKeyForUser2";
        bytes memory emptyProof = ""; // Oracle will reject because length == 0

        vm.startPrank(user1);
        vm.expectRevert("ERC7857: Invalid proof");
        inft.transfer(user1, user2, tokenId, sealedKeyForUser2, emptyProof);
        vm.stopPrank();
    }

    function testClone() public {
        uint256 tokenId = inft.mint(user1, "uri", keccak256("h1"));
        
        bytes memory sealedKey = "clonedSecret";
        bytes memory proof = "valid_proof";

        vm.prank(user1);
        uint256 newTokenId = inft.clone(user2, tokenId, sealedKey, proof);

        assertEq(inft.ownerOf(newTokenId), user2);
        assertEq(inft.getMetadataHash(newTokenId), keccak256(sealedKey));
        assertEq(inft.getEncryptedUri(newTokenId), "uri"); // Clone giữ nguyên data
    }

    function testAuthorizeUsage() public {
        uint256 tokenId = inft.mint(user1, "uri", keccak256("h1"));
        bytes memory permissions = "execute:private-inference";

        vm.prank(user1);
        inft.authorizeUsage(tokenId, user2, permissions);
        
        // Kiểm tra owner vẫn là user1
        assertEq(inft.ownerOf(tokenId), user1);
    }
}
