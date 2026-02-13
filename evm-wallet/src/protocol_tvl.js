#!/usr/bin/env node

/**
 * Protocol TVL Script - Fetch protocol TVL via DefiLlama
 * Usage: 
 *   node src/protocol_tvl.js [protocol-slug]
 *   node src/protocol_tvl.js --json
 *   node src/protocol_tvl.js aave --json
 */

const LLAMA_PROTOCOLS_API = 'https://api.llama.fi/protocols';
const LLAMA_PROTOCOL_API = 'https://api.llama.fi/protocol';

const args = process.argv.slice(2);
const helpFlag = args.includes('--help') || args.includes('-h');
const jsonFlag = args.includes('--json');

function showHelp() {
  console.log(`
Protocol TVL Checker (via DefiLlama)

Usage: node src/protocol_tvl.js [options] [protocol-slug]

Arguments:
  protocol-slug  DefiLlama protocol slug (e.g., 'aave', 'uniswap', 'pancakeswap')
                 If omitted, shows top 20 protocols by TVL.

Options:
  --json         Output in JSON format
  --help         Show this help message

Examples:
  node src/protocol_tvl.js                 # Top 20 protocols
  node src/protocol_tvl.js pancakeswap     # PancakeSwap TVL details
  node src/protocol_tvl.js --json          # Top 20 in JSON
`);
}

function exitWithError(message, code = 1) {
  if (jsonFlag) {
    console.log(JSON.stringify({ success: false, error: message }));
  } else {
    console.error(`❌ Error: ${message}`);
  }
  process.exit(code);
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

async function main() {
  if (helpFlag) {
    showHelp();
    return;
  }

  // Filter out flags to get protocol slug
  const slugs = args.filter(arg => !arg.startsWith('--'));
  const protocolSlug = slugs[0];

  try {
    if (protocolSlug) {
      // Fetch specific protocol
      const url = `${LLAMA_PROTOCOL_API}/${protocolSlug}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        // Handle 404 or other errors
        if (res.status === 404) {
             exitWithError(`Protocol '${protocolSlug}' not found.`);
        }
        throw new Error(`DefiLlama API Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (jsonFlag) {
        console.log(JSON.stringify({
          name: data.name,
          tvl: data.tvl,
          chains: data.chains,
          symbol: data.symbol,
          category: data.category
        }, null, 2));
      } else {
        console.log(`\n🏦 ${data.name} (${data.symbol})`);
        console.log(`   Category: ${data.category}`);
        console.log(`   Total TVL: ${formatCurrency(data.tvl)}`);
        console.log(`   Chains: ${data.chains ? data.chains.join(', ') : 'N/A'}`);
      }

    } else {
      // Fetch all protocols (Top 20)
      const res = await fetch(LLAMA_PROTOCOLS_API);
      
      if (!res.ok) {
        throw new Error(`DefiLlama API Error: ${res.status} ${res.statusText}`);
      }

      const allData = await res.json();
      
      // Sort by TVL desc just in case, though API usually returns sorted
      const top20 = allData
        .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
        .slice(0, 20);

      if (jsonFlag) {
        // Output exactly what was requested in the prompt's jq filter
        // jq '[.[:20] | .[] | {name: .name, tvl: .tvl, chain: .chain}]'
        const result = top20.map(p => ({
            name: p.name,
            tvl: p.tvl,
            chain: p.chain
        }));
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\n🏆 Top 20 Protocols by TVL:');
        console.log('   ----------------------------------------------------------------------');
        console.log(`   ${'Name'.padEnd(30)} ${'Chain'.padEnd(15)} ${'TVL'.padStart(20)}`);
        console.log('   ----------------------------------------------------------------------');
        
        top20.forEach(p => {
          console.log(`   ${p.name.padEnd(30)} ${p.chain.padEnd(15)} ${formatCurrency(p.tvl).padStart(20)}`);
        });
        console.log('   ----------------------------------------------------------------------');
      }
    }

  } catch (error) {
    exitWithError(error.message);
  }
}

main();
