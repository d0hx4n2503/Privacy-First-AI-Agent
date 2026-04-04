// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice Registers AI Agents with their on-chain iNFT identities for verifiable attestation.
 *         Deployed on 0G Chain.
 */
contract AgentRegistry {
    struct AgentInfo {
        address owner;
        string inftTokenId;       // ERC-7857 iNFT token ID on 0G Chain
        string metadata;          // Storage URI (may be encrypted as per ERC-7857)
        bool privacyEnabled;      // Whether agent runs in privacy mode by default
        uint256 registeredAt;
    }

    mapping(address => AgentInfo) public agents;
    address[] public agentList;
    address public owner;

    event AgentRegistered(address indexed agentAddress, string inftTokenId, bool privacyEnabled);
    event PrivacyToggled(address indexed agentAddress, bool privacyEnabled);
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
     * @notice Register an agent with its iNFT identity.
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
     * @notice Log atomic actions from the AI brain to the 0G Chain.
     */
    function logAction(string calldata actionType, string calldata dataHash) external agentExists(msg.sender) {
        emit ActionLogged(msg.sender, actionType, dataHash);
    }

    function togglePrivacy(bool enabled) external agentExists(msg.sender) {
        agents[msg.sender].privacyEnabled = enabled;
        emit PrivacyToggled(msg.sender, enabled);
    }

    function getAgent(address agentAddr) external view returns (AgentInfo memory) {
        return agents[agentAddr];
    }
}
