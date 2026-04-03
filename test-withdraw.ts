import { Orchestrator } from "./src/orchestrator";

async function testWithdraw() {
  process.env.DRY_RUN = "true";
  process.env.SIMULATE = "true";
  process.env.MOCK_USER_INPUT = "true";

  const orchestrator = new Orchestrator();
  
  console.log("🧪 Testing Phase 3: Automated Withdrawal Flow...");

  // Mock story with high danger (price impact > 5%)
  const dangerousStory = {
    tokenA: "ETH",
    tokenB: "USDC",
    totalAmountA: 2.0,
    totalAmountB: 7000,
    priceImpact: 8.5, // High spike
    sources: ["unichain", "ethereum"],
    triggerReason: "Extreme Volatility Spike Detected via Naryo",
    confidence: "high"
  };

  // This should trigger action: "withdraw" in mock inference
  await (orchestrator as any).handleStory(dangerousStory, true);
}

testWithdraw().catch(console.error);
