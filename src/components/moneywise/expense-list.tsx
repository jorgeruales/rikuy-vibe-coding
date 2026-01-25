"use client";

import type { Expense } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  ShoppingBag,
  Utensils,
  Zap,
  Bus,
  Edit,
  Trash2,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  food: <Utensils className="h-6 w-6 text-muted-foreground" />,
  shopping: <ShoppingBag className="h-6 w-6 text-muted-foreground" />,
  utilities: <Zap className="h-6 w-6 text-muted-foreground" />,
  transport: <Bus className="h-6 w-6 text-muted-foreground" />,
  default: <CreditCard className="h-6 w-6 text-muted-foreground" />,
};

const getIconForDescription = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (
    lowerDesc.includes("food") ||
    lowerDesc.includes("coffee") ||
    lowerDesc.includes("restaurant") ||
    lowerDesc.includes("grocer")
  )
    return categoryIcons.food;
  if (lowerDesc.includes("shop") || lowerDesc.includes("store"))
    return categoryIcons.shopping;
  if (lowerDesc.includes("bill") || lowerDesc.includes("rent"))
    return categoryIcons.utilities;
  if (
    lowerDesc.includes("bus") ||
    lowerDesc.includes("taxi") ||
    lowerDesc.includes("transport")
  )
    return categoryIcons.transport;
  return categoryIcons.default;
};

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/50 p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">No hay gastos registrados!</p>
        <p className="mt-2 text-sm">Click en '+' para agregar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id} className="transition-all hover:shadow-md">
          <CardContent className="flex items-center justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-secondary p-1">
                {getIconForDescription(expense.description)}
              </div>
              <div>
                <p className="font-semibold capitalize">{expense.description}</p>
                <p className="text-sm text-muted-foreground">{expense.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-destructive">
                -{formatCurrency(expense.amount)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(expense)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar Gasto</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(expense)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Borrar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
