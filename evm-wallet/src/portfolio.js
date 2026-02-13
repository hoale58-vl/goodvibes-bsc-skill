#!/usr/bin/env node

/**
 * Portfolio Script - Check wallet net worth & token holdings via Moralis API
 * Usage: 
 *   node src/portfolio.js [chain] [address] [--json]
 */

import { exists, getAddress } from './lib/wallet.js';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, '../config.yaml');

// Load config
let config = {};
try {
  if (fs.existsSync(CONFIG_PATH)) {
    const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = yaml.load(fileContents) || {};
  }
} catch (e) {
  // ignore
}

const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';
// Correctly access nested properties if necessary, but config is flat here.
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || (config ? config.MORALIS_API_KEY : null);

const args = process.argv.slice(2);
const jsonFlag = args.includes('--json');
const helpFlag = args.includes('--help') || args.includes('-h');

// Map local chain names to Moralis chain IDs (hex or decimal)
const CHAIN_MAP = {
  'bsc': '0x38',        // 56
  'binance': '0x38',
  'opbnb': '0xcc',      // 204
  'eth': '0x1',
  'ethereum': '0x1',
  'polygon': '0x89',
  'arbitrum': '0xa4b1',
  'base': '0x2105',
  'optimism': '0xa'
};

function showHelp() {
  console.log(`
BSC Portfolio Checker (via Moralis API)

Usage: node src/portfolio.js [options] [chain] [address]

Arguments:
  chain          Chain name (default: 'bsc')
  address        Wallet address (default: your generated wallet)

Options:
  --json         Output in JSON format
  --help         Show this help message

Environment:
  MORALIS_API_KEY  Required. Set in config.yaml or env var.

Examples:
  node src/portfolio.js                    # Check your BSC portfolio
  node src/portfolio.js opbnb              # Check your opBNB portfolio
  node src/portfolio.js bsc 0x123...       # Check another wallet
  node src/portfolio.js --json             # JSON output
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
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

async function main() {
  if (helpFlag) {
    showHelp();
    return;
  }

  if (!MORALIS_API_KEY) {
    if (jsonFlag) {
      console.log(JSON.stringify({ success: false, error: 'Missing MORALIS_API_KEY' }));
    } else {
      console.log('⚠️  MORALIS_API_KEY is missing.');
      console.log('   Please add it to bsc-defi-assistant/evm-wallet/config.yaml or set MORALIS_API_KEY env var.');
      console.log('   Get a free key at https://moralis.io');
    }
    process.exit(1);
  }

  // Parse args
  const cleanArgs = args.filter(arg => !arg.startsWith('--'));
  const chainName = cleanArgs[0] || 'bsc';
  let address = cleanArgs[1];

  // If no address provided, try to load from local wallet
  if (!address) {
    if (exists()) {
      address = getAddress();
    } else {
      exitWithError('No wallet found. Provide an address or run setup.js first.');
    }
  }

  const moralisChainId = CHAIN_MAP[chainName.toLowerCase()];
  if (!moralisChainId) {
    exitWithError(`Unsupported chain: ${chainName}. Supported: bsc, opbnb, eth, polygon, arbitrum, base, optimism`);
  }

  if (!jsonFlag) {
    console.log(`🔍 Fetching portfolio for ${address} on ${chainName}...`);
  }

  try {
    // 1. Get Wallet Token Balances (ERC20)
    // Endpoint: /wallets/{address}/tokens?chain={chain}&exclude_spam=true
    const url = `${MORALIS_API_URL}/wallets/${address}/tokens?chain=${moralisChainId}&exclude_spam=true`;
    
    const res = await fetch(url, {
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'accept': 'application/json'
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Moralis API Error: ${res.status} ${res.statusText} - ${errText}`);
    }

    const data = await res.json();
    const tokens = data.result || [];

    // 2. Get Native Balance
    // Endpoint: /wallets/{address}/native_balances?chain={chain} (Moralis doesn't have a direct /native_balance under wallets, usually under /balance)
    // Correct: /balance
    const nativeUrl = `${MORALIS_API_URL}/${address}/balance?chain=${moralisChainId}`;
    const nativeRes = await fetch(nativeUrl, {
      headers: { 'X-API-Key': MORALIS_API_KEY }
    });
    
    let nativeBalance = 0;
    if (nativeRes.ok) {
       const nativeData = await nativeRes.json();
       nativeBalance = parseFloat(nativeData.balance) / 1e18;
    }

    // 3. Get Native Price (to calculate native value)
    // We can use the 'native_token' info usually returned in token metadata or fetch separately
    // Or just use the WBNB/WETH price from the token list if available
    let nativePrice = 0;
    let nativeSymbol = (chainName === 'bsc' || chainName === 'opbnb') ? 'BNB' : 'ETH';
    
    // Attempt to find wrapped native token in the token list to get price
    // BSC WBNB: 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
    const wrappedAddress = (chainName === 'bsc' || chainName === 'opbnb') 
      ? '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' 
      : '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

    // Check if WBNB/WETH is already in the token list (tokens)
    const wrappedToken = tokens.find(t => t.token_address.toLowerCase() === wrappedAddress.toLowerCase());
    
    if (wrappedToken) {
        // If found, use its price
        nativePrice = wrappedToken.usd_price;
    } else {
        // If not found, fetch price separately
        try {
            const priceUrl = `${MORALIS_API_URL}/erc20/${wrappedAddress}/price?chain=${moralisChainId}`;
            const priceRes = await fetch(priceUrl, { 
              headers: { 
                'X-API-Key': MORALIS_API_KEY, 
                'accept': 'application/json' 
              } 
            });
            if (priceRes.ok) {
                const priceData = await priceRes.json();
                nativePrice = priceData.usdPrice;
            }
        } catch (e) {
            // ignore price fetch error
        }
    }

    // 4. Combine Data
    let holdings = tokens.map(t => ({
      symbol: t.symbol,
      name: t.name,
      balance: parseFloat(t.balance_formatted),
      price: t.usd_price || 0,
      value: t.usd_value || 0,
      contract: t.token_address,
      isNative: false
    }));

    // Add Native Token (Calculate Value)
    const nativeValue = nativeBalance * nativePrice;
    
    if (nativeBalance > 0) {
      holdings.push({
        symbol: nativeSymbol,
        name: `Native ${nativeSymbol}`,
        balance: nativeBalance,
        price: nativePrice,
        value: nativeValue,
        contract: 'NATIVE',
        isNative: true
      });
    }

    // Sort by Value Descending
    holdings.sort((a, b) => (b.value || 0) - (a.value || 0));

    // Filter dust (value < $0.01) unless it's native
    holdings = holdings.filter(h => (h.value > 0.01) || h.isNative);

    // Calculate Total Net Worth
    const netWorth = holdings.reduce((sum, h) => sum + (h.value || 0), 0);


    // Output
    if (jsonFlag) {
      console.log(JSON.stringify({
        address,
        chain: chainName,
        netWorth,
        holdings
      }, null, 2));
    } else {
      console.log(`\n💰 Portfolio: ${address}`);
      console.log(`   Chain: ${chainName.toUpperCase()}`);
      console.log(`   Net Worth: ${formatCurrency(netWorth)}\n`);
      
      console.log(`   ${'Token'.padEnd(10)} ${'Balance'.padEnd(15)} ${'Price'.padEnd(10)} ${'Value'.padStart(10)}`);
      console.log('   ' + '-'.repeat(50));
      
      if (holdings.length === 0) {
        console.log('   (No tokens found)');
      } else {
        holdings.forEach(h => {
          const balanceStr = h.balance > 1000 ? h.balance.toFixed(2) : h.balance.toPrecision(5);
          const priceStr = h.price ? `$${h.price.toFixed(2)}` : 'N/A';
          console.log(`   ${h.symbol.padEnd(10)} ${balanceStr.padEnd(15)} ${priceStr.padEnd(10)} ${formatCurrency(h.value).padStart(10)}`);
        });
      }
      console.log('');
    }

  } catch (error) {
    exitWithError(error.message);
  }
}

main();
