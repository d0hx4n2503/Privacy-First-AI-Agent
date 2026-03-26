import "dotenv/config";
import readlineSync from "readline-sync";

export interface PrivacyConfig {
  enabled: boolean;
  vaultAddress: string;
}

/**
 * Handles the Privacy Toggle (Yes/No) user decision flow.
 */
export class PrivacyManager {
  private readonly dryRun: boolean;

  constructor() {
    this.dryRun = process.env.DRY_RUN === "true";
  }

  /**
   * Prompts the user CLI for privacy mode selection.
   * If auto = true, returns a default (e.g. true for DeFi strategy).
   */
  async promptUser(recommended: boolean, auto: boolean = false): Promise<PrivacyConfig> {
    if (auto) {
      console.log(`\n🛡️  [Privacy] Auto-mode: Selected ${recommended ? "YES" : "NO"} based on AI recommendation.`);
      return {
        enabled: recommended,
        vaultAddress: process.env.PRIVACY_VAULT_ADDRESS || "0.0.mock_vault"
      };
    }

    console.log("\n=======================================================");
    console.log("🛡️  PRIVACY OPTION  🛡️");
    console.log("-------------------------------------------------------");
    console.log("Do you want to execute this trade in PRIVATE mode?");
    console.log(" - YES: TEE execution, no public audit log, hashed on-chain");
    console.log(" - NO : Public Hedera Consensus Service audit trail");
    console.log(`\nAI Recommendation: ${recommended ? "YES (High Risk / Alpha)" : "NO (Low Risk)"}`);
    
    // In dry-run we can mock user input if we don't want to block the script
    if (this.dryRun && process.env.MOCK_USER_INPUT) {
      console.log(`> Automatically answering YES for demo...`);
      return {
        enabled: true,
        vaultAddress: "0.0.mock_vault"
      };
    }

    const answer = readlineSync.question("\nEnable Privacy? (Y/n): ");
    
    const isYes = answer.toLowerCase() === "y" || answer === "";
    
    console.log(`\n🔒 Privacy Mode: ${isYes ? "ENABLED" : "DISABLED"}`);
    
    return {
      enabled: isYes,
      vaultAddress: process.env.PRIVACY_VAULT_ADDRESS || ""
    };
  }
}
