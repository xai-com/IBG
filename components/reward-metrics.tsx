"use client";

import { getUSDValue } from "@/lib/solana";
import { formatJPGAmount } from "@/lib/utils";
import {
  BarChart,
  Clock,
  Coins,
  DollarSign,
  GitCommit,
  Percent,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useData } from "./data-provider";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Skeleton } from "./ui/skeleton";
import { Slider } from "./ui/slider";

// Helper to format JPG token amounts
const formatTokenAmount = (value: number) => {
  return formatJPGAmount(value);
};

// Helper to format USD amounts
const formatUSD = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function RewardMetricsCard() {
  const context = useData();
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Calculator state - now in JPG tokens instead of USD
  const [marketCap, setMarketCap] = useState(1000000); // 1M JPG tokens market cap
  const [lpPercent, setLpPercent] = useState(0.1);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [inputMode, setInputMode] = useState<"percentage" | "tokens">(
    "percentage",
  );
  const [tokenAmount, setTokenAmount] = useState(1000000); // 1M tokens

  // USD conversion state
  const [usdRate, setUsdRate] = useState(0);
  const [isLoadingUSD, setIsLoadingUSD] = useState(false);

  const metrics = context?.metrics;
  const tokenSymbol = context?.tokenMetadata?.symbol || "JPG";

  // Calculate total supply for percentage conversion
  const totalSupply = 100000000; // 100M total supply

  // Sync token amount and percentage when slider changes
  const handleSliderChange = (value: number[]) => {
    if (inputMode === "percentage") {
      setLpPercent(value[0]);
      // Update token amount to match
      const newTokenAmount = (value[0] / 100) * totalSupply;
      setTokenAmount(Math.round(newTokenAmount));
    } else {
      setTokenAmount(value[0]);
      // Update percentage to match
      const newPercentage = (value[0] / totalSupply) * 100;
      setLpPercent(Math.round(newPercentage * 100) / 100);
    }
  };

  // Handle input field changes
  const handleInputChange = (value: number, mode: "percentage" | "tokens") => {
    if (mode === "percentage") {
      const clampedValue = Math.max(0.01, Math.min(100, value));
      setLpPercent(clampedValue);
      // Update token amount to match
      const newTokenAmount = (clampedValue / 100) * totalSupply;
      setTokenAmount(Math.round(newTokenAmount));
    } else {
      const clampedValue = Math.max(10000, Math.min(totalSupply, value));
      setTokenAmount(clampedValue);
      // Update percentage to match
      const newPercentage = (clampedValue / totalSupply) * 100;
      setLpPercent(Math.round(newPercentage * 100) / 100);
    }
  };

  // Fetch USD conversion rate once on mount
  const fetchUSDRate = async () => {
    setIsLoadingUSD(true);
    try {
      const rate = await getUSDValue(1); // Get rate for 1 token
      setUsdRate(rate);
    } catch (error) {
      console.error("Error fetching USD rate:", error);
    } finally {
      setIsLoadingUSD(false);
    }
  };

  useEffect(() => {
    // Constants for calculation - all in JPG tokens
    const DAILY_TURNOVER_RATE = 1;
    const SWAP_FEE_RATE = 25;
    const LP_FEE_SHARE = 0.5;

    // Calculate daily volume based on market cap turnover
    const dailyVolume = marketCap * DAILY_TURNOVER_RATE;

    // Calculate fees on the daily volume
    const dailySwapFees = dailyVolume * SWAP_FEE_RATE;
    const dailyLpFees = dailySwapFees * LP_FEE_SHARE;
    const userDailyEarnings = dailyLpFees * (lpPercent / 100);

    setDailyEarnings(userDailyEarnings);
  }, [marketCap, lpPercent]);

  // Fetch USD rate once on mount
  useEffect(() => {
    fetchUSDRate();
  }, []);

  useEffect(() => {
    if (!metrics?.nextDistributionTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = metrics.nextDistributionTime - now;

      if (diff <= 0) {
        setTimeLeft("Distribution in progress...");
        // Optionally, you could trigger a refetch of metrics here
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [metrics?.nextDistributionTime]);

  return (
    <div className="space-y-12">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Tokenomics
        </h2>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
          A customizable and long-term aligned model benefiting both creators
          and liquidity providers.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: How it Works */}
        <div className="space-y-8 rounded-lg border bg-card p-6 text-card-foreground shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-4">Tokenomics Model</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start">
                <Percent className="mr-3 h-4 w-4 flex-shrink-0 text-primary" />
                <span>
                  <strong>50% of all swap fees</strong> are rewarded to the
                  token creators.
                </span>
              </li>
              <li className="flex items-start">
                <Coins className="mr-3 h-4 w-4 flex-shrink-0 text-primary" />
                <span>
                  The remaining <strong>50% of swap fees</strong> are
                  distributed to Liquidity Providers.
                </span>
              </li>
              <li className="flex items-start">
                <GitCommit className="mr-3 h-4 w-4 flex-shrink-0 text-primary" />
                <span>
                  Creators have <strong>50% ownership of the LP</strong>, locked
                  for 1 year after graduation.
                </span>
              </li>
            </ul>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Next Distribution In</span>
            </div>
            {context?.loading ? (
              <Skeleton className="h-9 w-32 mx-auto" />
            ) : (
              <div className="text-3xl font-bold font-mono">
                {timeLeft || "Calculating..."}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: LP Rewards Calculator */}
        <div className="space-y-8 rounded-lg border bg-card p-6 text-card-foreground shadow-sm lg:col-span-2">
          <h3 className="font-semibold">LP Rewards Calculator</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="marketcap">Market Cap ({tokenSymbol})</Label>
              <Input
                id="marketcap"
                type="number"
                placeholder="Enter market cap in JPG tokens"
                value={marketCap}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = parseFloat(e.target.value) || 0;
                  setMarketCap(Math.max(0, value));
                }}
                className="font-mono text-lg"
              />
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setMarketCap(1000000)}
                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded"
                >
                  1M
                </button>
                <button
                  onClick={() => setMarketCap(10000000)}
                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded"
                >
                  10M
                </button>
                <button
                  onClick={() => setMarketCap(100000000)}
                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded"
                >
                  100M
                </button>
                <button
                  onClick={() => setMarketCap(1000000000)}
                  className="px-2 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded"
                >
                  1B
                </button>
              </div>
              <div className="text-xs text-muted-foreground">
                <div>
                  Current: {formatTokenAmount(marketCap)} {tokenSymbol}
                </div>
                {isLoadingUSD ? (
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-16" />
                    <DollarSign className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>{formatUSD(marketCap * usdRate)}</span>
                    <DollarSign className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="holdings">Your Share of LP</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={inputMode === "percentage" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setInputMode("percentage");
                      // Convert current token amount to percentage when switching
                      const newPercentage = (tokenAmount / totalSupply) * 100;
                      setLpPercent(Math.round(newPercentage * 100) / 100);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <Percent className="h-3 w-3 mr-1" />%
                  </Button>
                  <Button
                    variant={inputMode === "tokens" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setInputMode("tokens");
                      // Convert current percentage to token amount when switching
                      const newTokenAmount = (lpPercent / 100) * totalSupply;
                      setTokenAmount(Math.round(newTokenAmount));
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {tokenSymbol}
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      id="holdings"
                      min={inputMode === "percentage" ? 0.01 : 10000}
                      max={inputMode === "percentage" ? 100 : totalSupply}
                      step={inputMode === "percentage" ? 0.01 : 10000}
                      value={
                        inputMode === "percentage" ? [lpPercent] : [tokenAmount]
                      }
                      onValueChange={handleSliderChange}
                      className="w-full"
                    />
                  </div>
                  <div className="min-w-[80px] text-right">
                    <Input
                      type="number"
                      value={
                        inputMode === "percentage"
                          ? lpPercent.toFixed(2)
                          : tokenAmount
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleInputChange(value, inputMode);
                      }}
                      className="font-mono text-sm h-8 w-20 text-center"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {inputMode === "percentage" ? "%" : tokenSymbol}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{inputMode === "percentage" ? "0.01%" : "10K"}</span>
                  <span>{inputMode === "percentage" ? "50%" : "50M"}</span>
                  <span>{inputMode === "percentage" ? "100%" : "100M"}</span>
                </div>
                {isLoadingUSD ? (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Skeleton className="h-3 w-20" />
                    <DollarSign className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <span>{formatUSD(tokenAmount * usdRate)}</span>
                    <DollarSign className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-6 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-muted-foreground flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Your Projected Daily Earnings:
              </span>
              <div className="text-right">
                <div className="font-bold text-primary text-2xl font-mono">
                  {formatTokenAmount(dailyEarnings)} {tokenSymbol}
                </div>
                {isLoadingUSD ? (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-16" />
                    <DollarSign className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <span>{formatUSD(dailyEarnings * usdRate)}</span>
                    <DollarSign className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            * Calculations are estimates. Assumes 5% daily market cap turnover,
            0.3% swap fee, with 50% of fees distributed to LPs. All amounts in{" "}
            {tokenSymbol} tokens. USD values are real-time conversions via
            Jupiter API.
          </p>
        </div>
      </div>
    </div>
  );
}
