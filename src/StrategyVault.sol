// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IUniswapV2Router02 {
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract StrategyVault {
    address public owner;
    address public operator;
    IUniswapV2Router02 public immutable v2Router;
    address public constant WETH = 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9;

    mapping(address => uint256) public ethBalances;

    event StrategyExecuted(address indexed user, string action, uint256 amount);
    event Deposited(address indexed user, uint256 amount);

    constructor(address _v2Router) {
        owner = msg.sender;
        operator = msg.sender;
        v2Router = IUniswapV2Router02(_v2Router);
    }

    function deposit() external payable {
        ethBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    modifier onlyOperator() {
        require(msg.sender == operator || msg.sender == owner, "Only operator");
        _;
    }

    /**
     * @notice ZAPPER: Swap half ETH for Token and then Add Liquidity
     */
    function executeV2ZapLiquidity(address user, address token, uint256 amountEthTotal) external onlyOperator {
        require(ethBalances[user] >= amountEthTotal, "Insufficient user ETH balance");
        require(address(this).balance >= amountEthTotal, "Insufficient Vault ETH");
        ethBalances[user] -= amountEthTotal;

        uint256 swapAmount = amountEthTotal / 2;
        uint256 liquidityAmount = amountEthTotal - swapAmount;

        // 1. Swap half ETH for Token
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = token;

        uint256[] memory amounts = v2Router.swapExactETHForTokens{value: swapAmount}(
            0,
            path,
            address(this),
            block.timestamp + 600
        );
        
        uint256 tokenReceived = amounts[1];

        // 2. Add Liquidity with remaining ETH and received Token
        IERC20(token).approve(address(v2Router), tokenReceived);
        v2Router.addLiquidityETH{value: liquidityAmount}(
            token,
            tokenReceived,
            0,
            0,
            address(this),
            block.timestamp + 600
        );

        emit StrategyExecuted(user, "zap_liquidity", amountEthTotal);
    }

    function executeV2Swap(address user, address tokenOut, uint256 amountEth, uint256 minAmountOut) external onlyOperator {
        require(ethBalances[user] >= amountEth, "Insufficient user ETH balance");
        require(address(this).balance >= amountEth, "Insufficient Vault ETH");
        ethBalances[user] -= amountEth;
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = tokenOut;
        v2Router.swapExactETHForTokens{value: amountEth}(minAmountOut, path, address(this), block.timestamp + 600);
        emit StrategyExecuted(user, "buy", amountEth);
    }

    function withdraw(address token, uint256 amount) external {
        if (token == address(0)) {
            require(ethBalances[msg.sender] >= amount, "Insufficient ETH balance");
            ethBalances[msg.sender] -= amount;
            payable(msg.sender).transfer(amount);
        } else {
            require(msg.sender == owner, "Only owner token withdraw");
            IERC20(token).transfer(owner, amount);
        }
    }

    receive() external payable {}
}
