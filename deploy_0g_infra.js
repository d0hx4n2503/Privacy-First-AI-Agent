const { execSync } = require('child_process');
require('dotenv').config();

const rpc = process.env.ZG_RPC_URL;
const pk = process.env.ADMIN_PRIVATE_KEY;
const oracle = process.env.AGENT_ADDRESS || '0x9A1834Ec56b672b00B662C15e6D33780299148a0';

function deploy(contractPath, name, args = '') {
    console.log(`🚀 Deploying ${name}...`);
    try {
        const cmd = `wsl ~/.foundry/bin/forge create --rpc-url ${rpc} --private-key ${pk} ${contractPath}:${name} ${args} --json`;
        const out = execSync(cmd).toString();
        // Use regex because Forge output is corrupted with warnings
        const match = out.match(/"deployedTo":\s*"([^"]+)"/);
        if (!match) throw new Error("Could not find deployedTo address in output");
        const address = match[1];
        console.log(`✅ ${name} Deployed to: ${address}`);
        return address;
    } catch (e) {
        console.error(`❌ ${name} Failed:`, e.stdout?.toString() || e.message);
        process.exit(1);
    }
}

const registry = deploy('src/AgentRegistry.sol', 'AgentRegistry');
const inft = deploy('src/INFT.sol', 'INFT', `--constructor-args ${oracle}`);
const privacy = deploy('src/PrivacyVault.sol', 'PrivacyVault');

console.log('\n--- DEPLOIMENT SUMMARY ---');
console.log(`AGENT_REGISTRY_ADDRESS=${registry}`);
console.log(`INFT_CONTRACT_ADDRESS=${inft}`);
console.log(`PRIVACY_VAULT_ADDRESS=${privacy}`);
