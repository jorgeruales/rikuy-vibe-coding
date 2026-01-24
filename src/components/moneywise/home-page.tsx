"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TransactionData, Expense } from "@/lib/types";
import { IncomeModal } from "@/components/moneywise/income-modal";
import {
  ExpenseForm,
  type ExpenseFormValues,
} from "@/components/moneywise/expense-form";
import { ExpenseList } from "@/components/moneywise/expense-list";

const STORAGE_KEY = "moneywise_data";

export default function HomePage() {
  const [data, setData] = useState<TransactionData>({
    monthlyIncome: 0,
    expenses: [],
  });
  const [isClient, setIsClient] = useState(false);

  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isClient]);

  const remainingBalance = useMemo(() => {
    return (
      data.monthlyIncome -
      data.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
  }, [data]);

  const totalExpenses = useMemo(() => {
    return data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [data.expenses]);

  const handleSetIncome = (income: number) => {
    setData((prev) => ({ ...prev, monthlyIncome: income }));
  };

  const handleAddExpense = (expenseData: ExpenseFormValues) => {
    const newExpense: Expense = {
      id: new Date().toISOString(),
      ...expenseData,
    };
    setData((prev) => ({ ...prev, expenses: [newExpense, ...prev.expenses] }));
  };

  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background font-body text-foreground">
      <header
        className="p-4 shadow-sm"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Gastos Flia Ruales Sanango</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Income
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between p-4 pt-0">
              <p
                className="text-xl font-bold text-green-600 sm:text-2xl"
              >
                {formatCurrency(data.monthlyIncome)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIncomeModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Income</span>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-destructive sm:text-2xl">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">
                Remaining Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p
                className={`text-xl font-bold sm:text-2xl ${
                  remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(remainingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        <ExpenseList expenses={data.expenses} />
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setExpenseModalOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Expense</span>
        </Button>
      </div>

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSetIncome}
        currentIncome={data.monthlyIncome}
      />

      <Dialog open={isExpenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSave={handleAddExpense}
            onClose={() => setExpenseModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
