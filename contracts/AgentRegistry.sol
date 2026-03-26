// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Registers AI Agents with their HCS-14 Universal Agent IDs on-chain.
 *         Deployed on Hedera Testnet (EVM) and 0G Chain.
 */
contract AgentRegistry {
    struct AgentInfo {
        address owner;
        string hcs14TopicId;      // Hedera HCS-14 topic ID (e.g. "0.0.12345")
        string inftTokenId;       // ERC-7857 iNFT token ID on 0G Chain
        string metadata;          // IPFS / 0G Storage URI with agent description
        bool privacyEnabled;      // Whether agent runs in privacy mode by default
        uint256 registeredAt;
    }

    mapping(address => AgentInfo) public agents;
    mapping(string => address) public agentByHcs14;

    address[] public agentList;
    address public owner;

    event AgentRegistered(
        address indexed agentAddress,
        string hcs14TopicId,
        string inftTokenId,
        bool privacyEnabled
    );

    event PrivacyToggled(address indexed agentAddress, bool privacyEnabled);
    event AgentMetadataUpdated(address indexed agentAddress, string metadata);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier agentExists(address agentAddr) {
        require(agents[agentAddr].registeredAt != 0, "Agent not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a new AI agent with its HCS-14 ID and iNFT token.
     */
    function registerAgent(
        string calldata hcs14TopicId,
        string calldata inftTokenId,
        string calldata metadata,
        bool privacyEnabled
    ) external {
        require(agents[msg.sender].registeredAt == 0, "Already registered");
        require(bytes(hcs14TopicId).length > 0, "HCS-14 topic required");

        agents[msg.sender] = AgentInfo({
            owner: msg.sender,
            hcs14TopicId: hcs14TopicId,
            inftTokenId: inftTokenId,
            metadata: metadata,
            privacyEnabled: privacyEnabled,
            registeredAt: block.timestamp
        });

        agentByHcs14[hcs14TopicId] = msg.sender;
        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, hcs14TopicId, inftTokenId, privacyEnabled);
    }

    /**
     * @notice Toggle privacy mode for the calling agent.
     */
    function togglePrivacy(bool enabled) external agentExists(msg.sender) {
        agents[msg.sender].privacyEnabled = enabled;
        emit PrivacyToggled(msg.sender, enabled);
    }

    /**
     * @notice Update agent metadata URI.
     */
    function updateMetadata(string calldata metadata) external agentExists(msg.sender) {
        agents[msg.sender].metadata = metadata;
        emit AgentMetadataUpdated(msg.sender, metadata);
    }

    /**
     * @notice Get agent info by address.
     */
    function getAgent(address agentAddr) external view returns (AgentInfo memory) {
        return agents[agentAddr];
    }

    /**
     * @notice Get all registered agent addresses.
     */
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }

    /**
     * @notice Total number of registered agents.
     */
    function agentCount() external view returns (uint256) {
        return agentList.length;
    }
}
