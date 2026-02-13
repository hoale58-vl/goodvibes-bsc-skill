/**
 * EVM Chain Configurations (Optimized for BNB Chain)
 * Includes chainId, native token, block explorers, and default public RPCs
 */

export const chains = {
  bsc: {
    chainId: 56,
    name: "BNB Smart Chain",
    nativeToken: {
      symbol: "BNB",
      decimals: 18
    },
    explorer: {
      name: "BscScan",
      url: "https://bscscan.com"
    },
    rpcs: [
      "https://binance.ankr.com",
      "https://bsc-dataseed.binance.org",
      "https://bsc.publicnode.com"
    ]
  },
  
  opbnb: {
    chainId: 204,
    name: "opBNB Mainnet",
    nativeToken: {
      symbol: "BNB",
      decimals: 18
    },
    explorer: {
      name: "opBNBScan",
      url: "https://opbnbscan.com"
    },
    rpcs: [
      "https://opbnb-mainnet-rpc.bnbchain.org",
      "https://opbnb.publicnode.com"
    ]
  },
  
  "bsc-testnet": {
    chainId: 97,
    name: "BSC Testnet",
    nativeToken: {
      symbol: "tBNB",
      decimals: 18
    },
    explorer: {
      name: "BscScan Testnet",
      url: "https://testnet.bscscan.com"
    },
    rpcs: [
      "https://bsc-testnet.publicnode.com",
      "https://data-seed-prebsc-1-s1.binance.org:8545"
    ]
  },
  
  "opbnb-testnet": {
    chainId: 5611,
    name: "opBNB Testnet",
    nativeToken: {
      symbol: "tBNB",
      decimals: 18
    },
    explorer: {
      name: "opBNBScan Testnet",
      url: "https://testnet.opbnbscan.com"
    },
    rpcs: [
      "https://opbnb-testnet-rpc.bnbchain.org"
    ]
  }
};

/**
 * Get chain config by name
 * @param {string} chainName - Chain name (e.g., "bsc", "opbnb")
 * @returns {Object} Chain configuration
 */
export function getChain(chainName) {
  const chain = chains[chainName.toLowerCase()];
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainName}. Supported chains: ${Object.keys(chains).join(', ')}`);
  }
  return chain;
}

/**
 * Get all supported chain names
 * @returns {string[]} Array of chain names
 */
export function getSupportedChains() {
  return Object.keys(chains);
}

/**
 * Create explorer URL for transaction
 * @param {string} chainName - Chain name
 * @param {string} txHash - Transaction hash
 * @returns {string} Explorer URL
 */
export function getExplorerTxUrl(chainName, txHash) {
  const chain = getChain(chainName);
  return `${chain.explorer.url}/tx/${txHash}`;
}

/**
 * Create explorer URL for address
 * @param {string} chainName - Chain name
 * @param {string} address - Wallet address
 * @returns {string} Explorer URL
 */
export function getExplorerAddressUrl(chainName, address) {
  const chain = getChain(chainName);
  return `${chain.explorer.url}/address/${address}`;
}
