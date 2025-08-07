"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  getAddressTransactionHistory,
  getWalletInfo,
  WalletInfo,
} from "@/lib/solana";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import {
  Activity,
  Award,
  Copy,
  Crown,
  ExternalLink,
  HelpCircle,
  History,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useData } from "./data-provider";
import { Skeleton } from "./ui/skeleton";

// Helper function for copying to clipboard
const useCopyToClipboard = () => {
  return (text: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    }
  };
};

// Clickable address component matching the main transaction feed
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

export function WalletLookup() {
  const context = useData();
  const [address, setAddress] = useState("");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const tokenSymbol = context?.tokenMetadata?.symbol || "JPG";
  const tokenDecimals = context?.tokenMetadata?.decimals || 9;
  const copy = useCopyToClipboard();

  const handleLookup = async () => {
    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    setError("");
    setIsOpen(true);
    setLoading(true);

    try {
      const info = await getWalletInfo(address.trim());
      setWalletInfo(info);

      if (!info) {
        setError(`Wallet not found or has no ${tokenSymbol} tokens`);
      } else {
        // Fetch transaction history for this wallet
        const txHistory = await getAddressTransactionHistory(
          address.trim(),
          10,
        );
        setTransactions(txHistory);
      }
    } catch (err) {
      setError(
        "Error looking up wallet. Please check the address and try again.",
      );
      console.error("Wallet lookup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLookup();
    }
  };

  const openSolscan = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, "_blank");
  };

  const openTransaction = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, "_blank");
  };

  // Filter valid transactions (matching main transaction feed logic)
  const validTransactions = transactions.filter((tx) => {
    if (tx.type === "UNKNOWN" || !tx.type) return false;
    if (!tx.description || tx.description.trim() === "") return false;
    if (!tx.tokenTransfers?.length && !tx.nativeTransfers?.length) return false;
    return true;
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setWalletInfo(null);
      setTransactions([]);
      setError("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Always Visible Search Section */}
      <div className="space-y-2">
        <Label htmlFor="wallet-address" className="text-sm font-medium">
          Wallet Lookup
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="wallet-address"
            placeholder="Enter Solana wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="font-mono"
          />
          <Button
            onClick={handleLookup}
            disabled={loading || !address.trim()}
            size="sm"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Results Dialog */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
            {loading ? (
              /* Loading State */
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-muted/30 rounded-lg space-y-3"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </div>
              </div>
            ) : walletInfo ? (
              /* Wallet Information - Super Clean Compact Luxury Design */
              <div className="space-y-6">
                {/* Header with Wallet Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {formatAddress(walletInfo.address, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground font-mono truncate">
                        {walletInfo.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {walletInfo.rank && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {walletInfo.isTopHolder && (
                          <Crown className="h-3 w-3" />
                        )}
                        #{walletInfo.rank}
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openSolscan(walletInfo.address)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Solscan
                    </Button>
                  </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Balance */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Balance
                      </span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-secondary mb-1">
                      {formatTokenAmount(walletInfo.balance)} {tokenSymbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {walletInfo.percentage.toFixed(6)}% of supply
                    </div>
                  </div>

                  {/* Activity */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Activity
                      </span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-secondary mb-1">
                      {walletInfo.totalTransactions}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTokenAmount(walletInfo.totalVolume)} {tokenSymbol}{" "}
                      volume
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-secondary" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Daily Rewards
                      </span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-secondary mb-1">
                      {formatTokenAmount(walletInfo.expectedDailyRewards)}{" "}
                      {tokenSymbol}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      LP rewards estimate
                    </div>
                  </div>
                </div>

                {/* Token Accounts (if any) */}
                {walletInfo.tokenAccounts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Token Accounts ({walletInfo.tokenAccounts.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {walletInfo.tokenAccounts.map((account, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                        >
                          <div className="space-y-1">
                            <div className="font-mono text-sm">
                              {formatAddress(account.address)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatTokenAmount(account.balance)} {tokenSymbol}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openSolscan(account.address)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transactions Table - Compact Professional */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        Recent {tokenSymbol} Transactions
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {validTransactions.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border">
                    <ScrollArea className="h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="px-3 py-2 text-xs">
                              Type
                            </TableHead>
                            <TableHead className="px-3 py-2 text-xs">
                              Details
                            </TableHead>
                            <TableHead className="text-right px-3 py-2 text-xs">
                              Amount
                            </TableHead>
                            <TableHead className="text-right px-3 py-2 text-xs w-[100px]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validTransactions.length > 0 ? (
                            validTransactions.map((tx) => {
                              const jpgTransfer = tx.tokenTransfers?.find(
                                (t: any) =>
                                  t.mint ===
                                  "CCbLwPVBtd2bi8dd8y6kyFGoqsYh1BjF2RP6gTCQjups",
                              );
                              const amount = jpgTransfer
                                ? Math.abs(jpgTransfer.tokenAmount)
                                : 0;

                              return (
                                <TableRow
                                  key={tx.signature}
                                  className="text-xs hover:bg-muted/50 transition-colors"
                                >
                                  <TableCell className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1 bg-muted rounded-full">
                                        <Activity
                                          size={12}
                                          className="text-blue-600"
                                        />
                                      </div>
                                      <span className="font-medium capitalize">
                                        {tx.type || "Transaction"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-3 py-2 max-w-0">
                                    <div className="space-y-1 max-w-[200px]">
                                      <div
                                        className="font-medium truncate"
                                        title={tx.description}
                                      >
                                        {tx.description}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        By{" "}
                                        <ClickableAddress address={tx.feePayer}>
                                          {formatAddress(tx.feePayer, 6)}
                                        </ClickableAddress>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right px-3 py-2">
                                    {amount > 0 && (
                                      <span className="font-semibold">
                                        {formatTokenAmount(amount)}{" "}
                                        {tokenSymbol}
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right px-3 py-2 w-[100px]">
                                    <div className="flex items-center justify-end gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="flex flex-col gap-2 p-2 text-xs w-72">
                                          <div className="font-bold text-sm capitalize">
                                            {tx.type || "Transaction"}
                                          </div>
                                          <hr className="border-border" />
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                              User
                                            </span>
                                            <ClickableAddress
                                              address={tx.feePayer}
                                            >
                                              {formatAddress(tx.feePayer, 8)}
                                            </ClickableAddress>
                                          </div>
                                          {amount > 0 && (
                                            <div className="flex items-center justify-between">
                                              <span className="text-muted-foreground">
                                                Amount
                                              </span>
                                              <span className="font-mono">
                                                {formatTokenAmount(amount)}{" "}
                                                {tokenSymbol}
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">
                                              Fee
                                            </span>
                                            <span className="font-mono">
                                              {(tx.fee / 1e9).toFixed(6)} SOL
                                            </span>
                                          </div>
                                          <hr className="border-border" />
                                          <div className="flex items-center justify-between gap-4">
                                            <span className="text-muted-foreground">
                                              Signature
                                            </span>
                                            <div className="flex items-center gap-1 font-mono">
                                              {formatAddress(tx.signature, 8)}
                                              <Copy
                                                className="cursor-pointer hover:text-foreground"
                                                size={12}
                                                onClick={() =>
                                                  copy(tx.signature)
                                                }
                                              />
                                            </div>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="h-6 w-6"
                                      >
                                        <a
                                          href={`https://solscan.io/tx/${tx.signature}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink size={12} />
                                        </a>
                                      </Button>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Success
                                      </Badge>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="h-64 text-center"
                              >
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                  <Activity className="h-6 w-6 mb-2 opacity-50" />
                                  <p className="text-sm">
                                    No {tokenSymbol} transactions found
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 bg-destructive/10 rounded-full mb-4">
                  <Wallet className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Wallet Not Found</h3>
                <p className="text-muted-foreground max-w-md">{error}</p>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
