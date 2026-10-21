export type FeedProduct = 'Bran Daun' | 'Polar' | 'Pelet';

export interface CustomerSuggestion {
  id: string;
  name: string;
  village: string;
  phone: string;
}

export interface FeedItem {
  type: FeedProduct;
  bags: number;
}

export type DebtStatus = 'due_2_days' | 'due_5_days' | 'safe' | 'paid';

export interface PaymentLog {
  id: string;
  amount: number;
  paidAt: string;
  note?: string;
}

export interface DebtRecord {
  id: string;
  customerName: string;
  village: string;
  phone: string;
  avatarUrl: string;
  feedItems?: FeedItem[];
  totalAmount: number;
  originalAmount?: number;
  status: DebtStatus;
  dueDateLabel: string;
  startDate?: string; // Format YYYY-MM-DD (Tanggal Mulai Piutang / Transaksi)
  dueDate?: string; // Format YYYY-MM-DD (Tanggal Jatuh Tempo)
  notes?: string;
  photoUrl?: string; // Base64 / URL foto bukti transaksi / nota
  paymentHistory?: PaymentLog[];
  createdAt?: string;
  paidAt?: string;
}

export interface SummaryStats {
  totalActiveDebt: number;
  activeCustomersCount: number;
  dueThisWeekAmount: number;
  dueThisWeekCustomersCount: number;
  totalPaidAmount: number;
  paidCustomersCount: number;
}
