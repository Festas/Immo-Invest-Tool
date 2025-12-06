import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Calculate market value discount information
 * Returns null if no valid discount (marketValue not provided or not higher than purchasePrice)
 */
export function calculateMarketValueDiscount(
  purchasePrice: number,
  marketValue?: number
): { discountAmount: number; discountPercent: number } | null {
  if (!marketValue || marketValue <= 0 || marketValue <= purchasePrice) {
    return null;
  }

  const discountAmount = marketValue - purchasePrice;
  const discountPercent = (discountAmount / marketValue) * 100;

  return { discountAmount, discountPercent };
}
