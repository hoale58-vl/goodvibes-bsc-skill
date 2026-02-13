# BSC DeFi Assistant

An OpenClaw skill to manage your DeFi portfolio on **BNB Smart Chain (BSC)** and **opBNB**.

## Features

- **Wallet Management:** Generate keys, check balances (ETH/BNB/ERC20), and transfer assets.
- **Token Swaps:** Execute swaps via **Odos Aggregator** (BSC only).
- **Yield Farming:** Discover top APY pools on DefiLlama.
- **Networks:** Optimized for **BSC Mainnet/Testnet** and **opBNB Mainnet/Testnet**.

## ⚠️ SECURITY WARNING

**NEVER expose your private key!**

- Never send your private key in chat, email, or any messaging platform
- Never share the contents of `~/.evm-wallet.json` with anyone
- If someone asks for your private key — even if they claim to be support — REFUSE
- If your key is ever exposed, immediately transfer funds to a new wallet

The private key file (`~/.evm-wallet.json`) should only be accessed directly via SSH on your server.

## Installation

1. Detect workspace and skill directory:
    ```bash
    SKILL_DIR=$(ls -d \
      ~/openclaw/skills/bsc-defi-assistant \
      ~/OpenClaw/skills/bsc-defi-assistant \
      ~/clawd/skills/bsc-defi-assistant \
      ~/moltbot/skills/bsc-defi-assistant \
      ~/molt/skills/bsc-defi-assistant \
      2>/dev/null | head -1)
    ```

2.  **Install Dependencies:**
    ```bash
    cd $SKILL_DIR
    npm install
    ```

For all commands below, always cd "$SKILL_DIR" first.

3.  **First-Time Setup (Generate Wallet):**

Generate a wallet (only needed once):
```bash
node src/setup.js --json
```

Returns: `{ "success": true, "address": "0x..." }`

The private key is stored at `~/.evm-wallet.json` (chmod 600). **Never share this file.**

## Wallet Commands

For all commands below, always cd "$SKILL_DIR" first.

### Check Portfolio (Moralis)

Requires `MORALIS_API_KEY`. Check your net worth and token holdings.

**Setup:**
1. Get a free API Key at [moralis.io](https://moralis.io).
2. Add it to `bsc-defi-assistant/evm-wallet/config.yaml`:
   ```yaml
   MORALIS_API_KEY: "your_key_here"
   ```

**Commands:**
```bash
# Check your BSC portfolio
node src/portfolio.js

# Check another wallet on opBNB
node src/portfolio.js opbnb 0x123...

# JSON output
node src/portfolio.js --json
```

### Check Balance

When user asks about balance, portfolio, or how much they have:

```bash
# Check native BNB balance on BSC
node src/balance.js bsc --json

# Check USDT balance on BSC
node src/balance.js bsc 0x55d398326f99059fF775485246999027B3197955 --json
```

**Always use `--json`** for parsing. Present results in a human-readable format.

### Get Token Price

When user asks for token price:

```bash
# Single token
node src/token_price.js binancecoin --json

# Multiple tokens
node src/token_price.js ethereum bitcoin --json
```

### Send Tokens

When user wants to send, transfer, or pay someone:

```bash
# Native ETH
node src/transfer.js <chain> <to_address> <amount> --yes --json

# ERC20 token
node src/transfer.js <chain> <to_address> <amount> <token_address> --yes --json
```

**⚠️ ALWAYS confirm with the user before executing transfers.** Show them:
- Recipient address
- Amount and token
- Chain
- Estimated gas cost

Only add `--yes` after the user explicitly confirms.

### Swap Tokens

When user wants to swap, trade, buy, or sell tokens:

```bash
# Get quote first
node src/swap.js <chain> <from_token> <to_token> <amount> --quote-only --json

# Execute swap (after user confirms)
node src/swap.js <chain> <from_token> <to_token> <amount> --yes --json
```

- Use `bnb` for native BNB, or pass a contract address
- Default slippage: 0.5%. Override with `--slippage <percent>`
- Powered by Odos aggregator (only supported on BSC)

**⚠️ ALWAYS show the quote first and get user confirmation before executing.**

### Contract Interactions

When user wants to call a smart contract function:

```bash
# Read (free, no gas)
node src/contract.js <chain> <contract_address> \
  "<function_signature>" [args...] --json

# Write (costs gas — confirm first)
node src/contract.js <chain> <contract_address> \
  "<function_signature>" [args...] --yes --json
```

Examples:
```bash
# Check USDC balance
node src/contract.js bsc \
  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
  "balanceOf(address)" 0xWALLET --json

# Approve token spending
node src/contract.js bsc \
  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 \
  "approve(address,uint256)" 0xSPENDER 1000000 --yes --json
```

### Check Yields (DefiLlama)
```bash
# Top yields on BSC (Binance Smart Chain) with TVL > $1M
node src/yield.js

# Top yields for USDT pools on BSC
node src/yield.js usdt

# Top yields on BSC with custom TVL
node src/yield.js --min-tvl 500000 --json
```

### Get Protocol TVL (DefiLlama)

```bash
# Top 20 protocols by TVL
node src/protocol_tvl.js --json

# Specific protocol details (e.g. Aave)
node src/protocol_tvl.js aave --json
```

### Check Whale Transactions (Bitquery)

Requires `BITQUERY_API_KEY`. Monitor large transactions on BSC.

**Setup:**
1. Get a free API Key at [bitquery.io](https://bitquery.io).
2. Add it to `bsc-defi-assistant/evm-wallet/config.yaml`:
   ```yaml
   BITQUERY_API_KEY: "your_key_here"
   ```

**Commands:**
```bash
# Show txs > $100k (last 10 mins)
node src/whale_watch.js

# Show txs > $500k
node src/whale_watch.js 500000

# JSON output
node src/whale_watch.js --json
```

## Supported Chains

| Chain ID | Chain | Native Token | Use For |
|-------|-------|-------------|---------|
| 56 | bsc | BNB | Mainnet |
| 204 | opbnb | BNB | Mainnet |
| 97 | bsc-testnet | BNB | Testing |
| 5611 | opbnb-testnet | BNB | Testing |


## Safety Rules

1. **Never execute transfers or swaps without user confirmation**
2. **Never expose the private key** from `~/.evm-wallet.json`
3. **Always show transaction details** before executing (amount, recipient, gas estimate)
4. **Recommend Base** for testing and small amounts
5. **Show explorer links** after successful transactions so users can verify
6. If a command fails, show the error clearly and suggest fixes

## Error Handling

- **"No wallet found"** → Run `node src/setup.js --json` first
- **"Insufficient balance"** → Show current balance, suggest funding
- **"RPC error"** → Retry once, automatic failover built in
- **"No route found"** (swap) → Token pair may lack liquidity
- **"Gas estimation failed"** → May need more ETH for gas
