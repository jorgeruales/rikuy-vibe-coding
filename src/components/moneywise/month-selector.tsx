"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateMonthOptions } from "@/lib/utils";
import { useMemo } from "react";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({
  selectedMonth,
  onMonthChange,
}: MonthSelectorProps) {
  const monthOptions = useMemo(() => generateMonthOptions(4), []);

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
