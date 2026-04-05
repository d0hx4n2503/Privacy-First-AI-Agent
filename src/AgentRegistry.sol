// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Registers AI Agents with their on-chain iNFT identities for verifiable attestation.
 *         Deployed on 0G Chain.
 */
interface IINFT {
    function mint(address to, string calldata encryptedUri, bytes32 metadataHash) external returns (uint256);
}

contract AgentRegistry {
    struct AgentInfo {
        address owner;
        uint256 inftTokenId;      // ERC-7857 iNFT token ID on 0G Chain
        string metadata;          // Storage URI (may be encrypted as per ERC-7857)
        bool privacyEnabled;      // Whether agent runs in privacy mode by default
        uint256 registeredAt;
    }

    mapping(uint256 => AgentInfo) public agents;
    uint256[] public registeredTokens;
    address public owner;

    event AgentRegistered(uint256 indexed tokenId, address indexed owner, bool privacyEnabled);
    event PrivacyToggled(uint256 indexed tokenId, bool privacyEnabled);
    event ActionLogged(uint256 indexed tokenId, address indexed owner, string actionType, string dataHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgentOwner(uint256 tokenId) {
        require(agents[tokenId].registeredAt != 0, "Agent not registered");
        require(agents[tokenId].owner == msg.sender, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Mint an iNFT and register the agent simultaneously (Factory Model).
     * @param inftContract Address of the deployed INFT contract
     * @param encryptedUri URI for the NFT
     * @param metadataHash Hash for 7857 validation
     * @param privacyEnabled Initial privacy setting
     */
    function mintAndRegister(
        address inftContract,
        string calldata encryptedUri,
        bytes32 metadataHash,
        bool privacyEnabled
    ) external {
        uint256 tokenId = IINFT(inftContract).mint(msg.sender, encryptedUri, metadataHash);

        require(agents[tokenId].registeredAt == 0, "Already registered");

        agents[tokenId] = AgentInfo({
            owner: msg.sender,
            inftTokenId: tokenId,
            metadata: encryptedUri,
            privacyEnabled: privacyEnabled,
            registeredAt: block.timestamp
        });

        registeredTokens.push(tokenId);

        emit AgentRegistered(tokenId, msg.sender, privacyEnabled);
    }

    /**
     * @notice Log atomic actions from the AI brain to the 0G Chain.
     */
    function logAction(uint256 tokenId, string calldata actionType, string calldata dataHash) external onlyAgentOwner(tokenId) {
        emit ActionLogged(tokenId, msg.sender, actionType, dataHash);
    }

    function togglePrivacy(uint256 tokenId, bool enabled) external onlyAgentOwner(tokenId) {
        agents[tokenId].privacyEnabled = enabled;
        emit PrivacyToggled(tokenId, enabled);
    }

    function getAgent(uint256 tokenId) external view returns (AgentInfo memory) {
        return agents[tokenId];
    }
}
