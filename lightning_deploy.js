const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
    console.log('--- 🛡️  Starting 0G INFRASTRUCTURE DEPLOYMENT ---');

    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_URL);
    const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
    console.log('Deployer Address:', wallet.address);

    const getArtifact = (p, n) => {
        const fullPath = path.join(__dirname, 'out_deploy', p, `${n}.json`);
        return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    };

    // 1. Deploy AgentRegistry
    console.log('🚀 Deploying AgentRegistry...');
    const registryArt = getArtifact('AgentRegistry.sol', 'AgentRegistry');
    const registryFactory = new ethers.ContractFactory(registryArt.abi, registryArt.bytecode.object, wallet);
    const registry = await registryFactory.deploy();
    await registry.waitForDeployment();
    const registryAddr = await registry.getAddress();
    console.log('✅ AgentRegistry deployed to:', registryAddr);

    // 2. Deploy iNFT (ERC-7857)
    console.log('🚀 Deploying INFT (ERC-7857)...');
    const inftArt = getArtifact('INFT.sol', 'INFT');
    const inftFactory = new ethers.ContractFactory(inftArt.abi, inftArt.bytecode.object, wallet);
    // Use deployer as initial oracle for testing
    const inft = await inftFactory.deploy(wallet.address); 
    await inft.waitForDeployment();
    const inftAddr = await inft.getAddress();
    console.log('✅ INFT deployed to:', inftAddr);

    // 3. Deploy PrivacyVault
    console.log('🚀 Deploying PrivacyVault...');
    const privArt = getArtifact('PrivacyVault.sol', 'PrivacyVault');
    const privFactory = new ethers.ContractFactory(privArt.abi, privArt.bytecode.object, wallet);
    const priv = await privFactory.deploy();
    await priv.waitForDeployment();
    const privAddr = await priv.getAddress();
    console.log('✅ PrivacyVault deployed to:', privAddr);

    console.log('\n--- 📝 UPDATING .ENV ---');
    let envContent = fs.readFileSync('.env', 'utf8');
    
    // Replace old addresses or add new ones
    const updateEnv = (key, val) => {
        const regex = new RegExp(`^${key}=.*`, 'm');
        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
            envContent += `\n${key}=${val}`;
        }
    };

    updateEnv('AGENT_REGISTRY_ADDRESS', registryAddr);
    updateEnv('INFT_CONTRACT_ADDRESS', inftAddr);
    updateEnv('PRIVACY_VAULT_ADDRESS', privAddr);
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file updated with new contract addresses!');
}

main().catch(err => {
    console.error('❌ DEPLOYMENT FAILED:', err);
    process.exit(1);
});
