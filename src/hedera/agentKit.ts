import "dotenv/config";
import { Client, AccountId, PrivateKey, TransferTransaction, Hbar } from "@hashgraph/sdk";

/**
 * Wrapper for Hedera Agent Kit.
 * Handles sub-cent micropayments, Agent-to-Agent (A2A) settlement,
 * and HBAR native token transfers without smart contract overhead.
 */
export class HederaAgentWallet {
  private client: Client;
  private operatorId: string | AccountId;
  private operatorKey?: PrivateKey;
  private readonly dryRun: boolean;

  constructor() {
    this.operatorId = process.env.HEDERA_OPERATOR_ID || "";
    this.dryRun = process.env.DRY_RUN === "true";

    const network = process.env.HEDERA_NETWORK || "testnet";
    this.client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    
    if (this.operatorId && process.env.HEDERA_OPERATOR_KEY) {
      this.operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);
      this.client.setOperator(this.operatorId, this.operatorKey);
    }
  }

  /**
   * Execute an Agent-To-Agent (A2A) micropayment.
   * Hedera's low, predictable fees make sub-cent transfers viable.
   */
  async payAgent(recipientId: string, amountHbar: number, memo: string = "A2A Settlement"): Promise<string> {
    if (this.dryRun) {
      console.log(`💸 [Hedera Agent Kit] DRY-RUN: Paid ${amountHbar} HBAR to ${recipientId} (${memo})`);
      return `0.0.mock_tx_id@${Date.now()}`;
    }

    if (!this.operatorId) {
      throw new Error("HEDERA_OPERATOR_ID not set");
    }

    console.log(`💸 [Hedera Agent Kit] Executing A2A payment: ${amountHbar} HBAR to ${recipientId}...`);

    try {
      const transaction = new TransferTransaction()
        .addHbarTransfer(this.operatorId, new Hbar(-amountHbar))
        .addHbarTransfer(recipientId, new Hbar(amountHbar))
        .setTransactionMemo(memo);

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status.toString() === "SUCCESS") {
        const txId = txResponse.transactionId.toString();
        console.log(`✅ [Hedera Agent Kit] Payment verified! TX ID: ${txId}`);
        return txId;
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
    } catch (error) {
      console.error("❌ [Hedera Agent Kit] Payment error:", error);
      throw error;
    }
  }

  /**
   * Get the current agent's Hedera account ID.
   */
  getAccountId(): string {
    return this.operatorId.toString();
  }
}
