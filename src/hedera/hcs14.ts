import "dotenv/config";
import { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

export interface LogResult {
  topicId: string;
  sequenceNumber: number;
  txId: string;
}

/**
 * HCS-14: Universal Agent IDs via Hedera Consensus Service.
 * 
 * Provides verifiable identity and audit trails for AI Agents.
 * Each agent owns a unique HCS Topic. Messages submitted to this topic
 * create an immutable, timestamped ledger of the agent's actions.
 */
export class HCS14AgentIdentity {
  private client: Client;
  private operatorId: string;
  private agentTopicId: string | null = null;
  private readonly dryRun: boolean;

  constructor(existingTopicId?: string) {
    this.operatorId = process.env.HEDERA_OPERATOR_ID || "";
    this.dryRun = process.env.DRY_RUN === "true";

    this.client = process.env.HEDERA_NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    if (this.operatorId && process.env.HEDERA_OPERATOR_KEY) {
      const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY);
      this.client.setOperator(this.operatorId, operatorKey);
    }

    if (existingTopicId) {
      this.agentTopicId = existingTopicId;
    }
  }

  /**
   * Register a new HCS-14 Universal Agent ID (creates an HCS Topic).
   */
  async registerAgent(agentName: string): Promise<string> {
    if (this.dryRun) {
      const mockTopic = `0.0.${Math.floor(Math.random() * 99999 + 10000)}`;
      console.log(`🆔 [HCS-14] DRY-RUN: Registered Universal Agent ID / Topic: ${mockTopic}`);
      this.agentTopicId = mockTopic;
      return mockTopic;
    }

    console.log(`🆔 [HCS-14] Registering new Universal Agent ID for '${agentName}'...`);
    
    try {
      const tx = new TopicCreateTransaction()
        .setTopicMemo(`HCS-14 Agent Identity: ${agentName} | Submitter: ${this.operatorId}`);
      
      const txResponse = await tx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const topicId = receipt.topicId?.toString();

      if (!topicId) throw new Error("Topic creation failed, no topicId returned");

      console.log(`✅ [HCS-14] Identity Registered! Topic ID: ${topicId}`);
      this.agentTopicId = topicId;
      return topicId;
    } catch (error) {
      console.warn("⚠️  [HCS-14] Registration failed, using mock topic:", (error as Error).message);
      this.agentTopicId = "0.0.99999_mock";
      return this.agentTopicId;
    }
  }

  /**
   * Log an immutable audit record to the agent's HCS-14 topic.
   */
  async logAction(actionType: string, payload: Record<string, unknown>): Promise<LogResult> {
    const messageObj = {
      action: actionType,
      timestamp: new Date().toISOString(),
      agentId: this.operatorId,
      data: payload
    };
    
    // Stringify and optionally encrypt here if privacy is needed, 
    // but typically private actions are omitted from HCS entirely.
    const messageString = JSON.stringify(messageObj);

    if (this.dryRun) {
      console.log(`📜 [HCS-14] DRY-RUN: Logged '${actionType}' to topic ${this.agentTopicId || "unknown"}`);
      return {
        topicId: this.agentTopicId || "unknown",
        sequenceNumber: Math.floor(Math.random() * 100),
        txId: `0.0.mock_tx@${Date.now()}`
      };
    }

    if (!this.agentTopicId) {
      throw new Error("Agent Topic ID not initialized. Call registerAgent() first.");
    }

    console.log(`📜 [HCS-14] Appending audit log to Topic ${this.agentTopicId}...`);

    try {
      const tx = new TopicMessageSubmitTransaction()
        .setTopicId(this.agentTopicId)
        .setMessage(messageString);

      const txResponse = await tx.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      
      const result: LogResult = {
        topicId: this.agentTopicId,
        sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
        txId: txResponse.transactionId.toString()
      };

      console.log(`✅ [HCS-14] Log appended. Sequence: ${result.sequenceNumber}`);
      console.log(`   Explorer: https://hashscan.io/testnet/transaction/${txResponse.transactionId.toString()}`);
      
      return result;
    } catch (error) {
      console.warn("⚠️  [HCS-14] Logging failed:", (error as Error).message);
      throw error;
    }
  }
}
