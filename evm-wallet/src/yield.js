#!/usr/bin/env node

/**
 * Yield Script - Fetch top BSC DeFi yields via DefiLlama
 * Usage: 
 *   node src/yield.js [symbol] [--min-tvl <amount>] [--json]
 */

const DEFILLAMA_API = 'https://yields.llama.fi/pools';

const args = process.argv.slice(2);
const jsonFlag = args.includes('--json');
const helpFlag = args.includes('--help') || args.includes('-h');

// Parse --min-tvl (default 1M)
let minTvl = 1000000;
const tvlIdx = args.indexOf('--min-tvl');
if (tvlIdx !== -1 && args[tvlIdx + 1]) {
  minTvl = parseFloat(args[tvlIdx + 1]);
}

function showHelp() {
  console.log(`
BSC DeFi Yield Checker (via DefiLlama)

Usage: node src/yield.js [symbol] [options]

Arguments:
  symbol         Token symbol filter (e.g., 'USDC', 'ETH')

Options:
  --min-tvl <n>  Minimum TVL in USD (default: 1000000)
  --json         Output in JSON format
  --help         Show this help message

Examples:
  node src/yield.js                        # Top BSC yields (TVL > $1M)
  node src/yield.js usdt                   # Top USDT yields on BSC
  node src/yield.js --min-tvl 500000       # TVL > $500k
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
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

async function main() {
  if (helpFlag) {
    showHelp();
    return;
  }

  // Filter out flags to get symbol arg
  const cleanArgs = args.filter((arg, i) => 
    !arg.startsWith('--') && (i === 0 || args[i-1] !== '--min-tvl')
  );

  const symbolArg = cleanArgs[0];
  const targetChain = 'Binance'; // Hardcoded for BSC

  if (!jsonFlag) {
    console.log(`🔍 Fetching yields... (Chain: BSC, Min TVL: ${formatCurrency(minTvl)})`);
  }
  
  try {
    const res = await fetch(DEFILLAMA_API);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    
    const json = await res.json();
    let data = json.data;

    // 1. Filter by Chain (BSC only)
    // Note: DefiLlama uses 'Binance' for BSC
    const targetChain = 'Binance'; 
    data = data.filter(p => p.chain === targetChain);

    // 2. Filter by Symbol (if provided)
    if (symbolArg) {
      data = data.filter(p => p.symbol.toLowerCase().includes(symbolArg.toLowerCase()));
    }

    // 3. Filter by TVL
    data = data.filter(p => p.tvlUsd >= minTvl);

    // 4. Sort by APY (desc)
    data.sort((a, b) => b.apy - a.apy);

    // 5. Limit results
    const top = data.slice(0, 10);

    if (jsonFlag) {
      const result = top.map(p => ({
        pool: p.pool,
        project: p.project,
        symbol: p.symbol,
        chain: p.chain, // Will always be Binance
        apy: parseFloat(p.apy.toFixed(2)),
        tvl: p.tvlUsd
      }));
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (top.length === 0) {
        console.log('   No pools found matching criteria.');
      } else {
        console.log(`\n🌾 Top Yield Pools (BSC):`);
        console.table(top.map(p => ({
          Project: p.project,
          Symbol: p.symbol,
          APY: `${p.apy.toFixed(2)}%`,
          TVL: formatCurrency(p.tvlUsd)
        })));
      }
    }

  } catch (error) {
    exitWithError(error.message);
  }
}

main();
