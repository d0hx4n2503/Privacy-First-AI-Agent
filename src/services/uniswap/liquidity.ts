import "dotenv/config";
import { ethers } from "ethers";

export interface LPParams {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  fee: number; // e.g., 3000 for 0.3%
}

export interface LPResult {
  txHash: string;
  tokenId?: string;
  status: "success" | "failed";
}

/**
 * Uniswap V3 Liquidity Provision Manager (Phase 2 & 3).
 * Handles automated minting and withdrawal of LP positions on Sepolia.
 */
export class LiquidityManager {
  private provider: ethers.Provider;
  private signer: ethers.Wallet | null = null;
  private readonly dryRun: boolean;

  // Sepolia Addresses
  private readonly POSITION_MANAGER = "0x1238536071E1c677A632429e3655c799b22cDA52";
  private readonly ADDRESS_MAP: Record<string, string> = {
    "ETH": "0xfff9976782d46cc05630d1f6ebab18b2324d6b14", // WETH
    "USDC": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
  };

  constructor() {
    this.dryRun = process.env.DRY_RUN === "true";
    this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || "https://rpc.sepolia.org");
    
    if (process.env.TRADER_PRIVATE_KEY && !this.dryRun) {
      this.signer = new ethers.Wallet(process.env.TRADER_PRIVATE_KEY, this.provider);
    }
  }

  /**
   * Mint a new Uniswap V3 position.
   */
  async mintPosition(params: LPParams): Promise<LPResult> {
    if (this.dryRun) {
      return this.mockMint(params);
    }

    if (!this.signer) throw new Error("No private key configured for execution.");

    console.log(`🏦 [LP Manager] Providing liquidity: ${params.amountA} ${params.tokenA} + ${params.amountB} ${params.tokenB}`);

    try {
      const addrA = this.ADDRESS_MAP[params.tokenA];
      const addrB = this.ADDRESS_MAP[params.tokenB];

      if (!addrA || !addrB) {
        throw new Error(`Token addresses not found for ${params.tokenA}/${params.tokenB}`);
      }

      // 🚨 Uniswap V3 requires token0 < token1 by address (alphabetical/numerical)
      const isA0 = addrA.toLowerCase() < addrB.toLowerCase();
      const token0Addr = isA0 ? addrA : addrB;
      const token1Addr = isA0 ? addrB : addrA;
      
      const amount0 = isA0 ? params.amountA : params.amountB;
      const amount1 = isA0 ? params.amountB : params.amountA;

      const token0Symbol = isA0 ? params.tokenA : params.tokenB;
      const token1Symbol = isA0 ? params.tokenB : params.tokenA;

      // 1. Approve Manager
      await this.approveToken(token0Addr, amount0);
      await this.approveToken(token1Addr, amount1);

      // 2. Mint Position
      const managerAbi = [
        "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)"
      ];
      const manager = new ethers.Contract(this.POSITION_MANAGER, managerAbi, this.signer);

      const tickLower = -887220; // Wide range for stability in demo
      const tickUpper = 887220;

      const mintParams = {
        token0: token0Addr,
        token1: token1Addr,
        fee: params.fee || 3000,
        tickLower,
        tickUpper,
        amount0Desired: ethers.parseUnits(amount0, token0Symbol === "USDC" ? 6 : 18),
        amount1Desired: ethers.parseUnits(amount1, token1Symbol === "USDC" ? 6 : 18),
        amount0Min: 0,
        amount1Min: 0,
        recipient: await this.signer.getAddress(),
        deadline: Math.floor(Date.now() / 1000) + 60 * 10
      };

      let msgValue = 0n;
      if (token0Symbol === "ETH") {
        msgValue = mintParams.amount0Desired;
      } else if (token1Symbol === "ETH") {
        msgValue = mintParams.amount1Desired;
      }

      console.log("📡 [LP Manager] Broadcasting mint transaction...");
      const tx = await manager.mint(mintParams, { 
        gasLimit: 500000, 
        value: msgValue 
      });
      const receipt = await tx.wait();
      console.log(`✅ [LP Manager] Liquidity provided! TX: ${tx.hash}`);

      return { txHash: tx.hash, status: "success" };
    } catch (error: any) {
      console.error(`❌ [LP Manager] Minting failed: ${error.message}`);
      return { txHash: "", status: "failed" };
    }
  }

  /**
   * Fully withdraw liquidity and collect tokens from a position.
   */
  async withdrawPosition(tokenId: string): Promise<LPResult> {
    if (this.dryRun) {
      return this.mockWithdraw(tokenId);
    }

    if (!this.signer) throw new Error("Signer not configured.");

    console.log(`🏦 [LP Manager] Withdrawing position ID: ${tokenId}`);

    try {
      const managerAbi = [
        "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
        "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external payable returns (uint256 amount0, uint256 amount1)",
        "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external payable returns (uint256 amount0, uint256 amount1)"
      ];
      const manager = new ethers.Contract(this.POSITION_MANAGER, managerAbi, this.signer);

      const pos = await manager.positions(tokenId);
      const liquidity = pos.liquidity;

      if (liquidity > 0n) {
        console.log(`📡 [LP Manager] Decreasing liquidity (${liquidity.toString()})...`);
        const decParams = {
          tokenId,
          liquidity,
          amount0Min: 0,
          amount1Min: 0,
          deadline: Math.floor(Date.now() / 1000) + 60 * 10
        };
        const decTx = await manager.decreaseLiquidity(decParams);
        await decTx.wait();
      }

      console.log(`📡 [LP Manager] Collecting tokens from position...`);
      const collParams = {
        tokenId,
        recipient: await this.signer.getAddress(),
        amount0Max: BigInt("340282366920938463463374607431768211455"), // uint128 max
        amount1Max: BigInt("340282366920938463463374607431768211455")
      };
      const collTx = await manager.collect(collParams);
      await collTx.wait();

      console.log(`✅ [LP Manager] Position withdrawn! TX: ${collTx.hash}`);
      return { txHash: collTx.hash, status: "success" };
    } catch (error: any) {
      console.error(`❌ [LP Manager] Withdrawal failed: ${error.message}`);
      return { txHash: "", status: "failed" };
    }
  }

  /**
   * Fetch all relevant balances (ETH, USDC) and active Uniswap V3 positions.
   */
  async getBalancesAndPositions() {
    const address = await this.signer?.getAddress();
    if (!address) throw new Error("Signer not configured.");

    const results: any = {
      address,
      eth: "0.0",
      usdc: "0.0",
      positions: []
    };

    try {
      // 1. ETH Balance
      const balanceWei = await this.provider.getBalance(address);
      results.eth = ethers.formatEther(balanceWei);

      // 2. USDC Balance
      const usdcAddress = this.ADDRESS_MAP["USDC"];
      const usdcAbi = ["function balanceOf(address account) external view returns (uint256)"];
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, this.provider);
      const usdcBalance = await usdcContract.balanceOf(address);
      results.usdc = ethers.formatUnits(usdcBalance, 6);

      // 3. Uniswap V3 Positions
      const positionManagerAbi = [
        "function balanceOf(address owner) external view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
        "function positions(uint256 tokenId) external view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)"
      ];
      const positionManager = new ethers.Contract(this.POSITION_MANAGER, positionManagerAbi, this.provider);

      const nftCount = await positionManager.balanceOf(address);
      for (let i = 0; i < Number(nftCount); i++) {
        const tokenId = await positionManager.tokenOfOwnerByIndex(address, i);
        const pos = await positionManager.positions(tokenId);
        
        results.positions.push({
          tokenId: tokenId.toString(),
          token0: pos.token0,
          token1: pos.token1,
          liquidity: pos.liquidity.toString(),
          fee: Number(pos.fee)
        });
      }

      return results;
    } catch (error: any) {
      console.error(`❌ [LP Manager] Balance fetch failed: ${error.message}`);
      return results;
    }
  }

  private async approveToken(tokenAddress: string, amount: string): Promise<void> {
    if (tokenAddress.toLowerCase() === this.ADDRESS_MAP["ETH"].toLowerCase()) return;
    
    console.log(`🔓 [LP Manager] Approving token: ${tokenAddress}`);
    const erc20Abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
    const contract = new ethers.Contract(tokenAddress, erc20Abi, this.signer!);
    const decimals = tokenAddress.toLowerCase() === this.ADDRESS_MAP["USDC"].toLowerCase() ? 6 : 18;
    const amountUnits = ethers.parseUnits(amount, decimals);
    
    const tx = await contract.approve(this.POSITION_MANAGER, amountUnits);
    await tx.wait();
  }

  private mockMint(params: LPParams): LPResult {
    console.log(`🎭 [LP Manager] DRY-RUN: Simulated LP deposit of ${params.amountA} ${params.tokenA} + ${params.amountB} ${params.tokenB}`);
    return { txHash: "0x_mock_mint_hash", tokenId: "404", status: "success" };
  }

  private mockWithdraw(tokenId: string): LPResult {
    console.log(`🎭 [LP Manager] DRY-RUN: Simulated LP withdrawal for position ${tokenId}`);
    return { txHash: "0x_mock_withdraw_hash", status: "success" };
  }
}
