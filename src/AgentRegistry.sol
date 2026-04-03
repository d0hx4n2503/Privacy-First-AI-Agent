// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Registers AI Agents with their HCS-14 Universal Agent IDs on-chain.
 *         Deployed on 0G Chain.
 */
contract AgentRegistry {
    struct AgentInfo {
        address owner;
        string inftTokenId;       // ERC-7857 iNFT token ID on 0G Chain
        string metadata;          // IPFS / 0G Storage URI with agent description
        bool privacyEnabled;      // Whether agent runs in privacy mode by default
        uint256 registeredAt;
    }

    mapping(address => AgentInfo) public agents;

    address[] public agentList;
    address public owner;

    event AgentRegistered(
        address indexed agentAddress,
        string inftTokenId,
        bool privacyEnabled
    );

    event PrivacyToggled(address indexed agentAddress, bool privacyEnabled);
    event AgentMetadataUpdated(address indexed agentAddress, string metadata);
    event ActionLogged(address indexed agentAddress, string actionType, string dataHash);

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
     * @notice Register a new AI agent with its iNFT token.
     */
    function registerAgent(
        string calldata inftTokenId,
        string calldata metadata,
        bool privacyEnabled
    ) external {
        require(agents[msg.sender].registeredAt == 0, "Already registered");

        agents[msg.sender] = AgentInfo({
            owner: msg.sender,
            inftTokenId: inftTokenId,
            metadata: metadata,
            privacyEnabled: privacyEnabled,
            registeredAt: block.timestamp
        });

        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, inftTokenId, privacyEnabled);
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

    /**
     * @notice Log an agent action (e.g., analysis, swap) on-chain for verifiability.
     */
    function logAction(string calldata actionType, string calldata dataHash) external agentExists(msg.sender) {
        emit ActionLogged(msg.sender, actionType, dataHash);
    }
}
