import { Orchestrator } from "./src/orchestrator";
import { PoolCandidate } from "./src/pools/screener";

async function testLP() {
  process.env.DRY_RUN = "true";
  process.env.SIMULATE = "true";
  process.env.MOCK_USER_INPUT = "true";

  const orchestrator = new Orchestrator();
  
  // Create a pool candidate that should trigger LP (high confidence in mock)
  const pool: PoolCandidate = {
    name: "WETH/USDC",
    tokenA: "ETH",
    tokenB: "USDC",
    tvl: 100_000_000,
    volume24h: 30_000_000,
    fee: 0.05,
    chain: "unichain"
  };

  console.log("🧪 Testing Phase 2: Liquidity Provision Flow...");
  
  // We might need to run it a few times because of the Math.random() in mock inference
  // but usually it triggers quickly.
  await orchestrator.analyzePoolList([pool], true, true);
}

testLP().catch(console.error);
