// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IERC7857
 * @notice Interface for Intelligent NFTs (iNFTs) supporting encrypted metadata and secure transfers.
 */
interface IERC7857 {
    function transfer(address from, address to, uint256 tokenId, bytes calldata sealedKey, bytes calldata proof) external;
    function clone(address to, uint256 tokenId, bytes calldata sealedKey, bytes calldata proof) external returns (uint256 newTokenId);
    function authorizeUsage(uint256 tokenId, address executor, bytes calldata permissions) external;
}

interface IOracle {
    function verifyProof(bytes calldata proof) external view returns (bool);
}

/**
 * @title INFT (Intelligent NFT - ERC-7857 Implementation)
 * @notice Represents an AI Agent's identity and encrypted capability metadata.
 *         Compliant with 0G Labs technical specifications.
 */
contract INFT is ERC721URIStorage, IERC7857, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;

    // ERC-7857 State Variables
    mapping(uint256 => bytes32) private _metadataHashes;
    mapping(uint256 => string) private _encryptedURIs;
    mapping(uint256 => mapping(address => bytes)) private _authorizations;
    
    address public oracle;

    // Events
    event MetadataUpdated(uint256 indexed tokenId, bytes32 newHash);
    event UsageAuthorized(uint256 indexed tokenId, address indexed executor, bytes permissions);
    event OracleUpdated(address oldOracle, address newOracle);

    constructor(address initialOracle) ERC721("Groq Alpha AI Agent", "GAAI") Ownable(msg.sender) {
        oracle = initialOracle;
    }

    modifier validProof(bytes calldata proof) {
        if (oracle != address(0)) {
            require(IOracle(oracle).verifyProof(proof), "ERC7857: Invalid proof");
        }
        _;
    }

    /**
     * @notice Mints an iNFT with foundational encrypted metadata.
     */
    function mint(
        address to, 
        string calldata encryptedUri,
        bytes32 metadataHash
    ) external returns (uint256) {
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, encryptedUri); // Set standard ERC721 URI for Explorers
        _encryptedURIs[tokenId] = encryptedUri;
        _metadataHashes[tokenId] = metadataHash;

        emit MetadataUpdated(tokenId, metadataHash);
        return tokenId;
    }

    /**
     * @notice ERC-7857: Transfer with metadata re-encryption verifying via Oracle.
     */
    function transfer(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external override nonReentrant validProof(proof) {
        require(ownerOf(tokenId) == from, "ERC7857: Not owner");
        require(to != address(0), "ERC7857: Invalid recipient");

        _metadataHashes[tokenId] = keccak256(sealedKey);
        _transfer(from, to, tokenId);

        emit MetadataUpdated(tokenId, _metadataHashes[tokenId]);
    }

    /**
     * @notice ERC-7857: Clone token with same encrypted metadata.
     */
    function clone(
        address to,
        uint256 tokenId,
        bytes calldata sealedKey,
        bytes calldata proof
    ) external override nonReentrant validProof(proof) returns (uint256) {
        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        _safeMint(to, newTokenId);
        _encryptedURIs[newTokenId] = _encryptedURIs[tokenId];
        _metadataHashes[newTokenId] = keccak256(sealedKey);

        emit MetadataUpdated(newTokenId, _metadataHashes[newTokenId]);
        return newTokenId;
    }

    /**
     * @notice ERC-7857: Authorize specific usage without revealing private keys.
     */
    function authorizeUsage(
        uint256 tokenId,
        address executor,
        bytes calldata permissions
    ) external override {
        require(ownerOf(tokenId) == msg.sender, "ERC7857: Not owner");
        _authorizations[tokenId][executor] = permissions;
        emit UsageAuthorized(tokenId, executor, permissions);
    }

    // Getters for decentralized applications
    function getMetadataHash(uint256 tokenId) external view returns (bytes32) {
        return _metadataHashes[tokenId];
    }

    function getEncryptedUri(uint256 tokenId) external view returns (string memory) {
        return _encryptedURIs[tokenId];
    }

    function setOracle(address newOracle) external onlyOwner {
        emit OracleUpdated(oracle, newOracle);
        oracle = newOracle;
    }
}
