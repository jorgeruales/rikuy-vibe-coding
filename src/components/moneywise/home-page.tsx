"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency, generateMonthOptions } from "@/lib/utils";
import { format as formatDate } from "date-fns";
import type { Expense, TransactionData } from "@/lib/types";
import { IncomeModal } from "@/components/moneywise/income-modal";
import {
  ExpenseForm,
  type ExpenseFormValues,
} from "@/components/moneywise/expense-form";
import { ExpenseList } from "@/components/moneywise/expense-list";
import { MonthSelector } from "./month-selector";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Power } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { QuickExpenseForm, type QuickExpenseFormValues } from "./quick-expense-form";

const initialMonth = formatDate(new Date(), "yyyy-MM");

export default function HomePage({ userId, onLogout }: { userId: string, onLogout: () => void }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [currentMonthData, setCurrentMonthData] =
    useState<TransactionData | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Theme state (light by default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = stored ? stored === "dark" : false;
    setIsDarkMode(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Loading states for actions
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingIncome, setIsSavingIncome] = useState(false);

  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const fetchAvailableMonths = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users", userId, "transactions"));
      const dataMonths = querySnapshot.docs.map((doc) => doc.id);

      const recentMonths = generateMonthOptions(4).map((o) => o.value);
      const allMonthsSet = new Set([...dataMonths, ...recentMonths]);
      const sortedMonths = Array.from(allMonthsSet).sort((a, b) =>
        b.localeCompare(a)
      );
      setAvailableMonths(sortedMonths);
    } catch (error) {
      console.error("Error fetching available months:", error);
      // Fallback to recent months on error
      setAvailableMonths(
        generateMonthOptions(4).map((o) => o.value)
      );
    }
  }, [userId]);

  const fetchMonthData = useCallback(async (month: string) => {
    setIsLoading(true);
    const docRef = doc(db, "users", userId, "transactions", month);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentMonthData(docSnap.data() as TransactionData);
      } else {
        // If month data doesn't exist, create it.
        const initialData = { monthlyIncome: 0, expenses: [] };
        await setDoc(docRef, initialData);
        setCurrentMonthData(initialData);
      }
    } catch (error) {
      console.error("Error fetching month data:", error);
      setCurrentMonthData({ monthlyIncome: 0, expenses: [] }); // Fallback state
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAvailableMonths();
  }, [fetchAvailableMonths]);

  useEffect(() => {
    if (selectedMonth) {
      fetchMonthData(selectedMonth);
    }
  }, [selectedMonth, fetchMonthData]);

  const remainingBalance = useMemo(() => {
    if (!currentMonthData) return 0;
    return (
      currentMonthData.monthlyIncome -
      currentMonthData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    );
  }, [currentMonthData]);

  const totalExpenses = useMemo(() => {
    if (!currentMonthData) return 0;
    return currentMonthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [currentMonthData]);

  const handleSetIncome = async (income: number) => {
    if (!currentMonthData) return;
    setIsSavingIncome(true);
    const docRef = doc(db, "users", userId, "transactions", selectedMonth);
    try {
      await setDoc(docRef, { monthlyIncome: income }, { merge: true });
      setCurrentMonthData((prev) => ({
        ...(prev || { expenses: [] }),
        monthlyIncome: income,
      }));
      setIncomeModalOpen(false);
    } catch (error) {
      console.error("Error setting income:", error);
    } finally {
      setIsSavingIncome(false);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    const targetMonth = formatDate(new Date(expenseToDelete.date), "yyyy-MM");
    const docRef = doc(db, "users", userId, "transactions", targetMonth);

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentExpenses = (docSnap.data().expenses || []) as Expense[];
        const updatedExpenses = currentExpenses.filter(
          (exp) => exp.id !== expenseToDelete.id
        );
        await updateDoc(docRef, { expenses: updatedExpenses });

        if (targetMonth === selectedMonth) {
          setCurrentMonthData((prev) => ({ ...prev!, expenses: updatedExpenses }));
        }
      }
    } catch (error) {
      console.error("Error borrando gasto:", error);
    } finally {
      setExpenseToDelete(null);
    }
  };

  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleSaveExpense = async (expenseData: ExpenseFormValues) => {
    setIsSavingExpense(true);
    const targetMonth = expenseData.date.substring(0, 7);

    // Handle moving an expense to a different month during an edit
    try {
      if (
        editingExpense &&
        formatDate(new Date(editingExpense.date), "yyyy-MM") !== targetMonth
      ) {
        const originalMonth = formatDate(new Date(editingExpense.date), "yyyy-MM");
        const originalDocRef = doc(db, "users", userId, "transactions", originalMonth);
        const originalDocSnap = await getDoc(originalDocRef);
        if (originalDocSnap.exists()) {
          const originalExpenses = (
            originalDocSnap.data().expenses as Expense[]
          ).filter((exp) => exp.id !== editingExpense.id);
          await updateDoc(originalDocRef, { expenses: originalExpenses });
        }
      }

      const targetDocRef = doc(db, "users", userId, "transactions", targetMonth);
      const docSnap = await getDoc(targetDocRef);
      let currentExpenses: Expense[] =
        (docSnap.exists() && docSnap.data().expenses) || [];

      const newDateTime = `${expenseData.date} ${formatDate(new Date(), "HH:mm")}`;

      if (editingExpense) {
        const updatedExpense: Expense = {
          ...editingExpense,
          description: expenseData.description,
          amount: expenseData.amount,
          date: newDateTime,
        };

        const existingIndex = currentExpenses.findIndex(e => e.id === editingExpense.id);
        if (existingIndex !== -1) {
          currentExpenses[existingIndex] = updatedExpense;
        } else {
          currentExpenses.push(updatedExpense);
        }
      } else {
        // Add new expense
        const newExpense: Expense = {
          id: new Date().toISOString(),
          description: expenseData.description,
          amount: expenseData.amount,
          date: newDateTime,
        };
        currentExpenses.push(newExpense);
      }

      currentExpenses.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      await setDoc(targetDocRef, { expenses: currentExpenses }, { merge: true });

      if (targetMonth !== selectedMonth) {
        setSelectedMonth(targetMonth);
      } else {
        await fetchMonthData(selectedMonth);
      }
      await fetchAvailableMonths();
      handleCloseExpenseModal();
    } catch (error) {
      console.error("Error guardando gasto:", error);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const handleQuickAddExpense = (values: QuickExpenseFormValues) => {
    const today = new Date();
    handleSaveExpense({
      ...values,
      date: formatDate(today, "yyyy-MM-dd")
    });
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  if (!currentMonthData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background font-body text-foreground">
      <header className="bg-card p-2 shadow-sm border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-l font-bold text-foreground">
            Rikuy
          </h1>
          {/* Theme toggle switch */}
          <SwitchPrimitive.Root
            id="theme-toggle"
            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
          >
            <SwitchPrimitive.Thumb
              className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-4"
            />
          </SwitchPrimitive.Root>

          <div className="flex flex-row items-center gap-2">
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              availableMonths={availableMonths}
            />


            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Logout">
              <Power className="h-5 w-5" />
            </Button>

          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex items-center justify-between p-2 pt-0">
              <p className="text-xl font-bold text-blue-500 sm:text-xl">
                {formatCurrency(currentMonthData.monthlyIncome)}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIncomeModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar Ingresos</span>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xl font-bold text-red-500 sm:text-2xl">
                {formatCurrency(totalExpenses)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p
                className={`text-xl font-bold sm:text-2xl ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {formatCurrency(remainingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Separator />

          <QuickExpenseForm
            onSave={handleQuickAddExpense}
            isLoading={isSavingExpense}
          />

          <ExpenseList
            expenses={currentMonthData.expenses}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </main>

      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        onSave={handleSetIncome}
        currentIncome={currentMonthData.monthlyIncome}
        isLoading={isSavingIncome}
      />

      <Dialog
        open={isExpenseModalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCloseExpenseModal();
          } else {
            setExpenseModalOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] top-[5%] translate-y-0">
          <DialogHeader>
            <DialogTitle>
              Editar Gasto
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            onSave={handleSaveExpense}
            onClose={handleCloseExpenseModal}
            expenseToEdit={editingExpense}
            isLoading={isSavingExpense}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!expenseToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setExpenseToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              El gasto borrado desaparecerá
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExpense}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
