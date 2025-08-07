import { DataProvider } from "@/components/data-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "[IBG] - Infinite Bags Generator",
  description:
    "[IBG] rewards distributed to all holders every 60 minutes. Earn rewards just by holding.",
  openGraph: {
    title: "[IBG] - Infinite Bags Generator",
    description: "[IBG] rewards distributed to all holders every 60 minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "[IBG] - Infinite Bags Generator",
    description: "[IBG] rewards distributed to all holders every 60 minutes.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <DataProvider>
            <TooltipProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
              </div>
            </TooltipProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
