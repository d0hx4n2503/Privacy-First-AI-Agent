import os
import re
import json
import base64
from dataclasses import dataclass
from typing import Optional
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

INFT_ABI = [
    {"name": "mint", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "to",            "type": "address"},
                {"name": "encryptedUri",  "type": "string"},
                {"name": "metadataHash",  "type": "bytes32"}],
     "outputs": [{"name": "", "type": "uint256"}]},
    {"name": "ownerOf", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "tokenId", "type": "uint256"}],
     "outputs": [{"name": "", "type": "address"}]},
    {"name": "getEncryptedUri", "type": "function", "stateMutability": "view",
     "inputs": [{"name": "tokenId", "type": "uint256"}],
     "outputs": [{"name": "", "type": "string"}]},
    {"name": "Transfer", "type": "event",
     "inputs": [
         {"name": "from",    "type": "address", "indexed": True},
         {"name": "to",      "type": "address", "indexed": True},
         {"name": "tokenId", "type": "uint256", "indexed": True},
     ]},
]

REGISTRY_ABI = [
    {"name": "mintAndRegister", "type": "function", "stateMutability": "nonpayable",
     "inputs": [{"name": "inftContract",   "type": "address"},
                {"name": "encryptedUri",   "type": "string"},
                {"name": "metadataHash",   "type": "bytes32"},
                {"name": "privacyEnabled", "type": "bool"}],
     "outputs": []},
    {"name": "AgentRegistered", "type": "event",
     "inputs": [
         {"name": "tokenId",        "type": "uint256", "indexed": True},
         {"name": "owner",          "type": "address", "indexed": True},
         {"name": "privacyEnabled", "type": "bool",    "indexed": False},
     ]},
]


@dataclass
class INFTMetadata:
    agentId: str
    framework: str
    capabilities: list
    createdAt: str
    modelAI: Optional[str] = None
    resource: Optional[str] = None
    storageUri: Optional[str] = None


@dataclass
class INFTResult:
    tokenId: str
    contractAddress: str
    txHash: str
    metadata: INFTMetadata


class INFTMinter:
    def __init__(self):
        self.dry_run = os.environ.get("DRY_RUN") == "true"
        rpc = os.environ.get("ZG_RPC_URL", "https://evmrpc-testnet.0g.ai")
        self.provider = Web3(Web3.HTTPProvider(rpc))
        self.signer = None
        pk = os.environ.get("USER_PRIVATE_KEY") or os.environ.get("ADMIN_PRIVATE_KEY")
        if pk and not self.dry_run:
            self.signer = self.provider.eth.account.from_key(pk)

    def mint(self, metadata: INFTMetadata, recipient: Optional[str] = None) -> INFTResult:
        """
        Mint iNFT to `recipient` (user's wallet).
        If AGENT_REGISTRY_ADDRESS is set, uses mintAndRegister() — one tx for both.
        Otherwise falls back to direct mint() on the iNFT contract.
        Backend signer pays gas; NFT is owned by recipient.
        """
        contract_address = Web3.to_checksum_address(
            os.environ.get("INFT_CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000001")
        )

        if self.dry_run:
            print("⚠️  Dry run enabled. Using mock identity.")
            return self._mock_mint(metadata, contract_address)

        if not self.signer:
            raise RuntimeError("❌ No signer configured! Set USER_PRIVATE_KEY or ADMIN_PRIVATE_KEY.")

        print("🎨 [iNFT] Minting ERC-7857 Agent Identity...")

        # Build on-chain metadata URI with SVG image
        emoji = "👻" if "ghost" in metadata.framework.lower() else "🤖"
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" '
            f'style="background:linear-gradient(135deg,#111,#333);border-radius:20px;">'
            f'<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="150">{emoji}</text>'
            f'<text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-size="24" '
            f'fill="#00ffcc" font-family="monospace" font-weight="bold">{metadata.framework} Agent</text>'
            f'<text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle" font-size="14" '
            f'fill="#aaa" font-family="sans-serif">Privacy-First AI (ERC-7857)</text>'
            f'</svg>'
        )
        base64_svg = "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()

        inft_json = {
            "name": f"{metadata.framework} iNFT Agent",
            "description": "Autonomous Privacy-First AI Agent operating on 0G Network",
            "image": base64_svg,
            "attributes": [
                {"trait_type": "Framework",     "value": metadata.framework},
                {"trait_type": "Capabilities",  "value": ", ".join(metadata.capabilities)},
                {"trait_type": "Creation Date", "value": metadata.createdAt},
                {"trait_type": "Storage",       "value": metadata.storageUri or "0G Storage"},
            ],
        }
        encrypted_uri = "data:application/json;base64," + base64.b64encode(
            json.dumps(inft_json).encode()
        ).decode()
        metadata_hash = self.provider.keccak(text=encrypted_uri)

        signer_address = self.signer.address
        to_address = Web3.to_checksum_address(recipient) if recipient else signer_address

        token_id = "Unknown"
        receipt_hash = ""

        try:
            registry_addr = os.environ.get("AGENT_REGISTRY_ADDRESS")
            if registry_addr:
                reg_addr = Web3.to_checksum_address(registry_addr)
                print(f"📝 [Registry] 1-Click Minting & Registering for {to_address}...")
                registry = self.provider.eth.contract(address=reg_addr, abi=REGISTRY_ABI)
                print(f"iNFT contract: {contract_address} | Registry: {reg_addr}")
                print(f"Metadata hash: {metadata_hash.hex()} | Encrypted URI length: {len(encrypted_uri)} chars")
                
                try:
                    tx = registry.functions.mintAndRegister(
                        contract_address, encrypted_uri, metadata_hash, True
                    ).build_transaction({
                        "from": signer_address,
                        "nonce": self.provider.eth.get_transaction_count(signer_address),
                        "gasPrice": int(self.provider.eth.gas_price * 1.5),
                    })
                    # Estimate gas dynamically
                    tx["gas"] = int(self.provider.eth.estimate_gas(tx) * 1.2)
                    
                    signed = self.signer.sign_transaction(tx)
                    tx_hash_bytes = self.provider.eth.send_raw_transaction(signed.raw_transaction)
                    receipt = self.provider.eth.wait_for_transaction_receipt(tx_hash_bytes)
                    receipt_hash = receipt["transactionHash"].hex()

                    if receipt["status"] == 0:
                        print(f"⚠️  [Registry] Transaction reverted. Falling back to simple mint...")
                        return self._simple_mint(contract_address, to_address, encrypted_uri, metadata_hash, metadata)

                    token_id = "Unknown"
                    for log in receipt["logs"]:
                        try:
                            parsed = registry.events.AgentRegistered().process_log(log)
                            token_id = str(parsed["args"]["tokenId"])
                            print(f"📦 Found AgentRegistered event! ID: {token_id}")
                            break
                        except Exception:
                            continue

                    print(f"✅ [Registry+iNFT] Factory Success! Token ID #{token_id} | TX: {receipt_hash}")
                    self._update_env("MY_AGENT_INFT_ID", token_id)
                    self._update_env("AGENT_ADDRESS", to_address)
                    return INFTResult(tokenId=token_id, contractAddress=contract_address,
                                      txHash=receipt_hash, metadata=metadata)

                except Exception as e:
                    print(f"⚠️  [Registry] Error: {e}. Falling back to simple mint...")
                    return self._simple_mint(contract_address, to_address, encrypted_uri, metadata_hash, metadata)

            else:
                return self._simple_mint(contract_address, to_address, encrypted_uri, metadata_hash, metadata)

        except Exception as e:
            print(f"❌ [iNFT] Mint failure: {e}")
            raise

    def _mock_mint(self, metadata: INFTMetadata, contract_address: str) -> INFTResult:
        token_id = "7857"
        tx_hash = "0x_mock_identity_hash"
        print(f"🎭 [DRY-RUN] Mock Identity Minted: #{token_id}")
        return INFTResult(tokenId=token_id, contractAddress=contract_address,
                          txHash=tx_hash, metadata=metadata)

    def _simple_mint(self, contract_address: str, to_address: str, encrypted_uri: str, metadata_hash: bytes, metadata: INFTMetadata) -> INFTResult:
        print("📝 [Simple Mint] Falling back to direct iNFT contract mint...")
        contract = self.provider.eth.contract(address=contract_address, abi=INFT_ABI)
        signer_address = self.signer.address
        
        tx = contract.functions.mint(to_address, encrypted_uri, metadata_hash).build_transaction({
            "from": signer_address,
            "nonce": self.provider.eth.get_transaction_count(signer_address),
            "gasPrice": self.provider.eth.gas_price,
        })
        tx["gas"] = int(self.provider.eth.estimate_gas(tx) * 1.2)
        
        signed = self.signer.sign_transaction(tx)
        tx_hash_bytes = self.provider.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.provider.eth.wait_for_transaction_receipt(tx_hash_bytes)
        receipt_hash = receipt["transactionHash"].hex()

        if receipt["status"] == 0:
            raise RuntimeError(f"❌ [Simple Mint] Transaction REVERTED: {receipt_hash}")

        token_id = "Unknown"
        for log in receipt["logs"]:
            try:
                parsed = contract.events.Transfer().process_log(log)
                token_id = str(parsed["args"]["tokenId"])
                break
            except Exception:
                pass

        print(f"✅ [iNFT] Identity Created! Token ID: {token_id} | TX: {receipt_hash}")
        self._update_env("MY_AGENT_INFT_ID", token_id)
        self._update_env("AGENT_ADDRESS", to_address)
        return INFTResult(tokenId=token_id, contractAddress=contract_address,
                          txHash=receipt_hash, metadata=metadata)

    def _update_env(self, key: str, value: str):
        env_path = os.path.join(os.getcwd(), ".env")
        try:
            content = open(env_path).read() if os.path.exists(env_path) else ""
            pattern = re.compile(rf"^{key}=.*", re.MULTILINE)
            if pattern.search(content):
                content = pattern.sub(f"{key}={value}", content)
            else:
                content += f"\n{key}={value}"
            with open(env_path, "w") as f:
                f.write(content.strip() + "\n")
        except Exception as e:
            print(f"⚠️  [iNFT] Could not update .env: {e}")


if __name__ == "__main__":
    import datetime
    
    # Initialize minter
    print("🚀 Initializing iNFT Minter for 0G Testnet...")
    minter = INFTMinter()
    
    # Prepare metadata
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    metadata = INFTMetadata(
        agentId=f"privacy-ai-agent-{int(datetime.datetime.now().timestamp())}",
        framework="0G Ghost v2",
        capabilities=["on-chain trading", "sealed inference", "Triple-Proof verification"],
        createdAt=timestamp,
        modelAI="Llama-3-70b-TEE",
        resource="0G Storage v1",
        storageUri="zg://storage.testnet.0g.ai/agent-v2-identity"
    )
    
    try:
        # Mint to the address from USER_PRIVATE_KEY
        result = minter.mint(metadata)
        
        print("\n" + "="*50)
        print("🎉 [iNFT] MINT SUCCESSFUL!")
        print(f"🔹 Token ID: {result.tokenId}")
        print(f"🔹 TX Hash:  {result.txHash}")
        print(f"🔹 Contract: {result.contractAddress}")
        print("="*50)
        
    except Exception as e:
        print(f"\n❌ FATAL: Execution failed: {e}")