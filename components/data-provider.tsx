"use client";

import {
  EnhancedTokenTransaction,
  getRecentTransactionsWithEnhancedParsing,
  getRewardMetrics,
  getTokenMetadata,
  getTokenSupply,
  getTopHolders,
  RewardMetrics,
  TokenMetadata,
  TokenSupply,
  TopHolder,
} from "@/lib/solana";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface DataContextProps {
  metrics: RewardMetrics | null;
  supply: TokenSupply | null;
  holders: TopHolder[];
  transactions: EnhancedTokenTransaction[];
  tokenMetadata: TokenMetadata | null;
  loading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<EnhancedTokenTransaction[]>(
    [],
  );
  const [holders, setHolders] = useState<TopHolder[]>([]);
  const [supply, setSupply] = useState<TokenSupply | null>(null);
  const [metrics, setMetrics] = useState<RewardMetrics | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<TokenMetadata | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStaticData = async () => {
    try {
      setError(null);
      const [metricsData, supplyData, holdersData, metadataData] =
        await Promise.all([
          getRewardMetrics(),
          getTokenSupply(),
          getTopHolders(),
          getTokenMetadata(),
        ]);
      setMetrics(metricsData);
      setSupply(supplyData);
      setHolders(holdersData);
      setTokenMetadata(metadataData);
      setLoading(false);
    } catch (e) {
      console.error("Failed to fetch static data.", e);
      setError(
        e instanceof Error ? e : new Error("Failed to fetch static data."),
      );
      setLoading(false);
    }
  };

  // Polling for recent JPG token transactions
  useEffect(() => {
    let isMounted = true;
    let lastSignature: string | undefined;

    const fetchTransactions = async (isInitial: boolean = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        }
        setError(null);

        // Initial fetch: only 5 transactions for speed
        // Subsequent polls: fetch 10 to catch up
        const limit = isInitial ? 5 : 10;
        const txs = await getRecentTransactionsWithEnhancedParsing(limit);

        if (!isMounted) return;

        setTransactions((prev) => {
          // Only add new transactions, don't replace the entire list
          const existingSignatures = new Set(prev.map((tx) => tx.signature));
          const newTransactions = txs.filter(
            (tx) => !existingSignatures.has(tx.signature),
          );

          // Filter out transactions with no meaningful data
          const validNewTransactions = newTransactions
            .filter(
              (tx) =>
                (tx.tokenTransfers && tx.tokenTransfers.length > 0) ||
                (tx.nativeTransfers && tx.nativeTransfers.length > 0),
            )
            .filter(
              (tx) =>
                // Filter out unknown transaction types
                tx.type !== "UNKNOWN" &&
                tx.type &&
                // Filter out transactions with no description
                tx.description &&
                tx.description.trim() !== "",
            );

          if (validNewTransactions.length === 0) {
            return prev; // No new valid transactions
          }

          // Add new transactions to the top, keep max 50
          const updated = [...validNewTransactions, ...prev];
          return updated.slice(0, 50);
        });

        // Track the latest signature for next poll
        if (txs.length > 0) {
          lastSignature = txs[0].signature;
        }

        if (isInitial) {
          setLoading(false);
        }
      } catch (e) {
        if (!isMounted) return;
        setError(
          e instanceof Error ? e : new Error("Failed to fetch transactions."),
        );
        if (isInitial) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchTransactions(true);

    // Set up polling every 6 seconds (only for new transactions)
    pollingRef.current = setInterval(() => fetchTransactions(false), 6000);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    fetchStaticData();
    // Refresh static data every 5 minutes
    const staticDataInterval = setInterval(fetchStaticData, 300000);
    return () => clearInterval(staticDataInterval);
  }, []);

  return (
    <DataContext.Provider
      value={{
        metrics,
        supply,
        holders,
        transactions,
        tokenMetadata,
        loading,
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
