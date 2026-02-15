# 🚀 BSC DeFi Assistant

**Your All-in-One Command Center for BNB Smart Chain & opBNB**

BSC DeFi Assistant is an advanced OpenClaw skill that transforms your agent into a professional DeFi portfolio manager. It automates complex blockchain interactions, giving you real-time insights and secure control over your assets directly from your chat interface.

---

## ✨ Key Features

### 1. 📊 Portfolio Management (Personal Finance)
*   **Instant Net Worth:** See your total balance across BSC and opBNB in USD.
*   **Token Discovery:** Automatically finds every token in your wallet (no need to manually add addresses).
*   **Whale Watching:** Monitor large on-chain transfers to spot smart money moves.
*   **Powered by Moralis:** Enterprise-grade data accuracy.

### 2. 💱 Smart Token Swaps (Best Rates)
*   **Aggregated Liquidity:** Uses **Odos Protocol** to scan hundreds of DEXs (PancakeSwap, Uniswap, etc.) for the best possible exchange rate.
*   **Slippage Protection:** Auto-calculates price impact to prevent bad trades.
*   **Gas Estimation:** Shows you transaction costs before you confirm.
*   **Secure Execution:** You always approve the transaction; the agent handles the technical heavy lifting.

### 3. 🏦 Yield Farming Intelligence
*   **Top Opportunities:** Scans **DefiLlama** to find the highest APY farming pools on BSC.
*   **Risk Filtering:** Filter pools by TVL (Total Value Locked) to avoid low-liquidity "rug pulls".
*   **Stablecoin Focus:** Easily find the best yields for USDT, USDC, and DAI.

### 4. ⚡ Real-Time Market Data
*   **Whale Alerts:** Monitor large on-chain transactions (> $100k) using Bitquery to catch smart money moves early.
*   **Token Prices:** Get instant price checks for any crypto asset via CoinGecko.
*   **Protocol Health:** Monitor TVL (Total Value Locked) of major protocols like Venus, PancakeSwap, or Alpaca Finance.
*   **Trend Spotting:** Identify which protocols are growing or shrinking.

### 5. 🔐 Secure Wallet Operations
*   **Self-Custodial:** Your private key stays encrypted on your server. You own your funds.
*   **Multi-Chain:** Seamlessly switch between **BSC Mainnet** (for trading) and **opBNB** (for ultra-low fees).
*   **Contract Interaction:** Read smart contract data or execute custom functions directly.

---

## 🛠️ How It Works

This skill acts as a bridge between your natural language commands and the blockchain:

1.  **You ask:** *"How much is my portfolio worth?"*
    *   **Agent:** Scans your wallet using `portfolio.js`, calculates total USD value, and presents a neat summary.

2.  **You ask:** *"Swap 0.5 BNB to USDT."*
    *   **Agent:** Queries Odos for the best rate, shows you the quote (output amount + gas fee), and asks for confirmation.
    *   **You confirm:** *"Yes."* -> Agent signs and broadcasts the transaction.

3.  **You ask:** *"Where can I get good yield on USDC?"*
    *   **Agent:** Checks DefiLlama for BSC pools with USDC, filters for TVL > $1M, and lists the top 5 APY options.

4.  **You ask:** *"Did any whales move funds recently?"*
    *   **Agent:** Scans the blockchain via Bitquery for transactions over $100k in the last 10 minutes and reports significant activity.

---

## 🔒 Security & Privacy

*   **Private Keys:** Stored locally (`~/.evm-wallet.json`) with restricted permissions (chmod 600).
*   **No Cloud Dependency:** The agent runs on your infrastructure.
*   **Open Source:** All scripts are transparent and audible.

---

## 🚀 Getting Started

1.  **Install:** Add `bsc-defi-assistant` to your OpenClaw skills directory.
2.  **Setup:** Run `node src/setup.js` to generate your secure wallet.
3.  **Config:** Add your API keys (`MORALIS_API_KEY`, `BITQUERY_API_KEY`) to `config.yaml`.
4.  **Fund:** Send some BNB to your new address and start trading!

*Empower your DeFi journey with automation.*

---

## 🧠 Skill Overview (for Business & Hackathon)

This project defines the operating model for an **OpenClaw agent** equipped with multiple DeFi skills for **BSC** and **opBNB**. The agent is designed to be:

*   **Composable:** Each capability is a skill module (wallet, swaps, yields, whale watch).
*   **Safe by default:** High-risk actions (transfers, swaps, contract writes) always require user confirmation.
*   **Data-driven:** On-chain and market data are sourced from Moralis, Bitquery, CoinGecko, and DefiLlama.
*   **Business-friendly:** Outputs are concise, actionable, and explainable for non-technical users.

---

## 🧩 Core Skills

All commands are in `evm-wallet/src` and designed to be executed by the agent on behalf of the user.

*   **Wallet Setup:** `node src/setup.js --json`
*   **Portfolio:** `node src/portfolio.js [chain] [address] --json`
*   **Balances:** `node src/balance.js <chain> [token_address] --json`
*   **Token Price:** `node src/token_price.js <token_id> --json`
*   **Swaps (Odos):** `node src/swap.js <chain> <from> <to> <amount> --quote-only --json`
*   **Transfers:** `node src/transfer.js <chain> <to> <amount> [token_address] --yes --json`
*   **Contracts:** `node src/contract.js <chain> <contract> "<sig>" [args...] --json`
*   **Yields (DefiLlama):** `node src/yield.js [keyword] --json`
*   **Protocol TVL:** `node src/protocol_tvl.js [protocol] --json`
*   **Whale Watch (Bitquery):** `node src/whale_watch.js [threshold_usd] --json`

---

## 💓 Heartbeat (Operational Monitoring)

The agent uses a **10-minute heartbeat** to check for whale transactions on BSC:

*   Script: `node src/whale_watch.js`
*   Default threshold: **$100,000**
*   Time window: **last 10 minutes**

This keeps the agent alert to market-moving activity and enables proactive guidance for users.

---

## ✅ Safety Rules

1.  **Never execute transfers or swaps without user confirmation**
2.  **Never expose the private key** from `~/.evm-wallet.json`
3.  **Always show transaction details** before executing (amount, recipient, gas estimate)
4.  **Recommend testnets** for testing and small amounts
5.  **Show explorer links** after successful transactions so users can verify

---

## 🧪 Supported Chains

| Chain ID | Chain | Native Token | Use For |
|-------|-------|-------------|---------|
| 56 | bsc | BNB | Mainnet |
| 204 | opbnb | BNB | Mainnet |
| 97 | bsc-testnet | BNB | Testing |
| 5611 | opbnb-testnet | BNB | Testing |
