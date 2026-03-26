import "dotenv/config";
import { Client, TokenId, AccountId, TransferTransaction, PrivateKey } from "@hashgraph/sdk";

/**
 * Hedera Token Service (HTS) micropayment helper.
 * Used for settling fees or rewards in custom tokens (e.g. USDC).
 */
export class HTSMicropayment {
  private client: Client;
  private operatorId: string;
  private readonly dryRun: boolean;

  constructor() {
    this.operatorId = process.env.HEDERA_OPERATOR_ID || "";
    this.dryRun = process.env.DRY_RUN === "true";

    const network = process.env.HEDERA_NETWORK || "testnet";
    this.client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    
    if (this.operatorId && process.env.HEDERA_OPERATOR_KEY) {
      const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);
      this.client.setOperator(this.operatorId, operatorKey);
    }
  }

  /**
   * Execute an HTS Token transfer.
   */
  async transferToken(tokenId: string, recipientId: string, amount: number): Promise<string> {
    if (this.dryRun) {
      console.log(`💸 [HTS] DRY-RUN: Transferred ${amount} of token ${tokenId} to ${recipientId}`);
      return `0.0.mock_hts_tx_id@${Date.now()}`;
    }

    console.log(`💸 [HTS] Executing token transfer: ${amount} ${tokenId} to ${recipientId}...`);

    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), this.operatorId, -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), recipientId, amount)
        .setTransactionMemo("HTS Agent Micropayment");

      const txResponse = await transaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);

      if (receipt.status.toString() === "SUCCESS") {
        const txId = txResponse.transactionId.toString();
        console.log(`✅ [HTS] Transfer verified! TX ID: ${txId}`);
        return txId;
      } else {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }
    } catch (error) {
      console.error("❌ [HTS] Transfer error:", error);
      throw error;
    }
  }
}
