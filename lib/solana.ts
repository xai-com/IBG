import { Connection, PublicKey } from "@solana/web3.js";

// TODO: ADD CONTRACT ADDRESS HERE
export const JPG_TOKEN_MINT = new PublicKey(
  "DZJefTBdJ2Ui2YB1bWgi6Bv1TPPVZJMrvGrbCDjtjups",
);

// TODO: ADD HELIUS API KEY HERE
const HELIUS_API_KEY = "acedb5e9-377f-4319-8bf8-7e5375a94e9e";
if (!HELIUS_API_KEY) {
  throw new Error(
    "Helius API key is not set. Please add NEXT_PUBLIC_HELIUS_API_KEY to your .env.local file",
  );
}
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  website?: string;
  logoURI?: string;
  tags?: string[];
}

let tokenMetadataCache: TokenMetadata | null = null;
let tokenMetadataCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get token metadata from on-chain data
export const getTokenMetadata = async (): Promise<TokenMetadata> => {
  const now = Date.now();

  // Return cached data if still valid
  if (tokenMetadataCache && now - tokenMetadataCacheTime < CACHE_DURATION) {
    return tokenMetadataCache;
  }

  try {
    // First try to get metadata from Metaplex metadata account
    const metadataResponse = await fetchWithRetry(
      `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          mintAccounts: [JPG_TOKEN_MINT.toString()],
          includeOffChain: true,
          disableCache: false,
        }),
      },
    );

    const metadataData = await metadataResponse.json();

    if (metadataData && metadataData[0] && metadataData[0].onChainMetadata) {
      const onChainData = metadataData[0].onChainMetadata.metadata;
      const offChainData = metadataData[0].offChainMetadata;

      const metadata: TokenMetadata = {
        name: onChainData.data.name || "JPG",
        symbol: onChainData.data.symbol || "JPG",
        decimals: onChainData.data.decimals || 6,
        description:
          offChainData?.description ||
          onChainData.data.description ||
          "Jupiter Printing Glitch Token",
        website: offChainData?.website || "",
        logoURI: offChainData?.image || "",
        tags: offChainData?.tags || [],
      };

      // Cache the result
      tokenMetadataCache = metadata;
      tokenMetadataCacheTime = now;

      return metadata;
    }

    // Fallback: Get basic token info from RPC
    const tokenInfo = await rpcCall("getTokenSupply", [
      JPG_TOKEN_MINT.toString(),
    ]);

    const fallbackMetadata: TokenMetadata = {
      name: "JPG",
      symbol: "JPG",
      decimals: tokenInfo.value.decimals || 6,
      description: "Jupiter Printing Glitch Token",
      website: "",
      logoURI: "",
      tags: [],
    };

    // Cache the fallback result
    tokenMetadataCache = fallbackMetadata;
    tokenMetadataCacheTime = now;

    return fallbackMetadata;
  } catch (error) {
    console.error("Error fetching token metadata:", error);

    // Ultimate fallback with hardcoded values
    const fallbackMetadata: TokenMetadata = {
      name: "IPG",
      symbol: "IPG",
      decimals: 6,
      description: "Jupiter Printing Glitch Token",
      website: "",
      logoURI: "",
      tags: [],
    };

    // Cache the fallback result
    tokenMetadataCache = fallbackMetadata;
    tokenMetadataCacheTime = now;

    return fallbackMetadata;
  }
};

// Legacy TOKEN_INFO export for backward compatibility (deprecated)
export const TOKEN_INFO = {
  get name() {
    return getTokenMetadata()
      .then((m) => m.name)
      .catch(() => "IPG");
  },
  get symbol() {
    return getTokenMetadata()
      .then((m) => m.symbol)
      .catch(() => "IPG");
  },
  get decimals() {
    return getTokenMetadata()
      .then((m) => m.decimals)
      .catch(() => 9);
  },
  get description() {
    return getTokenMetadata()
      .then((m) => m.description)
      .catch(() => "IPG Token");
  },
  get website() {
    return getTokenMetadata()
      .then((m) => m.website)
      .catch(() => "");
  },
  fullName: "Infinite Pump Glitch", // Keep this as it's not in metadata
};

export const connection = new Connection(HELIUS_RPC_URL, "confirmed");

export interface TokenTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  fromTokenAccount?: string;
  toTokenAccount?: string;
  mint: string;
  tokenAmount: number;
  tokenStandard?: string;
  rawTokenAmount?: {
    decimals: number;
    tokenAmount: string;
  };
}

export interface NativeTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  amount: number;
}

export interface AccountData {
  account: string;
  nativeBalanceChange: number;
  tokenBalanceChanges: TokenTransfer[];
}

export interface EnhancedTokenTransaction {
  signature: string;
  timestamp: number;
  fee: number;
  feePayer: string;
  description?: string;
  type?: string;
  source?: string;
  slot?: number;
  events?: {
    nft?: {
      amount: number;
      buyer: string;
      seller: string;
      description: string;
      fee: number;
      feePayer: string;
      nfts: Array<{
        mint: string;
        tokenStandard: string;
      }>;
      saleType: string;
      source: string;
      staker: string;
      timestamp: number;
      type: string;
    };
    sol?: {
      from: string;
      to: string;
      amount: number;
    };
    swap?: {
      tokenIn: string;
      tokenOut: string;
      tokenInAmount: number;
      tokenOutAmount: number;
      feeAmount: number;
      feeMint: string;
    };
    [key: string]: any;
  };
  tokenTransfers: TokenTransfer[];
  nativeTransfers: NativeTransfer[];
  accountData?: AccountData[];
  transactionError?: any;
  // Additional fields from Helius response
  blockTime?: number;
  indexWithinBlock?: number;
  meta?: any;
  transaction?: any;
}

export interface TopHolder {
  address: string;
  amount: number;
  percentage: number;
}

// Enhanced wallet information with detailed metrics
export interface WalletInfo {
  address: string;
  balance: number;
  percentage: number;
  rank?: number;
  totalTransactions: number;
  lastTransaction?: number;
  expectedDailyRewards: number;
  totalVolume: number;
  averageTransactionSize: number;
  isTopHolder: boolean;
  tokenAccounts: Array<{
    address: string;
    balance: number;
    owner: string;
  }>;
}

export interface RewardMetrics {
  totalRewardPool: number;
  distributionPercentage: number;
  totalTransactions: number;
  nextDistributionTime: number;
}

export interface TokenSupply {
  totalSupply: number;
  circulatingSupply: number;
  burnedSupply: number;
}

// Rate limiting and retry utilities
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Request queue for batching API calls
class RequestQueue {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;
  private batchSize = 5; // Process 5 requests at a time
  private batchDelay = 200; // 200ms between batches

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      // Process batch in parallel
      const promises = batch.map(async ({ fn, resolve, reject }) => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      await Promise.all(promises);

      // Wait before processing next batch
      if (this.queue.length > 0) {
        await delay(this.batchDelay);
      }
    }

    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;

      // Check if it's a rate limit error
      if (
        error.message?.includes("429") ||
        error.message?.includes("rate limit")
      ) {
        const delayMs = baseDelay * Math.pow(2, i) + Math.random() * 1000; // Add jitter
        console.log(`Rate limited, retrying in ${Math.round(delayMs)}ms...`);
        await delay(delayMs);
        continue;
      }

      // For other errors, use shorter delay
      await delay(baseDelay);
    }
  }
  throw new Error("Max retries exceeded");
};

// Enhanced fetch with rate limiting and queuing
const fetchWithRetry = async (url: string, options: RequestInit = {}) => {
  return requestQueue.add(async () => {
    return retryWithBackoff(
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
      },
      3,
      2000,
    ); // Increased base delay for rate limiting
  });
};

// Enhanced RPC call with rate limiting and queuing
const rpcCall = async (method: string, params: any[] = []) => {
  return requestQueue.add(async () => {
    return retryWithBackoff(
      async () => {
        const response = await fetch(HELIUS_RPC_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: method,
            method,
            params,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(`RPC Error: ${data.error.message}`);
        }

        return data.result;
      },
      3,
      2000,
    ); // Increased base delay for rate limiting
  });
};

// Get token supply from on-chain data using correct RPC method
export const getTokenSupply = async (): Promise<TokenSupply> => {
  try {
    // Use enhanced RPC call with rate limiting
    const result = await rpcCall("getTokenSupply", [JPG_TOKEN_MINT.toString()]);

    const supply = result.value.amount;
    const decimals = result.value.decimals;

    // Calculate actual supply in human-readable format
    const totalSupply = supply / Math.pow(10, decimals);

    // For now, assume circulating supply is total supply (can be refined later)
    const circulatingSupply = totalSupply;
    const burnedSupply = 0; // Can be calculated from burn transactions

    return {
      totalSupply,
      circulatingSupply,
      burnedSupply,
    };
  } catch (error) {
    console.error("Error fetching token supply:", error);
    // Fallback values
    return {
      totalSupply: 1_000_000_000,
      circulatingSupply: 1_000_000_000,
      burnedSupply: 0,
    };
  }
};

// Batch parse transactions using Helius API for efficiency
export const parseTransactionsWithHelius = async (
  signatures: string[],
): Promise<EnhancedTokenTransaction[]> => {
  if (signatures.length === 0) {
    return [];
  }

  try {
    // Split large batches to avoid rate limiting
    const batchSize = 3; // Reduced from 5 to 3 to be more conservative
    const results: EnhancedTokenTransaction[] = [];

    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);

      try {
        console.log(
          `Parsing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(signatures.length / batchSize)}:`,
          batch,
        );

        const response = await fetchWithRetry(
          `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactions: batch,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          if (response.status === 429) {
            throw new Error(`Rate limit exceeded: ${errorText}`);
          }
          throw new Error(`Helius API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          console.error("Unexpected response format from Helius:", data);
          continue;
        }

        const parsedTransactions = data
          .filter((parsedTx: any) => parsedTx && parsedTx.signature) // Filter out null/undefined responses
          .map((parsedTx: any): EnhancedTokenTransaction => {
            return {
              signature: parsedTx.signature,
              timestamp: parsedTx.timestamp * 1000, // Convert to MS for JS Date object
              fee: parsedTx.fee || 0,
              feePayer: parsedTx.feePayer || "",
              description: parsedTx.description || "",
              type: parsedTx.type || "UNKNOWN",
              source: parsedTx.source || "UNKNOWN",
              slot: parsedTx.slot,
              events: parsedTx.events || {},
              tokenTransfers: parsedTx.tokenTransfers || [],
              nativeTransfers: parsedTx.nativeTransfers || [],
              accountData: parsedTx.accountData || [],
              transactionError: parsedTx.transactionError,
              blockTime: parsedTx.blockTime,
              indexWithinBlock: parsedTx.indexWithinBlock,
              meta: parsedTx.meta,
              transaction: parsedTx.transaction,
            };
          });

        results.push(...parsedTransactions);
        console.log(
          `Successfully parsed ${parsedTransactions.length}/${batch.length} transactions in batch`,
        );

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < signatures.length) {
          await delay(1000); // Increased delay to 1 second between batches
        }
      } catch (error: any) {
        console.error(
          `Error parsing batch ${Math.floor(i / batchSize) + 1}:`,
          error,
        );
        if (error.message?.includes("rate limit")) {
          console.warn(
            "Rate limited on batch, stopping processing to avoid further rate limits",
          );
          break; // Stop processing if rate limited
        }
        // Continue with next batch for other errors
      }
    }

    console.log(
      `Total successfully parsed: ${results.length}/${signatures.length} transactions`,
    );
    return results;
  } catch (error) {
    console.error("Error parsing transactions with Helius:", error);
    return [];
  }
};

// Enhanced transaction parsing using Helius API with fallback
export const parseTransactionWithHelius = async (
  signature: string,
): Promise<EnhancedTokenTransaction | null> => {
  try {
    const transactions = await parseTransactionsWithHelius([signature]);
    return transactions[0] || null;
  } catch (error: any) {
    if (error.message?.includes("rate limit")) {
      console.warn(
        "Rate limited when parsing transaction, using fallback method:",
        signature,
      );
      // Fallback to basic transaction parsing
      return await parseTransactionFallback(signature);
    }
    console.error("Error parsing transaction with Helius:", error);
    return null;
  }
};

// Fallback transaction parsing method
const parseTransactionFallback = async (
  signature: string,
): Promise<EnhancedTokenTransaction | null> => {
  try {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta || tx.meta.err) {
      return null;
    }

    // Extract token transfers from pre/post token balances
    const tokenTransfers: TokenTransfer[] = [];

    // Compare pre and post token balances to find transfers
    const preBalances = tx.meta.preTokenBalances || [];
    const postBalances = tx.meta.postTokenBalances || [];

    // Find JPG token transfers
    const jpgPreBalances = preBalances.filter(
      (b) => b.mint === JPG_TOKEN_MINT.toString(),
    );
    const jpgPostBalances = postBalances.filter(
      (b) => b.mint === JPG_TOKEN_MINT.toString(),
    );

    // Calculate transfers
    jpgPreBalances.forEach((pre) => {
      const post = jpgPostBalances.find((p) => p.owner === pre.owner);
      if (post) {
        const preAmount = pre.uiTokenAmount?.uiAmount || 0;
        const postAmount = post.uiTokenAmount?.uiAmount || 0;
        const change = postAmount - preAmount;

        if (change !== 0) {
          tokenTransfers.push({
            mint: pre.mint,
            tokenAmount: change,
            fromUserAccount: change < 0 ? pre.owner : undefined,
            toUserAccount: change > 0 ? pre.owner : undefined,
          });
        }
      }
    });

    // Extract native SOL transfers
    const nativeTransfers: NativeTransfer[] = [];
    const preNativeBalances = tx.meta.preBalances || [];
    const postNativeBalances = tx.meta.postBalances || [];
    const accountKeys = tx.transaction.message.accountKeys;

    for (let i = 0; i < accountKeys.length; i++) {
      const preBalance = preNativeBalances[i] || 0;
      const postBalance = postNativeBalances[i] || 0;
      const change = postBalance - preBalance;

      if (change !== 0 && Math.abs(change) > 5000) {
        // Ignore small changes (likely fees)
        nativeTransfers.push({
          fromUserAccount:
            change < 0 ? accountKeys[i].pubkey.toBase58() : undefined,
          toUserAccount:
            change > 0 ? accountKeys[i].pubkey.toBase58() : undefined,
          amount: Math.abs(change) / 1e9, // Convert lamports to SOL
        });
      }
    }

    // Determine transaction type
    let type = "TRANSFER";
    let source = "On-chain Fallback";
    let description = "Transaction processed via fallback method";

    // Try to determine if it's a swap based on program IDs
    const programIds = tx.transaction.message.instructions
      .map((ix) => {
        if ("programIdIndex" in ix && typeof ix.programIdIndex === "number") {
          return accountKeys[ix.programIdIndex].pubkey.toBase58();
        } else if ("programId" in ix && ix.programId) {
          return (ix.programId as any).toBase58();
        }
        return "";
      })
      .filter((id) => id !== "");

    if (programIds.includes("JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB")) {
      type = "SWAP";
      source = "JUPITER";
      description = "Jupiter swap transaction";
    } else if (
      programIds.includes("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc")
    ) {
      type = "SWAP";
      source = "ORCA";
      description = "Orca swap transaction";
    } else if (tokenTransfers.length > 0) {
      type = "TRANSFER";
      source = "SPL_TOKEN";
      description = `Transfer ${tokenTransfers.length} token(s)`;
    } else if (nativeTransfers.length > 0) {
      type = "TRANSFER";
      source = "SYSTEM_PROGRAM";
      description = `Transfer ${nativeTransfers.length} SOL`;
    }

    return {
      signature: signature,
      timestamp: (tx.blockTime || 0) * 1000,
      fee: tx.meta.fee,
      feePayer: accountKeys[0].pubkey.toBase58(),
      tokenTransfers,
      nativeTransfers,
      type,
      source,
      description,
      slot: tx.slot || undefined,
      blockTime: tx.blockTime || undefined,
      meta: tx.meta,
      transaction: tx.transaction,
      events: {}, // Empty events for fallback
    };
  } catch (error) {
    console.error("Error in fallback transaction parsing:", error);
    return null;
  }
};

// Get recent transactions with enhanced parsing
export const getRecentTransactionsWithEnhancedParsing = async (
  limit: number = 20,
): Promise<EnhancedTokenTransaction[]> => {
  try {
    // Use the correct Helius API endpoint for fetching transaction history for the JPG token mint
    const response = await fetchWithRetry(
      `https://api.helius.xyz/v0/addresses/${JPG_TOKEN_MINT.toString()}/transactions/?api-key=${HELIUS_API_KEY}&limit=${limit}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded: ${errorText}`);
      }
      throw new Error(`Helius API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("Unexpected response format from Helius:", data);
      return [];
    }

    const parsedTransactions = data
      .filter((parsedTx: any) => parsedTx && parsedTx.signature) // Filter out null/undefined responses
      .map((parsedTx: any): EnhancedTokenTransaction => {
        return {
          signature: parsedTx.signature,
          timestamp: parsedTx.timestamp * 1000, // Convert to MS for JS Date object
          fee: parsedTx.fee || 0,
          feePayer: parsedTx.feePayer || "",
          description: parsedTx.description || "",
          type: parsedTx.type || "UNKNOWN",
          source: parsedTx.source || "UNKNOWN",
          slot: parsedTx.slot,
          events: parsedTx.events || {},
          tokenTransfers: parsedTx.tokenTransfers || [],
          nativeTransfers: parsedTx.nativeTransfers || [],
          accountData: parsedTx.accountData || [],
          transactionError: parsedTx.transactionError,
          blockTime: parsedTx.blockTime,
          indexWithinBlock: parsedTx.indexWithinBlock,
          meta: parsedTx.meta,
          transaction: parsedTx.transaction,
        };
      });

    console.log(
      `Successfully parsed ${parsedTransactions.length}/${data.length} transactions from Helius API`,
    );

    // Sort by timestamp (newest first)
    return parsedTransactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching enhanced transactions:", error);
    // Fallback to original method
    return getRecentTransactions();
  }
};

// Original transaction fetching method (fallback)
export const getRecentTransactions = async (): Promise<
  EnhancedTokenTransaction[]
> => {
  try {
    // Get recent signatures for the token mint
    const signatures = await connection.getSignaturesForAddress(
      JPG_TOKEN_MINT,
      { limit: 20 },
    );

    const transactions: EnhancedTokenTransaction[] = [];

    for (const sig of signatures.slice(0, 10)) {
      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx || !tx.meta || tx.meta.err) continue;

        // This is a simplified parser for the fallback method.
        // It won't be as rich as the Helius one.
        const tokenTransfers =
          tx.meta.postTokenBalances
            ?.filter((balance) => balance.mint === JPG_TOKEN_MINT.toString())
            .map((tb) => ({
              mint: tb.mint,
              tokenAmount: tb.uiTokenAmount?.uiAmount || 0,
            })) || [];

        transactions.push({
          signature: sig.signature,
          timestamp: (sig.blockTime || 0) * 1000,
          fee: tx.meta.fee,
          feePayer: tx.transaction.message.accountKeys[0].pubkey.toBase58(), // Fee payer is the first signature
          tokenTransfers,
          nativeTransfers: [],
          type: "TRANSFER",
          source: "On-chain Fallback",
        });
      } catch (error) {
        console.error(`Error parsing transaction ${sig.signature}:`, error);
        continue;
      }
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(
      "Failed to fetch real transaction data from Solana blockchain",
    );
  }
};

// Get real top token holders from blockchain using correct RPC method
export const getTopHolders = async (): Promise<TopHolder[]> => {
  try {
    // Use enhanced RPC call with rate limiting
    const largestAccounts = await rpcCall("getTokenLargestAccounts", [
      JPG_TOKEN_MINT.toString(),
    ]);

    // Get token supply for percentage calculation
    const supplyResult = await rpcCall("getTokenSupply", [
      JPG_TOKEN_MINT.toString(),
    ]);

    const totalSupply = supplyResult.value.amount;
    const decimals = supplyResult.value.decimals;
    const totalSupplyInTokens = totalSupply / Math.pow(10, decimals);

    const holders: TopHolder[] = largestAccounts.value
      .slice(0, 25)
      .map((account: any) => {
        if (!account.uiAmount || account.uiAmount === 0) return null;

        const amount = account.uiAmount;
        const percentage = (amount / totalSupplyInTokens) * 100;

        return {
          address: account.address,
          amount,
          percentage,
        };
      })
      .filter((h: TopHolder | null): h is TopHolder => h !== null);

    return holders;
  } catch (error) {
    console.error("Error fetching top holders:", error);
    return [];
  }
};

// Get enhanced wallet information with detailed metrics
export const getWalletInfo = async (
  address: string,
): Promise<WalletInfo | null> => {
  try {
    console.log("🔍 Fetching wallet info for address:", address);

    // Use RPC method directly since we know it works for top holders
    console.log("🔄 Using RPC method...");
    const rpcResult = await rpcCall("getTokenAccountsByOwner", [
      address,
      {
        mint: JPG_TOKEN_MINT.toString(),
      },
      {
        encoding: "jsonParsed",
        commitment: "confirmed",
      },
    ]);

    console.log("📊 RPC result structure:", {
      hasValue: !!rpcResult.value,
      valueLength: rpcResult.value?.length || 0,
      firstAccount: rpcResult.value?.[0]
        ? {
            pubkey: rpcResult.value[0].pubkey,
            hasAccount: !!rpcResult.value[0].account,
            hasData: !!rpcResult.value[0].account?.data,
            hasParsed: !!rpcResult.value[0].account?.data?.parsed,
            hasInfo: !!rpcResult.value[0].account?.data?.parsed?.info,
            hasTokenAmount:
              !!rpcResult.value[0].account?.data?.parsed?.info?.tokenAmount,
            tokenAmount:
              rpcResult.value[0].account?.data?.parsed?.info?.tokenAmount,
            owner: rpcResult.value[0].account?.data?.parsed?.info?.owner,
          }
        : null,
    });

    if (!rpcResult.value || rpcResult.value.length === 0) {
      console.log("❌ No JPG token accounts found for this wallet");
      return null;
    }

    console.log("✅ Found JPG tokens via getTokenAccountsByOwner!");

    // Use RPC result - following exact documentation structure
    const rpcTokenAccounts = rpcResult.value
      .map((account: any) => {
        // Following the exact response structure from documentation:
        // account.account.data.parsed.info.tokenAmount.uiAmount
        const tokenAmount = account.account.data.parsed.info.tokenAmount;
        const amount = tokenAmount.uiAmount || 0;

        return {
          address: account.pubkey, // The token account pubkey
          balance: amount,
          owner: account.account.data.parsed.info.owner, // The wallet owner
        };
      })
      .filter((acc: any) => acc.balance > 0);

    if (rpcTokenAccounts.length === 0) {
      console.log("❌ No positive balance found in RPC result");
      return null;
    }

    const totalBalance = rpcTokenAccounts.reduce(
      (sum: number, acc: any) => sum + acc.balance,
      0,
    );
    const tokenAccounts = rpcTokenAccounts;

    console.log("💰 Using RPC data - Total balance:", totalBalance);
    console.log("💰 Token accounts:", tokenAccounts);

    // Get token supply for percentage calculation
    const supplyResult = await rpcCall("getTokenSupply", [
      JPG_TOKEN_MINT.toString(),
    ]);
    console.log("📈 Supply result:", JSON.stringify(supplyResult, null, 2));

    const totalSupply = supplyResult.value.amount;
    const decimals = supplyResult.value.decimals;
    const totalSupplyInTokens = totalSupply / Math.pow(10, decimals);
    const percentage = (totalBalance / totalSupplyInTokens) * 100;

    console.log("📊 Supply calculations:", {
      totalSupply,
      decimals,
      totalSupplyInTokens,
      percentage,
    });

    // Get top holders to determine rank
    console.log("🏆 Fetching top holders for ranking...");
    const topHolders = await getTopHolders();
    console.log("🏆 Top holders:", topHolders);

    const rank =
      topHolders.findIndex((holder) => holder.address === address) + 1;
    const isTopHolder = rank > 0 && rank <= 25;

    console.log("🥇 Rank calculation:", { rank, isTopHolder });

    // Get transaction history for this wallet
    console.log("📜 Fetching transaction history...");
    const transactions = await getAddressTransactionHistory(address, 50);
    console.log("📜 All transactions:", transactions);

    // Filter for transactions involving this wallet (not just JPG transfers)
    const walletTransactions = transactions.filter(
      (tx) =>
        tx.feePayer === address ||
        tx.tokenTransfers?.some(
          (transfer: any) =>
            transfer.fromUserAccount === address ||
            transfer.toUserAccount === address,
        ) ||
        tx.nativeTransfers?.some(
          (transfer: any) =>
            transfer.fromUserAccount === address ||
            transfer.toUserAccount === address,
        ),
    );
    console.log("📜 Wallet transactions:", walletTransactions);

    // Filter for JPG-specific transactions
    const jpgTransactions = transactions.filter((tx) =>
      tx.tokenTransfers?.some(
        (transfer: any) => transfer.mint === JPG_TOKEN_MINT.toString(),
      ),
    );
    console.log("📜 JPG transactions:", jpgTransactions);

    // Calculate metrics using ALL wallet transactions for activity
    const totalTransactions = walletTransactions.length;
    const lastTransaction =
      walletTransactions.length > 0
        ? walletTransactions[0].timestamp
        : undefined;

    // Calculate total volume (sum of all JPG transfers)
    let totalVolume = 0;
    let totalTransferAmount = 0;

    for (const tx of jpgTransactions) {
      const jpgTransfers =
        tx.tokenTransfers?.filter(
          (t: any) => t.mint === JPG_TOKEN_MINT.toString(),
        ) || [];
      for (const transfer of jpgTransfers) {
        const amount = Math.abs(transfer.tokenAmount);
        totalVolume += amount;
        totalTransferAmount += amount;
      }
    }

    const averageTransactionSize =
      totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    // Calculate expected daily rewards using the same math as reward-metrics
    // Constants for calculation - all in JPG tokens
    const DAILY_TURNOVER_RATE = 1;
    const SWAP_FEE_RATE = 25;
    const LP_FEE_SHARE = 0.5;

    // Use total supply as market cap for calculation
    const marketCap = totalSupplyInTokens;

    // Calculate daily volume based on market cap turnover
    const dailyVolume = marketCap * DAILY_TURNOVER_RATE;

    // Calculate fees on the daily volume
    const dailySwapFees = dailyVolume * SWAP_FEE_RATE;
    const dailyLpFees = dailySwapFees * LP_FEE_SHARE;
    const expectedDailyRewards = dailyLpFees * (percentage / 100);

    console.log("🎯 Final wallet info:", {
      address,
      balance: totalBalance,
      percentage,
      rank: rank > 0 ? rank : undefined,
      totalTransactions,
      expectedDailyRewards,
      totalVolume,
      averageTransactionSize,
      isTopHolder,
    });

    return {
      address,
      balance: totalBalance,
      percentage,
      rank: rank > 0 ? rank : undefined,
      totalTransactions,
      lastTransaction,
      expectedDailyRewards,
      totalVolume,
      averageTransactionSize,
      isTopHolder,
      tokenAccounts,
    };
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    return null;
  }
};

// Get real reward metrics from blockchain data
export const getRewardMetrics = async (): Promise<RewardMetrics> => {
  try {
    // Get recent transactions to calculate fees in JPG tokens
    const recentTransactions = await getRecentTransactions();

    // Calculate total fees in JPG tokens (assuming 0.3% swap fee)
    let totalRewardPool = 0;
    let totalVolume = 0;

    for (const tx of recentTransactions) {
      if (tx.type === "SWAP" && tx.events?.swap) {
        const swapEvent = tx.events.swap;
        // For swap events, use the tokenTransfers from the main transaction
        const jpgTransfer = tx.tokenTransfers?.find(
          (t: any) => t.mint === JPG_TOKEN_MINT.toString(),
        );
        const otherTokenTransfer = tx.tokenTransfers?.find(
          (t: any) => t.mint !== JPG_TOKEN_MINT.toString(),
        );

        if (jpgTransfer && otherTokenTransfer) {
          const jpgAmount = Math.abs(jpgTransfer.tokenAmount);
          const otherAmount = Math.abs(otherTokenTransfer.tokenAmount);

          // Calculate volume (total JPG traded)
          totalVolume += jpgAmount;

          // Calculate 0.3% fee on the input amount (not JPG amount)
          // For swaps, fee is typically on the input token
          const inputAmount = jpgTransfer.toUserAccount
            ? jpgAmount
            : otherAmount;
          totalRewardPool += inputAmount * 0.003;
        }
      } else if (tx.type === "TRANSFER") {
        // For transfers, calculate fee on the transferred amount
        const transfer = tx.tokenTransfers?.[0];
        if (transfer && transfer.mint === JPG_TOKEN_MINT.toString()) {
          const transferAmount = Math.abs(transfer.tokenAmount);
          totalVolume += transferAmount;
          // Transfers typically have lower fees, but we'll include them
          totalRewardPool += transferAmount * 0.001; // 0.1% for transfers
        }
      }
    }

    // Calculate next distribution time (every 60 minutes from now)
    const currentTime = Date.now();
    const nextHour =
      Math.ceil(currentTime / (60 * 60 * 1000)) * (60 * 60 * 1000);

    return {
      totalRewardPool, // Now in JPG tokens
      distributionPercentage: 50, // 50% to LPs
      totalTransactions: recentTransactions.length,
      nextDistributionTime: nextHour,
    };
  } catch (error) {
    console.error("Error fetching reward metrics:", error);
    throw new Error(
      "Failed to fetch real reward metrics from Solana blockchain",
    );
  }
};

// Get transaction history for a specific address
export const getAddressTransactionHistory = async (
  address: string,
  limit: number = 20,
): Promise<EnhancedTokenTransaction[]> => {
  try {
    const response = await fetchWithRetry(
      `https://api.helius.xyz/v0/addresses/${address}/transactions/?api-key=${HELIUS_API_KEY}&limit=${limit}`,
    );

    const data = await response.json();
    return data.map(
      (tx: any): EnhancedTokenTransaction => ({
        signature: tx.signature,
        timestamp: tx.timestamp * 1000,
        fee: tx.fee,
        feePayer: tx.feePayer,
        description: tx.description,
        type: tx.type,
        source: tx.source,
        slot: tx.slot,
        events: tx.events,
        tokenTransfers: tx.tokenTransfers || [],
        nativeTransfers: tx.nativeTransfers || [],
        accountData: tx.accountData,
        transactionError: tx.transactionError,
        blockTime: tx.blockTime,
        indexWithinBlock: tx.indexWithinBlock,
        meta: tx.meta,
        transaction: tx.transaction,
      }),
    );
  } catch (error) {
    console.error(`Error fetching transaction history for ${address}:`, error);
    return [];
  }
};

// Jupiter API for USD conversion
export const getUSDConversionRate = async (amount: number): Promise<number> => {
  try {
    const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    // Convert amount to the proper format (considering decimals)
    const tokenMetadata = await getTokenMetadata();
    const amountWithDecimals = Math.floor(
      amount * Math.pow(10, tokenMetadata.decimals),
    );

    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${JPG_TOKEN_MINT.toString()}&outputMint=${USDC_MINT}&amount=${amountWithDecimals}&swapMode=ExactIn&slippageBps=50`,
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();

    // Convert USDC amount back to USD (USDC has 6 decimals)
    const usdAmount = parseFloat(data.outAmount) / Math.pow(10, 6);

    return usdAmount;
  } catch (error) {
    console.error("Error fetching USD conversion rate:", error);
    return 0;
  }
};

// Get USD value for a given token amount
export const getUSDValue = async (tokenAmount: number): Promise<number> => {
  try {
    const usdAmount = await getUSDConversionRate(tokenAmount);
    return usdAmount;
  } catch (error) {
    console.error("Error calculating USD value:", error);
    return 0;
  }
};
