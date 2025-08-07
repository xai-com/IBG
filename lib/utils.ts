import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTokenAmount = (
  amount: number,
  decimals: number = 9,
): string => {
  return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatJPGAmount = (amount: number): string => {
  if (amount >= 1e9) {
    return (amount / 1e9).toFixed(2) + "B";
  } else if (amount >= 1e6) {
    return (amount / 1e6).toFixed(2) + "M";
  } else if (amount >= 1e3) {
    return (amount / 1e3).toFixed(2) + "K";
  } else {
    return amount.toFixed(2);
  }
};

export const formatAddress = (address: string, chars = 4): string => {
  if (!address || address.length <= chars * 2) return address || "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
