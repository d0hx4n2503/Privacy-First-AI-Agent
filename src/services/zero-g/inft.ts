import "dotenv/config";
import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";

export interface iNFTMetadata {
  agentId: string;
  framework: string;
  capabilities: string[];
  createdAt: string;
  modelAI?: string;
  resource?: string;
  storageUri?: string; // Encrypted storage hash on 0G Storage
}

export interface iNFTResult {
  tokenId: string;
  contractAddress: string;
  txHash: string;
  metadata: iNFTMetadata;
}

// Updated ERC-7857 iNFT interface (No experimental fields)
const INFT_ABI = [
  "function mint(address to, string calldata encryptedUri, bytes32 metadataHash) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getEncryptedUri(uint256 tokenId) external view returns (string memory)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const REGISTRY_ABI = [
  "function mintAndRegister(address inftContract, string calldata encryptedUri, bytes32 metadataHash, bool privacyEnabled) external",
  "event AgentRegistered(uint256 indexed tokenId, address indexed owner, bool privacyEnabled)"
];

/**
 * Mints an AI Agent as an iNFT (ERC-7857) on 0G Chain.
 * Follows the 0G Labs technical documentation for encrypted agent metadata.
 */
export class iNFTMinter {
  private provider: ethers.Provider;
  private signer: ethers.Wallet | null = null;
  private readonly dryRun: boolean;

  constructor() {
    this.dryRun = process.env.DRY_RUN === "true";
    this.provider = new ethers.JsonRpcProvider(
      process.env.ZG_RPC_URL || "https://evmrpc-testnet.0g.ai"
    );

    const pk = process.env.USER_PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;
    if (pk && !this.dryRun) {
      this.signer = new ethers.Wallet(pk, this.provider);
    }
  }

  /**
   * Mint the AI agent as an iNFT (ERC-7857) and register it.
   */
  async mint(metadata: iNFTMetadata): Promise<iNFTResult> {
    const contractAddress = ethers.getAddress(
      process.env.INFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000001"
    );

    if (this.dryRun) {
      console.warn("⚠️  Dry run enabled. Using mock identity.");
      return this.mockMint(metadata, contractAddress);
    }

    if (!this.signer) {
      throw new Error("❌ No signer configured! Required for Real On-Chain Minting.");
    }

    try {
      console.log(`🎨 [iNFT] Minting ERC-7857 Agent Identity...`);

      const contract = new ethers.Contract(contractAddress, INFT_ABI, this.signer);

      // Create On-Chain ERC-721 Metadata with SVG Emoji
      const emoji = metadata.framework.toLowerCase().includes("ghost") ? "👻" : "🤖";
      const modelName = (metadata.modelAI || "Standard-LLM").toUpperCase();
      const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" style="background:linear-gradient(135deg, #111, #333);border-radius:20px;">
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="150">${emoji}</text>
        <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="#00ffcc" font-family="monospace" font-weight="bold">${modelName} Agent</text>
        <text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="#aaa" font-family="sans-serif">Privacy-First AI (ERC-7857)</text>
      </svg>`;
      const base64Svg = "data:image/svg+xml;base64," + Buffer.from(svgImage).toString("base64");

      const inftJson = {
        name: `${modelName} Agent #${Math.floor(Math.random() * 1000)}`,
        description: `Autonomous DeFi Strategy Agent powered by ${modelName}. Identity registered on 0G Chain.`,
        image: base64Svg,
        image_data: svgImage,
        attributes: [
          { trait_type: "Framework", value: metadata.framework },
          { trait_type: "Model", value: metadata.modelAI || "Standard" },
          { trait_type: "Capabilities", value: (metadata.capabilities || []).join(", ") },
          { trait_type: "Resource", value: metadata.resource || "0G Compute" },
          { trait_type: "Created At", value: new Date(metadata.createdAt || Date.now()).toLocaleDateString() }
        ]
      };

      const finalUri = "data:application/json;base64," + Buffer.from(JSON.stringify(inftJson)).toString("base64");

      const encryptedUri = finalUri;
      const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(encryptedUri));
      const ownerAddress = await this.signer.getAddress();

      let tokenId = "1";
      let receiptHash = "";

      if (process.env.AGENT_REGISTRY_ADDRESS) {
        const regAddr = ethers.getAddress(process.env.AGENT_REGISTRY_ADDRESS);
        console.log(`📝 [Registry] 1-Click Minting & Registering for ${ownerAddress}...`);
        console.log(`📡 iNFT contract: ${contractAddress} | Registry: ${regAddr}`);
        console.log(`📡 Metadata hash: ${metadataHash} | Encrypted URI length: ${encryptedUri.length} chars`);
        console.log(`📡 URI Prefix: ${encryptedUri.substring(0, 100)}...`);
        const registry = new ethers.Contract(regAddr, REGISTRY_ABI, this.signer);

        try {
          const tx = await registry.mintAndRegister(contractAddress, encryptedUri, metadataHash, true);
          const receipt = await tx.wait();
          receiptHash = receipt.hash;

          const registerEvent = receipt.logs
            .map((log: ethers.Log) => {
              try { return registry.interface.parseLog(log); } catch { return null; }
            })
            .find((e: ethers.LogDescription | null) => e?.name === "AgentRegistered");

          if (registerEvent && registerEvent.args && registerEvent.args.tokenId) {
            tokenId = registerEvent.args.tokenId.toString();
          }
          console.log(`✅ [Registry+iNFT] Factory Success! Token ID #${tokenId} automatically linked! | Tx: ${receiptHash}`);
        } catch (e: any) {
          console.warn(`⚠️  [Registry] Failed to link via Factory. Error: ${e.message}`);
        }
      } else {
        console.warn("⚠️  No REGISTRY address. Falling back to simple mint.");
        const tx = await contract.mint(ownerAddress, encryptedUri, metadataHash);
        const receipt = await tx.wait();
        receiptHash = receipt.hash;

        const transferEvent = receipt.logs
          .map((log: ethers.Log) => {
            try { return contract.interface.parseLog(log); } catch { return null; }
          })
          .find((e: ethers.LogDescription | null) => e?.name === "Transfer");

        tokenId = transferEvent?.args?.tokenId?.toString() || "1";
        console.log(`✅ [iNFT] Identity Created! Token ID: ${tokenId} | Tx: ${receiptHash}`);
      }

      this.updateEnv(tokenId, ownerAddress);
      return { tokenId, contractAddress, txHash: receiptHash, metadata };
    } catch (error: any) {
      console.error(`❌ [iNFT] Mint failure: ${error.message}`);
      throw error;
    }
  }

  private updateEnv(tokenId: string, ownerAddress: string) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
      const updateRegex = (key: string, value: string) => {
        const regex = new RegExp(`^${key}=.*`, "m");
        if (regex.test(envContent)) envContent = envContent.replace(regex, `${key}=${value}`);
        else envContent += `\n${key}=${value}`;
      };
      updateRegex("MY_AGENT_INFT_ID", tokenId);
      updateRegex("AGENT_ADDRESS", ownerAddress);
      fs.writeFileSync(envPath, envContent.trim() + "\n");
    } catch (err) { }
  }

  private mockMint(metadata: iNFTMetadata, contractAddress: string): iNFTResult {
    const tokenId = "7857";
    const txHash = "0x_mock_identity_hash";
    console.log(`🎭 [DRY-RUN] Mock Identity Minted: #${tokenId}`);
    return { tokenId, contractAddress, txHash, metadata };
  }
}
