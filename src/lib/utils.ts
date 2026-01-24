import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateMonthOptions(
  count: number
): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = subMonths(now, i);
    const value = format(date, "yyyy-MM");
    const rawLabel = format(date, "MMMM - yyyy", { locale: es });
    const label = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);
    options.push({ value, label });
  }
  return options;
}
