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
import { format as formatDate } from "date-fns";
import type { AllTransactions, Expense } from "@/lib/types";
import { IncomeModal } from "@/components/moneywise/income-modal";
import {
  ExpenseForm,
  type ExpenseFormValues,
} from "@/components/moneywise/expense-form";
import { ExpenseList } from "@/components/moneywise/expense-list";
import { MonthSelector } from "./month-selector";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "moneywise_data";
const initialMonth = formatDate(new Date(), "yyyy-MM");

export default function HomePage() {
  const [allData, setAllData] = useState<AllTransactions>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [isClient, setIsClient] = useState(false);

  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setAllData(JSON.parse(storedData));
      } else {
        // Initialize for current month if no data exists
        setAllData({ [initialMonth]: { monthlyIncome: 0, expenses: [] } });
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      setAllData({ [initialMonth]: { monthlyIncome: 0, expenses: [] } });
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    }
  }, [allData, isClient]);

  const currentData = useMemo(() => {
    return allData[selectedMonth] || { monthlyIncome: 0, expenses: [] };
  }, [allData, selectedMonth]);

  const remainingBalance = useMemo(() => {
    return (
      currentData.monthlyIncome -
      currentData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
  }, [currentData]);

  const totalExpenses = useMemo(() => {
    return currentData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [currentData.expenses]);

  const handleSetIncome = (income: number) => {
    setAllData((prev) => ({
      ...prev,
      [selectedMonth]: {
        ...(prev[selectedMonth] || { expenses: [] }),
        monthlyIncome: income,
      },
    }));
  };

  const handleAddExpense = (expenseData: ExpenseFormValues) => {
    const newExpense: Expense = {
      id: new Date().toISOString(),
      ...expenseData,
    };
    setAllData((prev) => {
      const monthData = prev[selectedMonth] || {
        monthlyIncome: 0,
        expenses: [],
      };
      return {
        ...prev,
        [selectedMonth]: {
          ...monthData,
          expenses: [newExpense, ...monthData.expenses],
        },
      };
    });
  };

  const handleMonthChange = (month: string) => {
    if (!allData[month]) {
      setAllData((prev) => ({
        ...prev,
        [month]: { monthlyIncome: 0, expenses: [] },
      }));
    }
    setSelectedMonth(month);
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
      <header className="bg-card p-4 shadow-sm border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">
            Gastos Flia Ruales Sanango
          </h1>
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
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
              <p className="text-xl font-bold text-green-600 sm:text-2xl">
                {formatCurrency(currentData.monthlyIncome)}
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
          <Card className="border-primary/40 bg-primary/10">
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

        <div className="space-y-3">
          <h2 className="text-xl font-bold">Gastos</h2>
          <Separator />
          <ExpenseList expenses={currentData.expenses} />
        </div>
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
        currentIncome={currentData.monthlyIncome}
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
