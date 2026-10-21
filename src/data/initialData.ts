import { CustomerSuggestion, DebtRecord, SummaryStats } from '../types';

export const INITIAL_CUSTOMERS: CustomerSuggestion[] = [];

export const INITIAL_DEBTS: DebtRecord[] = [];

export const INITIAL_STATS: SummaryStats = {
  totalActiveDebt: 0,
  activeCustomersCount: 0,
  dueThisWeekAmount: 0,
  dueThisWeekCustomersCount: 0,
  totalPaidAmount: 0,
  paidCustomersCount: 0,
};

export const PRODUCT_PRICES: Record<string, number> = {
  'Bran Daun': 350000,
  'Polar': 380000,
  'Pelet': 420000,
};
