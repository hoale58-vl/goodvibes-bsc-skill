#!/usr/bin/env node

/**
 * Whale Watch Script - Monitor large transactions on BSC via Bitquery
 * Usage: 
 *   node src/whale_watch.js [threshold_usd] [--json]
 */

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

const BITQUERY_API_URL = 'https://graphql.bitquery.io';
// Supports env var or config.yaml
const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY || (config ? config.BITQUERY_API_KEY : null);

const args = process.argv.slice(2);
const jsonFlag = args.includes('--json');
const helpFlag = args.includes('--help') || args.includes('-h');

// Default threshold: $100,000
let thresholdUsd = 100000;
const thresholdArg = args.find(arg => !arg.startsWith('--'));
if (thresholdArg) {
  thresholdUsd = parseFloat(thresholdArg);
}

function showHelp() {
  console.log(`
BSC Whale Watcher (via Bitquery)

Usage: node src/whale_watch.js [threshold_usd] [options]

Arguments:
  threshold_usd  Minimum value in USD to report (default: 100000)

Options:
  --json         Output in JSON format
  --help         Show this help message

Environment:
  BITQUERY_API_KEY  Required. Set in config.yaml or env var.

Examples:
  node src/whale_watch.js                  # Show txs > $100k (last 10 mins)
  node src/whale_watch.js 500000           # Show txs > $500k
  node src/whale_watch.js --json           # JSON output
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

// Bitquery GraphQL Query
// To filter by amount > threshold on server side, we need to pass $usd
// However, in V1, amount(in: USD) is a calculated field, filtering directly might be tricky depending on plan.
// We will filter client-side to be safe for free tier limits.
const QUERY = `
query ($network: EthereumNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime) {
  ethereum(network: $network) {
    transfers(
      options: {desc: "amount", limit: $limit, offset: $offset}
      date: {since: $from}
      amount: {gt: 0}
    ) {
      block {
        timestamp {
          time(format: "%Y-%m-%d %H:%M:%S")
        }
        height
      }
      sender {
        address
        annotation
      }
      receiver {
        address
        annotation
      }
      transaction {
        hash
      }
      amount
      currency {
        symbol
        decimals
      }
      external: amount(in: USD)
    }
  }
}
`;

async function main() {
  if (helpFlag) {
    showHelp();
    return;
  }

  if (!BITQUERY_API_KEY) {
    if (jsonFlag) {
      console.log(JSON.stringify({ success: false, error: 'Missing BITQUERY_API_KEY' }));
    } else {
      console.log('⚠️  BITQUERY_API_KEY is missing.');
      console.log('   Please add it to bsc-defi-assistant/evm-wallet/config.yaml or set BITQUERY_API_KEY env var.');
      console.log('   Get a free key at https://bitquery.io');
    }
    process.exit(1);
  }

  // Calculate "10 minutes ago" in ISO8601
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const fromTime = tenMinutesAgo.toISOString();

  if (!jsonFlag) {
    console.log(`🔍 Scanning BSC for transactions > ${formatCurrency(thresholdUsd)} (Last 10 mins)...`);
  }

  try {
    const res = await fetch(BITQUERY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': BITQUERY_API_KEY
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          network: 'bsc',
          limit: 50, // Fetch more to filter client side
          offset: 0,
          from: fromTime
        }
      })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Bitquery API Error: ${res.status} ${res.statusText} - ${errText}`);
    }

    const json = await res.json();
    
    if (json.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
    }

    const transfers = json.data.ethereum.transfers;

    // Client-side filter for USD value
    // Note: 'external' field is the amount in USD
    const whales = transfers.filter(t => t.external >= thresholdUsd);

    if (jsonFlag) {
      console.log(JSON.stringify({
        threshold: thresholdUsd,
        count: whales.length,
        transactions: whales.map(t => ({
            time: t.block.timestamp.time,
            hash: t.transaction.hash,
            from: t.sender.address,
            fromLabel: t.sender.annotation,
            to: t.receiver.address,
            toLabel: t.receiver.annotation,
            amount: t.amount,
            symbol: t.currency.symbol,
            valueUsd: t.external
        }))
      }, null, 2));
    } else {
      if (whales.length === 0) {
        console.log('   No whale transactions found in the last 10 minutes.');
      } else {
        console.log(`\n🐋 Found ${whales.length} Whale Transactions (> ${formatCurrency(thresholdUsd)}):`);
        console.log('   ' + '-'.repeat(80));
        
        whales.forEach(t => {
            const time = t.block.timestamp.time.split(' ')[1]; // HH:MM:SS
            const amountStr = `${t.amount.toLocaleString()} ${t.currency.symbol}`;
            const valueStr = formatCurrency(t.external);
            const fromLabel = t.sender.annotation ? `(${t.sender.annotation})` : '';
            const toLabel = t.receiver.annotation ? `(${t.receiver.annotation})` : '';
            
            console.log(`   ⏰ ${time} | 💰 ${valueStr.padEnd(12)} | ${amountStr}`);
            console.log(`      From: ${t.sender.address.slice(0,6)}...${t.sender.address.slice(-4)} ${fromLabel}`);
            console.log(`      To:   ${t.receiver.address.slice(0,6)}...${t.receiver.address.slice(-4)} ${toLabel}`);
            console.log(`      Tx:   https://bscscan.com/tx/${t.transaction.hash}`);
            console.log('   ' + '-'.repeat(80));
        });
      }
    }

  } catch (error) {
    exitWithError(error.message);
  }
}

main();
