"use client";

import { TopHolder } from "@/lib/solana";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
import Link from "next/link";
import { useData } from "./data-provider";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function TopHolders() {
  const context = useData();
  const tokenDecimals = context?.tokenMetadata?.decimals || 9;
  const tokenSymbol = context?.tokenMetadata?.symbol || "JPG";

  if (!context || (context.loading && !context.holders.length)) {
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

  const { holders } = context;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Top Holders</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{holders.length} holders</Badge>
        </div>
      </div>
      <div className="rounded-lg border">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-right">
                  % of Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holders.map((holder: TopHolder, index: number) => (
                <TableRow key={holder.address}>
                  <TableCell className="w-[50px] font-medium">
                    <Badge variant="secondary">{index + 1}</Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://solscan.io/account/${holder.address}?cluster=mainnet-beta`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-primary hover:underline"
                    >
                      {formatAddress(holder.address)}
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatTokenAmount(holder.amount, tokenDecimals)}{" "}
                    {tokenSymbol}
                  </TableCell>
                  <TableCell className="w-[100px] text-right">
                    <Badge variant="outline">
                      {holder.percentage.toFixed(4)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
