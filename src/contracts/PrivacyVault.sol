// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PrivacyVault
 * @notice Stores encrypted strategy references for privacy-mode DeFi operations.
 *         In private mode: only the commitment hash is stored on-chain.
 *         In public mode: the full strategy URI is stored (0G Storage IPFS-like URI).
 *
 * Deployed on 0G Chain.
 */
contract PrivacyVault {
    struct StrategyRecord {
        address agent;
        bytes32 commitmentHash;   // keccak256 of encrypted strategy (private mode)
        string strategyUri;       // 0G Storage URI (public mode only, empty if private)
        bool isPrivate;
        uint256 timestamp;
        string txExecuted;        // Uniswap TX hash after execution
    }

    mapping(bytes32 => StrategyRecord) public strategies;
    mapping(address => bytes32[]) public agentStrategies;

    event StrategyCommitted(
        bytes32 indexed commitmentHash,
        address indexed agent,
        bool isPrivate,
        uint256 timestamp
    );

    event StrategyRevealed(
        bytes32 indexed commitmentHash,
        string strategyUri
    );

    event ExecutionLinked(
        bytes32 indexed commitmentHash,
        string txHash
    );

    /**
     * @notice Commit a strategy. In private mode, only the hash is stored.
     * @param commitmentHash keccak256(encryptedStrategyBytes)
     * @param strategyUri    If public mode, the 0G Storage URI; if private, pass empty string
     * @param isPrivate      Whether this strategy execution is private
     */
    function commitStrategy(
        bytes32 commitmentHash,
        string calldata strategyUri,
        bool isPrivate
    ) external {
        require(strategies[commitmentHash].agent == address(0), "Already committed");

        strategies[commitmentHash] = StrategyRecord({
            agent: msg.sender,
            commitmentHash: commitmentHash,
            strategyUri: isPrivate ? "" : strategyUri,
            isPrivate: isPrivate,
            timestamp: block.timestamp,
            txExecuted: ""
        });

        agentStrategies[msg.sender].push(commitmentHash);

        emit StrategyCommitted(commitmentHash, msg.sender, isPrivate, block.timestamp);
    }

    /**
     * @notice Reveal a private strategy by providing its URI (optional, after execution).
     */
    function revealStrategy(bytes32 commitmentHash, string calldata strategyUri) external {
        StrategyRecord storage record = strategies[commitmentHash];
        require(record.agent == msg.sender, "Not your strategy");
        require(record.isPrivate, "Not a private strategy");

        record.strategyUri = strategyUri;
        emit StrategyRevealed(commitmentHash, strategyUri);
    }

    /**
     * @notice Link an executed Uniswap transaction to a strategy commitment.
     */
    function linkExecution(bytes32 commitmentHash, string calldata txHash) external {
        StrategyRecord storage record = strategies[commitmentHash];
        require(record.agent == msg.sender, "Not your strategy");
        require(bytes(record.txExecuted).length == 0, "Already executed");

        record.txExecuted = txHash;
        emit ExecutionLinked(commitmentHash, txHash);
    }

    /**
     * @notice Get all strategy commitment hashes for an agent.
     */
    function getAgentStrategies(address agent) external view returns (bytes32[] memory) {
        return agentStrategies[agent];
    }

    /**
     * @notice Get a strategy record by its commitment hash.
     */
    function getStrategy(bytes32 commitmentHash) external view returns (StrategyRecord memory) {
        return strategies[commitmentHash];
    }
}
