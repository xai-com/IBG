"use client";

import { useData } from "@/components/data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  EnhancedTokenTransaction,
  JPG_TOKEN_MINT,
  NativeTransfer,
} from "@/lib/solana";
import { cn, formatAddress, formatJPGAmount } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  Copy,
  ExternalLink,
  FileQuestion,
  HelpCircle,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

// --- HELPER FUNCTIONS ---

const useCopyToClipboard = () => {
  return (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };
};

// Enhanced token metadata handling
const getTokenMetadata = (mint: string, tokenMetadata: any) => {
  const jpgMintAddress = JPG_TOKEN_MINT.toString();

  // JPG token
  if (mint === jpgMintAddress) {
    return {
      name: tokenMetadata?.name || "JPG",
      symbol: tokenMetadata?.symbol || "JPG",
      decimals: tokenMetadata?.decimals || 6,
    };
  }

  // Common tokens cache
  const TOKEN_CACHE: {
    [key: string]: { name: string; symbol: string; decimals: number };
  } = {
    So11111111111111111111111111111111111111112: {
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
    },
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
    },
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
      name: "USDT",
      symbol: "USDT",
      decimals: 6,
    },
  };

  return (
    TOKEN_CACHE[mint] ?? {
      name: formatAddress(mint, 6),
      symbol: formatAddress(mint, 4),
      decimals: 9,
    }
  );
};

// Clickable address component
const ClickableAddress = ({
  address,
  children,
  type = "wallet",
}: {
  address: string;
  children: React.ReactNode;
  type?: "wallet" | "token";
}) => {
  const url =
    type === "token"
      ? `https://solscan.io/token/${address}`
      : `https://solscan.io/account/${address}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-sm hover:text-primary transition-colors cursor-pointer"
    >
      {children}
    </a>
  );
};

// --- ADVANCED TRANSACTION PARSING ---

function getTransactionDetails(
  tx: EnhancedTokenTransaction,
  tokenMetadata: any,
) {
  const jpgMintAddress = JPG_TOKEN_MINT.toString();
  const jpgTokenInfo = getTokenMetadata(jpgMintAddress, tokenMetadata);
  const feePayer = tx.feePayer;

  // Filter out transactions with no meaningful data
  if (!tx.tokenTransfers?.length && !tx.nativeTransfers?.length) {
    return null;
  }

  // Filter out unknown transaction types
  if (tx.type === "UNKNOWN" || !tx.type) {
    return null;
  }

  // Filter out transactions with no description
  if (!tx.description || tx.description.trim() === "") {
    return null;
  }

  // --- SWAP Event ---
  if (tx.type === "SWAP" && tx.events?.swap) {
    const swapEvent = tx.events.swap;
    const sourceName = (tx.source || "Unknown")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    // Find JPG and other token transfers
    const jpgTransfer = tx.tokenTransfers?.find(
      (t: any) => t.mint === jpgMintAddress,
    );
    const otherTokenTransfer = tx.tokenTransfers?.find(
      (t: any) => t.mint !== jpgMintAddress,
    );

    if (jpgTransfer && otherTokenTransfer) {
      const isBuy = jpgTransfer.toUserAccount === feePayer;
      const jpgAmount = Math.abs(jpgTransfer.tokenAmount);
      const otherAmount = Math.abs(otherTokenTransfer.tokenAmount);
      const otherTokenInfo = getTokenMetadata(
        otherTokenTransfer.mint,
        tokenMetadata,
      );

      return {
        type: isBuy
          ? `Buy ${jpgTokenInfo.symbol}`
          : `Sell ${jpgTokenInfo.symbol}`,
        Icon: isBuy ? TrendingUp : TrendingDown,
        color: isBuy ? "text-green-500" : "text-red-500",
        description: (
          <div className="space-y-1 max-w-[300px]">
            <div className="font-semibold truncate" title={tx.description}>
              {tx.description}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              By{" "}
              <ClickableAddress address={feePayer}>
                {formatAddress(feePayer)}
              </ClickableAddress>{" "}
              via {sourceName}
            </div>
          </div>
        ),
        change: (
          <div className="text-right space-y-1">
            <div
              className={`font-semibold flex items-center justify-end gap-1 ${isBuy ? "text-green-500" : "text-red-500"}`}
            >
              {isBuy ? "+" : "-"}
              {formatJPGAmount(jpgAmount)}
            </div>
            <div
              className={`text-xs font-medium flex items-center justify-end gap-1 ${isBuy ? "text-red-400" : "text-green-400"}`}
            >
              {isBuy ? "-" : "+"}
              {formatJPGAmount(otherAmount)}
            </div>
          </div>
        ),
        tooltipContent: (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User</span>
              <ClickableAddress address={feePayer}>
                {formatAddress(feePayer, 8)}
              </ClickableAddress>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isBuy ? "Bought" : "Sold"} ({jpgTokenInfo.symbol})
              </span>
              <span className="font-mono">{formatJPGAmount(jpgAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isBuy ? "Sold" : "Bought"} ({otherTokenInfo.symbol})
              </span>
              <span className="font-mono">{formatJPGAmount(otherAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Exchange</span>
              <span className="font-semibold">{sourceName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-mono">{(tx.fee / 1e9).toFixed(6)} SOL</span>
            </div>
          </>
        ),
      };
    }
  }

  // --- TRANSFER Event ---
  if (tx.type === "TRANSFER") {
    const transfer = tx.tokenTransfers?.[0] || tx.nativeTransfers?.[0];
    if (transfer) {
      const mint = "mint" in transfer ? transfer.mint : "native";
      const amount =
        "tokenAmount" in transfer
          ? (transfer as any).tokenAmount
          : (transfer as NativeTransfer).amount / 1e9;
      const tokenInfo = getTokenMetadata(mint, tokenMetadata);
      const from = transfer.fromUserAccount;
      const to = transfer.toUserAccount;

      return {
        type: `${tokenInfo.symbol} Transfer`,
        Icon: ArrowUpDown,
        color: mint === jpgMintAddress ? "text-blue-500" : "text-purple-500",
        description: (
          <div className="space-y-1 max-w-[300px]">
            <div className="font-semibold truncate" title={tx.description}>
              {tx.description}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              From:{" "}
              <ClickableAddress address={from || ""}>
                {formatAddress(from || "")}
              </ClickableAddress>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              To:{" "}
              <ClickableAddress address={to || ""}>
                {formatAddress(to || "")}
              </ClickableAddress>
            </div>
          </div>
        ),
        change: (
          <div className="text-right space-y-1">
            <div className="font-semibold flex items-center justify-end gap-1">
              {formatJPGAmount(amount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {tokenInfo.symbol}
            </div>
          </div>
        ),
        tooltipContent: (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Token</span>
              <ClickableAddress address={mint} type="token">
                {tokenInfo.symbol}
              </ClickableAddress>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono">{formatJPGAmount(amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">From</span>
              <ClickableAddress address={from || ""}>
                {formatAddress(from || "")}
              </ClickableAddress>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">To</span>
              <ClickableAddress address={to || ""}>
                {formatAddress(to || "")}
              </ClickableAddress>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-mono">{(tx.fee / 1e9).toFixed(6)} SOL</span>
            </div>
          </>
        ),
      };
    }
  }

  // --- Fallback ---
  return {
    type:
      tx.type
        ?.split("_")
        .join(" ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown",
    Icon: FileQuestion,
    color: "text-muted-foreground",
    description: (
      <div className="space-y-1 max-w-[300px]">
        <div className="font-semibold truncate" title={tx.description}>
          {tx.description || "Unknown Transaction"}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {tx.source && `Via ${(tx.source || "").replace(/_/g, " ")}`}
        </div>
      </div>
    ),
    change: <div className="text-muted-foreground">-</div>,
    tooltipContent: (
      <>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Type</span>
          <span className="font-semibold capitalize">
            {tx.type?.replace(/_/g, " ")}
          </span>
        </div>
        {tx.source && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Source</span>
            <span className="font-semibold">
              {tx.source.replace(/_/g, " ")}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Fee</span>
          <span className="font-mono">{(tx.fee / 1e9).toFixed(6)} SOL</span>
        </div>
      </>
    ),
  };
}

// --- UI COMPONENTS ---

function TransactionRow({
  tx,
  tokenMetadata,
}: {
  tx: EnhancedTokenTransaction;
  tokenMetadata: any;
}) {
  const details = getTransactionDetails(tx, tokenMetadata);
  const copy = useCopyToClipboard();

  // Skip transactions with no meaningful data
  if (!details) return null;

  return (
    <TableRow
      key={tx.signature}
      className="text-sm hover:bg-muted/50 transition-colors"
    >
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 bg-muted rounded-full", details.color)}>
            <details.Icon size={16} className="bg-transparent" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold capitalize truncate">
              {details.type}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 max-w-0">{details.description}</TableCell>
      <TableCell className="text-right px-4 py-3">{details.change}</TableCell>
      <TableCell className="text-right px-4 py-3 w-[120px]">
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="flex flex-col gap-2 p-2.5 text-xs w-80">
              <div className="font-bold text-sm capitalize">{details.type}</div>
              <hr className="border-border" />
              {details.tooltipContent}
              <hr className="border-border" />
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Signature</span>
                <div className="flex items-center gap-1 font-mono">
                  {formatAddress(tx.signature, 8)}
                  <Copy
                    className="cursor-pointer hover:text-foreground"
                    size={14}
                    onClick={() => copy(tx.signature)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="font-mono">
                  {(tx.fee / 1e9).toFixed(9)} SOL
                </span>
              </div>
              {tx.transactionError && (
                <div className="flex items-center justify-between">
                  <span className="text-destructive">Status</span>
                  <span className="text-xs text-destructive">Failed</span>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <a
              href={`https://solscan.io/tx/${tx.signature}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} />
            </a>
          </Button>
          {tx.transactionError ? (
            <Badge variant="destructive">Failed</Badge>
          ) : (
            <Badge variant="secondary">Success</Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TransactionFeed() {
  const context = useData();

  console.log("TransactionFeed: Context state:", {
    loading: context?.loading,
    transactionCount: context?.transactions?.length || 0,
    transactions:
      context?.transactions?.map((tx) => ({
        signature: tx.signature,
        type: tx.type,
        source: tx.source,
        description: tx.description,
        tokenTransfers: tx.tokenTransfers?.length || 0,
      })) || [],
  });

  if (!context || (context.loading && !context.transactions.length)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Filter out transactions with no meaningful data
  const validTransactions = context.transactions.filter((tx) => {
    // Filter out unknown transaction types
    if (tx.type === "UNKNOWN" || !tx.type) return false;

    // Filter out transactions with no description
    if (!tx.description || tx.description.trim() === "") return false;

    // Filter out transactions with no meaningful data
    if (!tx.tokenTransfers?.length && !tx.nativeTransfers?.length) return false;

    const details = getTransactionDetails(tx, context.tokenMetadata);
    return details !== null;
  });

  const renderBody = () => {
    if (context.loading) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-96 text-center">
            <p className="text-sm text-muted-foreground">
              Loading transactions...
            </p>
          </TableCell>
        </TableRow>
      );
    }
    if (validTransactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="h-96 text-center">
            <p className="text-sm text-muted-foreground">
              Waiting for transactions...
            </p>
          </TableCell>
        </TableRow>
      );
    }
    return validTransactions.map((tx: EnhancedTokenTransaction) => (
      <TransactionRow
        key={tx.signature}
        tx={tx}
        tokenMetadata={context.tokenMetadata}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Recent Transactions
        </h2>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="rounded-lg border">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Type</TableHead>
                <TableHead className="px-4">Details</TableHead>
                <TableHead className="text-right px-4">Change</TableHead>
                <TableHead className="text-right px-4 w-[120px]">
                  Links & Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderBody()}</TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
