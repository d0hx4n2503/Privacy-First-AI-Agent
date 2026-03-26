import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "dotenv/config";

const ZG_PRIVATE_KEY = process.env.ZG_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "zerog-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16600,
      accounts: ZG_PRIVATE_KEY ? [ZG_PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  }
};

export default config;
