import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

export interface X402Header {
  "X-402-Payment-Required": string;
  "X-402-Invoice-ID": string;
  "X-402-Amount": string;
  "X-402-Currency": string;
  "X-402-Address": string;
}

export interface X402Receipt {
  "X-402-Receipt": string;
  "X-402-Invoice-ID": string;
  "X-402-Signature": string;
}

/**
 * Partial x402 Protocol Implementation for Pay-Per-Request inferences.
 * 
 * Allows the agent to act as a client negotiating API access dynamically,
 * or as a server requiring payment before returning an AI inference result.
 */
export class X402PaymentProtocol {
  private agentAddress: string;

  constructor(agentAddress: string) {
    this.agentAddress = agentAddress;
  }

  /**
   * Generate an x402 402 Payment Required response header set.
   * Used when this agent serves an API and requires payment.
   */
  generatePaymentRequired(amountHbar: string): X402Header {
    return {
      "X-402-Payment-Required": "true",
      "X-402-Invoice-ID": uuidv4(),
      "X-402-Amount": amountHbar,
      "X-402-Currency": "HBAR",
      "X-402-Address": this.agentAddress,
    };
  }

  /**
   * After the client pays the invoice on Hedera, generate a receipt.
   */
  generateReceipt(invoiceId: string, txId: string, privateKey: string): X402Receipt {
    // A real implementation would sign the txId payload to prevent replay
    const signature = crypto
      .createHmac("sha256", privateKey || "dummy_secret_for_hackathon")
      .update(txId)
      .digest("hex");

    return {
      "X-402-Receipt": txId,
      "X-402-Invoice-ID": invoiceId,
      "X-402-Signature": signature,
    };
  }

  /**
   * Validate an incoming x402 receipt header.
   */
  validateReceipt(receipt: X402Receipt, expectedInvoice: string): boolean {
    if (receipt["X-402-Invoice-ID"] !== expectedInvoice) return false;
    if (!receipt["X-402-Receipt"]) return false;
    
    // Verify signature logic would go here
    return true;
  }
}
