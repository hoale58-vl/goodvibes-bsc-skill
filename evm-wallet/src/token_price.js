#!/usr/bin/env node

/**
 * Token Price Script - Fetch token prices via CoinGecko (Free API)
 * Usage: 
 *   node src/token_price.js <tokenId> [tokenId2] ...
 *   node src/token_price.js ethereum bitcoin binancecoin
 */

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';

const args = process.argv.slice(2);
const helpFlag = args.includes('--help') || args.includes('-h');
const jsonFlag = args.includes('--json');

function showHelp() {
  console.log(`
Token Price Checker (via CoinGecko)

Usage: node src/token_price.js [options] <tokenId> [tokenId...]

Arguments:
  tokenId        CoinGecko API ID (e.g., 'bitcoin', 'ethereum', 'binancecoin', 'tether')

Options:
  --json         Output in JSON format
  --help         Show this help message

Examples:
  node src/token_price.js binancecoin              # Get BNB price
  node src/token_price.js ethereum bitcoin         # Get ETH and BTC prices
  node src/token_price.js --json binancecoin       # JSON output
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

async function main() {
  if (helpFlag || args.length === 0) {
    showHelp();
    return;
  }

  // Filter out flags to get token IDs
  const tokenIds = args.filter(arg => !arg.startsWith('--'));

  if (tokenIds.length === 0) {
    exitWithError('No token IDs provided.');
  }

  const idsParam = tokenIds.join(',');
  const url = `${COINGECKO_API}?ids=${idsParam}&vs_currencies=usd`;

  try {
    const res = await fetch(url);
    
    if (!res.ok) {
      throw new Error(`CoinGecko API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (jsonFlag) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n💰 Token Prices (USD):');
      
      // Check if we got data for all requested tokens
      const foundTokens = Object.keys(data);
      
      if (foundTokens.length === 0) {
        console.log('   No data found for the provided token IDs.');
        console.log('   (Make sure to use CoinGecko IDs, e.g., "binancecoin" not "BNB")');
      } else {
        foundTokens.forEach(id => {
          const price = data[id].usd;
          // Capitalize first letter for display
          const name = id.charAt(0).toUpperCase() + id.slice(1);
          console.log(`   ${name.padEnd(15)} $${price.toLocaleString()}`);
        });
      }
      
      // Check for missing tokens
      const missing = tokenIds.filter(id => !data[id]);
      if (missing.length > 0) {
        console.log('\n⚠️  Not found:', missing.join(', '));
      }
    }

  } catch (error) {
    exitWithError(error.message);
  }
}

main();
