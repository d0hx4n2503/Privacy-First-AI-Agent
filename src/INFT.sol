// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INFT (Minimal ERC-7857 mock for Hackathon)
 * @dev Represents an AI Agent's identity, ownership, and capability metadata.
 */
contract INFT {
    uint256 private _nextTokenId;
    mapping(uint256 => address) private _owners;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function mint(address to, string calldata metadataUri) external returns (uint256) {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;
        _owners[tokenId] = to;
        _tokenURIs[tokenId] = metadataUri;

        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "INFT: Nonexistent token");
        return owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "INFT: Nonexistent token");
        return _tokenURIs[tokenId];
    }
}
