"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonthForDisplay } from "@/lib/utils";
import { useMemo } from "react";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  availableMonths,
}: MonthSelectorProps) {
  const monthOptions = useMemo(() => {
    return availableMonths.map((month) => ({
      value: month,
      label: formatMonthForDisplay(month),
    }));
  }, [availableMonths]);

  return (
    <Select value={selectedMonth} onValueChange={onMonthChange}>
      <SelectTrigger className="w-[180px] sm:w-[200px]">
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        {monthOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
