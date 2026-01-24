export type Expense = {
  id: string;
  description: string;
  amount: number;
};

export type TransactionData = {
  monthlyIncome: number;
  expenses: Expense[];
};
