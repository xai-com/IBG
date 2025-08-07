"use client";

import { RewardMetricsCard } from "@/components/reward-metrics";
import { TopHolders } from "@/components/top-holders";
import { TransactionFeed } from "@/components/transaction-feed";
import { Button } from "@/components/ui/button";
import { WalletLookup } from "@/components/wallet-lookup";
import { JPG_TOKEN_MINT } from "@/lib/solana";
import { Check, Copy, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useGlitch } from "react-powerglitch";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JPG_TOKEN_MINT.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { }
  };

  const glitch = useGlitch({
    playMode: "always",
    createContainers: true,
    hideOverflow: false,
    timing: {
      duration: 800,
      iterations: Infinity,
      easing: "linear",
    },
    glitchTimeSpan: {
      start: 0.1,
      end: 1,
    },
    shake: {
      velocity: 15,
      amplitudeX: 0.5,
      amplitudeY: 0.5,
    },
    slice: {
      count: 5,
      velocity: 15,
      minHeight: 0.02,
      maxHeight: 0.15,
      hueRotate: true,
    },
  });

  return (
    <main className="flex-1 bg-background text-foreground">
      {/* Fixed X Icon */}
      <Link
        href="https://x.com"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-2 right-2 z-50 p-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
      >
        <img src="/X_icon.svg" alt="X" className="h-8 w-8" />
      </Link>
      <h1 className="text-[16px] fixed top-1 left-1 z-50 p-2 text-4xl font-bold tracking-tighter text-[#6a814c]">
        <span ref={glitch.ref}>[IBG]</span>
      </h1>

      {/* Hero Section */}
      <section className="relative flex min-h-[100vh] h-full py-12 w-full flex-col items-center justify-center overflow-hidden bg-grid-white/[0.05] text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black)]"></div>
        <div className="container relative z-10 mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-4xl text-[#6a814c] font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span ref={glitch.ref}>Infinite Bags Generator</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              [IBG] rewards distributed to all holders every 60 minutes.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={"https://jup.ag/tokens/" + JPG_TOKEN_MINT.toString()}
                target="_blank"
              >
                <Button size="lg" className="w-full sm:w-auto">
                  Buy [JPG]
                </Button>
              </Link>
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <code className="text-sm font-mono break-all">
                    {JPG_TOKEN_MINT.toString()}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Lookup Section */}
          <div className="mx-auto max-w-2xl">
            <WalletLookup />
          </div>
        </div>
      </section>

      {/* Features/Metrics Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RewardMetricsCard />
        </div>
      </section>

      {/* Live Feeds Section */}
      <section className="w-full py-16 md:py-24 lg:py-32">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <TransactionFeed />
            <TopHolders />
          </div>
        </div>
      </section>
    </main>
  );
}
