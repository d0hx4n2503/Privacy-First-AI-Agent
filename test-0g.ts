// @ts-ignore
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import * as fs from 'fs';

async function run() {
  const rpc = "https://evmrpc-testnet.0g.ai";
  const indexerRpc = "https://rpc-storage-testnet.0g.ai";
  const pk = "0x4d184ba8c8c15ed76d401281eee1f2c6c69a5022755f709f81bbecd4290f717c";

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);
    const indexer = new Indexer(indexerRpc);

    fs.writeFileSync('test.json', '{"test": 123}');
    
    console.log("Loading file...");
    const file = await ZgFile.fromFilePath('test.json');
    console.log("File loaded!");
    
    const [tree, err] = await file.merkleTree();
    console.log("Tree:", tree?.rootHash(), "Err:", err);
    
    console.log("Uploading...");
    const [tx, uErr] = await indexer.upload(file, rpc, signer);
    console.log("TX:", tx, "Err:", uErr);
    
  } catch (e: any) {
    console.error("Caught error:", e.message);
  }
}

run().then(() => console.log("Done")).catch(console.error);
