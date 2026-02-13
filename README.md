# 🚀 BSC DeFi Assistant

**Your All-in-One Command Center for BNB Smart Chain & opBNB**

BSC DeFi Assistant is an advanced OpenClaw skill that transforms your agent into a professional DeFi portfolio manager. It automates complex blockchain interactions, giving you real-time insights and secure control over your assets directly from your chat interface.

---

## ✨ Key Features

### 1. 📊 Portfolio Management (Personal Finance)
*   **Instant Net Worth:** See your total balance across BSC and opBNB in USD.
*   **Token Discovery:** Automatically finds every token in your wallet (no need to manually add addresses).
*   **Whale Watching:** Monitor any wallet address to see what smart money is holding.
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
*   **Whale Alerts:** Monitor large transactions (> $100k) on BSC using Bitquery.
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

---

## 🔒 Security & Privacy

*   **Private Keys:** Stored locally (`~/.evm-wallet.json`) with restricted permissions (chmod 600).
*   **No Cloud Dependency:** The agent runs on your infrastructure.
*   **Open Source:** All scripts are transparent and audible.

---

## 🚀 Getting Started

1.  **Install:** Add `bsc-defi-assistant` to your OpenClaw skills directory.
2.  **Setup:** Run `node src/setup.js` to generate your secure wallet.
3.  **Config:** Add your (free) `MORALIS_API_KEY` to `config.yaml` for portfolio tracking.
4.  **Fund:** Send some BNB to your new address and start trading!

*Empower your DeFi journey with automation.*
