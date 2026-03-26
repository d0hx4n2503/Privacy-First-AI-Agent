import "dotenv/config";
import { ethers } from "ethers";
// @ts-ignore
import { ZgFile, Indexer } from "@0glabs/0g-ts-sdk";
import * as fs from "fs/promises";
import * as path from "path";
import { CorrelatedStory } from "../naryo/correlator";
import { StrategyRecommendation } from "./inference";

interface MemoryEntry {
  timestamp: number;
  agentId: string;
  story: CorrelatedStory;
  strategy: StrategyRecommendation;
}

/**
 * 0G Storage — Persistent RAG (Retrieval-Augmented Generation) memory.
 * Stores agent decisions onto the 0G decentralized storage network natively.
 */
export class ZGRAGMemory {
  private evmRpc: string;
  private indexerRpc: string;
  private readonly dryRun: boolean;
  private localCache: MemoryEntry[] = []; 
  
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private indexer: any;

  constructor() {
    // Use verified Galileo Testnet Indexer RPC
    this.indexerRpc = "https://rpc-storage-testnet.0g.ai";
    this.evmRpc = process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai";
    this.dryRun = process.env.DRY_RUN === "true";

    this.provider = new ethers.JsonRpcProvider(this.evmRpc);
    const privateKey = process.env.ZG_PRIVATE_KEY || "";
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
    this.indexer = new Indexer(this.indexerRpc);
  }

  /**
   * Save a new memory entry to 0G Decentralized Storage Network.
   */
  async save(entry: MemoryEntry): Promise<string> {
    this.localCache.push(entry);

    if (this.dryRun) {
      console.log(`💾 [0G Storage] DRY-RUN: Memory saved locally`);
      return `local-${entry.timestamp}`;
    }

    console.log(`🔐 [0G Storage] Compiling AI memory payload for decentralized upload...`);
    const tempPath = path.join(process.cwd(), `memory-${entry.timestamp}.json`);
    let file: any = null;

    try {
      await fs.writeFile(tempPath, JSON.stringify(entry));
      
      file = await ZgFile.fromFilePath(tempPath);
      const [tree, treeErr] = await file.merkleTree();
      
      if (treeErr) throw new Error(`Merkle Tree computation failed: ${treeErr}`);
      
      const rootHash = tree?.rootHash();
      console.log(`📀 [0G Storage] File Root Hash generated: ${rootHash}`);
      
      // Execute 0G Network Storage Transaction
      // We explicitly bypass the .env ZG_STORAGE_URL if it's the non-indexer variant
      const [tx, uploadErr] = await this.indexer.upload(file, this.evmRpc, this.signer);
      
      if (uploadErr) throw new Error(uploadErr);
      
      console.log(`✅ [0G Storage] Memory successfully broadcast to Storage Indexer! TX: ${tx}`);
      return rootHash || tx;
      
    } catch (error: any) {
      console.warn("⚠️  [0G Storage] Network failed:", error.message);
      return `local-${entry.timestamp}`;
    } finally {
      if (file) await file.close();
      await fs.unlink(tempPath).catch(() => {});
    }
  }

  /**
   * Retrieve relevant past decisions using keyword search.
   */
  async retrieve(query: string): Promise<string[]> {
    // Searching un-indexed flat files on a decentralized storage layer requires a separate KV Indexer.
    // For this hackathon scope, we mirror the stored data in RAM to execute lightning-fast Regex queries.
    return this.retrieveLocal(query);
  }

  private retrieveLocal(query: string): string[] {
    const terms = query.toLowerCase().split(" ");
    const relevant = this.localCache
      .filter((entry) =>
        terms.some(
          (t) =>
            entry.story.tokenA.toLowerCase().includes(t) ||
            entry.story.tokenB.toLowerCase().includes(t) ||
            entry.strategy.action.toLowerCase().includes(t)
        )
      )
      .slice(-5); 

    if (relevant.length === 0 && this.localCache.length > 0) {
      return this.localCache.slice(-3).map((h) => this.formatMemory(h));
    }

    return relevant.map((h) => this.formatMemory(h));
  }

  private formatMemory(entry: MemoryEntry): string {
    const date = new Date(entry.timestamp).toISOString();
    const { story, strategy } = entry;
    return `[${date}] ${story.tokenA}/${story.tokenB}: action=${strategy.action}, risk=${strategy.riskScore}/10, Reasoning: ${strategy.reasoning.slice(0, 100)}...`;
  }

  getLocalCache(): MemoryEntry[] {
    return this.localCache;
  }
}
