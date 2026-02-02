
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType.INCOME | TransactionType.EXPENSE;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  memo: string;
  categoryId?: string; // Not needed for Transfer
  accountId?: string;  // For Income/Expense
  fromAccountId?: string; // For Transfer
  toAccountId?: string;   // For Transfer
}

export interface AppData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
}
