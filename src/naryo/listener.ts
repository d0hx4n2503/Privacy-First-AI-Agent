import "dotenv/config";
import WebSocket from "ws";
import { EventEmitter } from "events";
import axios from "axios";

export interface PoolEvent {
  id: string;
  source: "unichain" | "ethereum";
  type: "swap" | "mint" | "burn" | "sync";
  pool: string;
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  priceImpact?: number;
  timestamp: number;
  txHash: string;
  blockNumber?: number;
  rawData?: Record<string, unknown>;
}

export class NaryoListener extends EventEmitter {
  private unichainRpcUrl: string;
  private isRunning: boolean = false;
  private pollingInterval?: ReturnType<typeof setInterval>;

  constructor() {
    super();
    this.unichainRpcUrl =
      process.env.UNICHAIN_RPC_URL || "https://sepolia.unichain.org";
  }

  /**
   * Start listening on all configured chains.
   */
  async start(): Promise<void> {
    this.isRunning = true;
    console.log("🔍 [Naryo] Starting multichain event listener...");

    // Start Unichain polling
    this.startUnichainPolling();

    console.log("✅ [Naryo] Listening on Unichain Sepolia");
  }

  stop(): void {
    this.isRunning = false;
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    console.log("⛔ [Naryo] Listener stopped.");
  }

  // ───────────────────────────────────────────────────────────────────


  // ───────────────────────────────────────────────────────────────────
  // Unichain / Ethereum — JSON-RPC eth_getLogs polling
  // ───────────────────────────────────────────────────────────────────
  private startUnichainPolling(): void {
    let lastBlock = 0;

    // Uniswap V3 Swap event topic
    const SWAP_TOPIC =
      "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

    const poll = async () => {
      if (!this.isRunning) return;
      try {
        // Get current block
        const blockResp = await axios.post(this.unichainRpcUrl, {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_blockNumber",
          params: [],
        });
        const currentBlock = parseInt(blockResp.data.result, 16);
        if (lastBlock === 0) {
          lastBlock = currentBlock - 10;
        }
        if (currentBlock <= lastBlock) return;

        // Get Swap logs
        const logsResp = await axios.post(this.unichainRpcUrl, {
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getLogs",
          params: [
            {
              fromBlock: `0x${lastBlock.toString(16)}`,
              toBlock: `0x${currentBlock.toString(16)}`,
              topics: [SWAP_TOPIC],
            },
          ],
        });

        const logs: Array<Record<string, unknown>> =
          logsResp.data.result || [];
        for (const log of logs.slice(0, 5)) {
          const evt = this.parseUnichainLog(log);
          if (evt) {
            console.log(
              `📡 [Naryo/Unichain] Pool event: ${evt.type} on ${evt.pool} (${evt.tokenA}/${evt.tokenB})`
            );
            this.emit("poolEvent", evt);
          }
        }

        lastBlock = currentBlock;
      } catch (err) {
        if (process.env.LOG_LEVEL === "debug") {
          console.error("[Naryo/Unichain] Poll error:", err);
        }
      }
    };

    setInterval(poll, 12000); // ~1 block time
    poll();
  }

  // ───────────────────────────────────────────────────────────────────
  // Parsers
  // ───────────────────────────────────────────────────────────────────


  private parseUnichainLog(
    log: Record<string, unknown>
  ): PoolEvent | null {
    try {
      return {
        id: `unichain-${log.transactionHash}-${log.logIndex}`,
        source: "unichain",
        type: "swap",
        pool: String(log.address || "unknown"),
        tokenA: "ETH",
        tokenB: "USDC",
        amountA: "0",
        amountB: "0",
        timestamp: Date.now(),
        txHash: String(log.transactionHash || ""),
        blockNumber: log.blockNumber
          ? parseInt(String(log.blockNumber), 16)
          : undefined,
        rawData: log,
      };
    } catch {
      return null;
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // Simulate a pool event (for dry-run / demo mode)
  // ───────────────────────────────────────────────────────────────────
  simulateEvent(overrides: Partial<PoolEvent> = {}): PoolEvent {
    const base: PoolEvent = {
      id: `sim-${Date.now()}`,
      source: "unichain",
      type: "swap",
      pool: "0xD0232Da7069B7B...E4C",
      tokenA: "ETH",
      tokenB: "USDC",
      amountA: "0.1",
      amountB: "350",
      priceImpact: 0.05,
      timestamp: Date.now(),
      txHash: "0xsimulatedtxhash",
    };
    const evt = { ...base, ...overrides };
    this.emit("poolEvent", evt);
    return evt;
  }
}
