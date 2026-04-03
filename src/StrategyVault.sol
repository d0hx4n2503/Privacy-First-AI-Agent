// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Uniswap V3 Interfaces (Minimal)
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }
    function mint(MintParams calldata params) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1);
}

/**
 * @title StrategyVault
 * @notice Secure vault for autonomous AI trading. Keeps owner funds safe while 
 *         allowing a designated Agent Operator to perform DeFi actions.
 *
 * Deployed on Execution Network (Sepolia/Unichain).
 */
contract StrategyVault {
    address public owner;
    address public operator;

    ISwapRouter public immutable swapRouter;
    INonfungiblePositionManager public immutable positionManager;

    event OperatorUpdated(address indexed newOperator);
    event Withdraw(address indexed token, uint256 amount);
    event StrategyExecuted(string action, bytes32 indexed strategyHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner, "Caller is not operator");
        _;
    }

    constructor(address _router, address _positionManager) {
        owner = msg.sender;
        swapRouter = ISwapRouter(_router);
        positionManager = INonfungiblePositionManager(_positionManager);
    }

    function setOperator(address _newOperator) external onlyOwner {
        operator = _newOperator;
        emit OperatorUpdated(_newOperator);
    }

    /**
     * @notice Execute a single token swap via Uniswap V3.
     */
    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external onlyOperator returns (uint256 amountOut) {
        IERC20(tokenIn).approve(address(swapRouter), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: address(this),
            deadline: block.timestamp,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });

        amountOut = swapRouter.exactInputSingle(params);
        emit StrategyExecuted("swap", bytes32(0));
    }

    /**
     * @notice Provide liquidity to a Uniswap V3 pool.
     */
    function executeMint(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired
    ) external onlyOperator returns (uint256 tokenId, uint128 liquidity) {
        IERC20(token0).approve(address(positionManager), amount0Desired);
        IERC20(token1).approve(address(positionManager), amount1Desired);

        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp
        });

        (tokenId, liquidity, , ) = positionManager.mint(params);
        emit StrategyExecuted("mint", bytes32(0));
    }

    /**
     * @notice Withdraw funds from the vault. ONLY Owner can do this.
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner).transfer(amount);
        } else {
            IERC20(token).transfer(owner, amount);
        }
        emit Withdraw(token, amount);
    }

    /**
     * @notice Allows the vault to receive ETH (needed for some Uniswap operations).
     */
    receive() external payable {}
}
