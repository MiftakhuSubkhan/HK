import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CustomerSuggestion, DebtRecord, PaymentLog } from '../types';

const LOCAL_STORAGE_DEBTS_KEY = 'catatan_debts_local_v1';
const LOCAL_STORAGE_CUSTOMERS_KEY = 'catatan_customers_local_v1';

function mapRowToDebt(row: any): DebtRecord {
  return {
    id: row.id,
    customerName: row.customer_name,
    village: row.village || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '/images/cow-avatar-1.jpg',
    feedItems: row.feed_items || [],
    totalAmount: Number(row.total_amount) || 0,
    originalAmount: Number(row.original_amount) || Number(row.total_amount) || 0,
    status: row.status,
    dueDateLabel: row.due_date_label || '',
    startDate: row.start_date || (row.created_at ? row.created_at.split('T')[0] : undefined),
    dueDate: row.due_date || undefined,
    notes: row.notes || undefined,
    photoUrl: row.photo_url || undefined,
    paymentHistory: row.payment_history || [],
    createdAt: row.created_at,
    paidAt: row.paid_at || undefined,
  };
}

function mapDebtToRow(debt: DebtRecord) {
  const createdAtIso =
    debt.createdAt ||
    (debt.startDate ? new Date(debt.startDate + 'T00:00:00.000Z').toISOString() : new Date().toISOString());

  return {
    id: debt.id,
    customer_name: debt.customerName,
    village: debt.village,
    phone: debt.phone,
    avatar_url: debt.avatarUrl,
    feed_items: debt.feedItems || [],
    total_amount: debt.totalAmount,
    original_amount: debt.originalAmount || debt.totalAmount,
    status: debt.status,
    due_date_label: debt.dueDateLabel,
    start_date: debt.startDate || null,
    due_date: debt.dueDate || null,
    notes: debt.notes || null,
    photo_url: debt.photoUrl || null,
    payment_history: debt.paymentHistory || [],
    created_at: createdAtIso,
    paid_at: debt.paidAt || null,
  };
}

export const debtService = {
  async getDebts(): Promise<DebtRecord[]> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        if (local) {
          try {
            return JSON.parse(local);
          } catch {
            return [];
          }
        }
      }
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching debts from Supabase:', error);
        return [];
      }

      return (data || []).map(mapRowToDebt);
    } catch (err) {
      console.error('Supabase getDebts exception:', err);
      return [];
    }
  },

  async upsertDebt(debt: DebtRecord): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        let list: DebtRecord[] = local ? JSON.parse(local) : [];
        const idx = list.findIndex((d) => d.id === debt.id);
        if (idx >= 0) {
          list[idx] = debt;
        } else {
          list = [debt, ...list];
        }
        localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(list));
      }
      return true;
    }

    try {
      const row = mapDebtToRow(debt);
      const { error } = await supabase.from('debts').upsert(row);
      if (error) {
        if (error.code === '42703' || error.message?.includes('start_date') || error.message?.includes('photo_url')) {
          const rowSafe = { ...row };
          if (error.message?.includes('photo_url') || error.code === '42703') {
            delete (rowSafe as any).photo_url;
          }
          if (error.message?.includes('start_date')) {
            delete (rowSafe as any).start_date;
          }
          const { error: retryError } = await supabase.from('debts').upsert(rowSafe);
          if (retryError) {
            console.error('Error upserting debt to Supabase (retry):', retryError);
            return false;
          }
          return true;
        }
        console.error('Error upserting debt to Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertDebt exception:', err);
      return false;
    }
  },

  async markAsPaid(
    debtId: string,
    paidAt: string,
    newHistory?: PaymentLog[],
    originalAmount?: number
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        if (local) {
          const list: DebtRecord[] = JSON.parse(local);
          const updated = list.map((d) =>
            d.id === debtId
              ? {
                  ...d,
                  status: 'paid' as const,
                  dueDateLabel: 'Lunas',
                  paidAt,
                  totalAmount: 0,
                  paymentHistory: newHistory || d.paymentHistory || [],
                }
              : d
          );
          localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(updated));
        }
      }
      return true;
    }

    try {
      const updatePayload: any = {
        status: 'paid',
        due_date_label: 'Lunas',
        paid_at: paidAt,
        total_amount: 0,
      };
      if (newHistory) {
        updatePayload.payment_history = newHistory;
      }
      if (originalAmount) {
        updatePayload.original_amount = originalAmount;
      }

      const { error } = await supabase
        .from('debts')
        .update(updatePayload)
        .eq('id', debtId);

      if (error) {
        console.error('Error marking debt as paid in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase markAsPaid exception:', err);
      return false;
    }
  },

  async undoPaid(
    debtId: string,
    restoredStatus: DebtRecord['status'],
    restoredLabel: string,
    restoredTotal?: number,
    restoredHistory?: PaymentLog[]
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        if (local) {
          const list: DebtRecord[] = JSON.parse(local);
          const updated = list.map((d) =>
            d.id === debtId
              ? {
                  ...d,
                  status: restoredStatus,
                  dueDateLabel: restoredLabel,
                  paidAt: undefined,
                  totalAmount: restoredTotal !== undefined ? restoredTotal : d.totalAmount,
                  paymentHistory: restoredHistory !== undefined ? restoredHistory : d.paymentHistory,
                }
              : d
          );
          localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(updated));
        }
      }
      return true;
    }

    try {
      const updatePayload: any = {
        status: restoredStatus,
        due_date_label: restoredLabel,
        paid_at: null,
      };
      if (restoredTotal !== undefined) {
        updatePayload.total_amount = restoredTotal;
      }
      if (restoredHistory !== undefined) {
        updatePayload.payment_history = restoredHistory;
      }

      const { error } = await supabase
        .from('debts')
        .update(updatePayload)
        .eq('id', debtId);

      if (error) {
        console.error('Error undoing debt paid in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase undoPaid exception:', err);
      return false;
    }
  },

  async addPartialPayment(
    debtId: string,
    newTotal: number,
    isPaid: boolean,
    newHistory: PaymentLog[]
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        if (local) {
          const list: DebtRecord[] = JSON.parse(local);
          const updated = list.map((d) => {
            if (d.id === debtId) {
              return {
                ...d,
                totalAmount: newTotal,
                status: isPaid ? ('paid' as const) : d.status,
                dueDateLabel: isPaid ? 'Lunas' : d.dueDateLabel,
                paymentHistory: newHistory,
              };
            }
            return d;
          });
          localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(updated));
        }
      }
      return true;
    }

    try {
      const updateData: any = {
        total_amount: newTotal,
        payment_history: newHistory,
      };
      if (isPaid) {
        updateData.status = 'paid';
        updateData.due_date_label = 'Lunas';
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('debts')
        .update(updateData)
        .eq('id', debtId);

      if (error) {
        console.error('Error updating partial payment in Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase addPartialPayment exception:', err);
      return false;
    }
  },

  async getCustomers(): Promise<CustomerSuggestion[]> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY);
        if (local) {
          try {
            return JSON.parse(local);
          } catch {
            return [];
          }
        }
      }
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching customers from Supabase:', error);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        village: row.village || '',
        phone: row.phone || '',
      }));
    } catch (err) {
      console.error('Supabase getCustomers exception:', err);
      return [];
    }
  },

  async upsertCustomer(customer: CustomerSuggestion): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY);
        let list: CustomerSuggestion[] = local ? JSON.parse(local) : [];
        const idx = list.findIndex((c) => c.id === customer.id || c.name.toLowerCase() === customer.name.toLowerCase());
        if (idx >= 0) {
          list[idx] = customer;
        } else {
          list = [customer, ...list];
        }
        localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(list));
      }
      return true;
    }

    try {
      const { error } = await supabase.from('customers').upsert({
        id: customer.id,
        name: customer.name,
        village: customer.village,
        phone: customer.phone,
      });

      if (error) {
        console.error('Error upserting customer to Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertCustomer exception:', err);
      return false;
    }
  },

  async deleteCustomer(customerId: string, customerName?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const localCust = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY);
        if (localCust) {
          const list: CustomerSuggestion[] = JSON.parse(localCust);
          const filtered = list.filter((c) => c.id !== customerId && (customerName ? c.name.toLowerCase() !== customerName.toLowerCase() : true));
          localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(filtered));
        }
        if (customerName) {
          const localDebts = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
          if (localDebts) {
            const debtsList: DebtRecord[] = JSON.parse(localDebts);
            const filteredDebts = debtsList.filter((d) => d.customerName.toLowerCase() !== customerName.toLowerCase());
            localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(filteredDebts));
          }
        }
      }
      return true;
    }

    try {
      const { error } = await supabase.from('customers').delete().eq('id', customerId);
      if (error) {
        console.error('Error deleting customer from Supabase:', error);
        return false;
      }

      if (customerName) {
        await supabase.from('debts').delete().ilike('customer_name', customerName);
      }
      return true;
    } catch (err) {
      console.error('Supabase deleteCustomer exception:', err);
      return false;
    }
  },

  async deleteDebt(debtId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem(LOCAL_STORAGE_DEBTS_KEY);
        if (local) {
          const list: DebtRecord[] = JSON.parse(local);
          const filtered = list.filter((d) => d.id !== debtId);
          localStorage.setItem(LOCAL_STORAGE_DEBTS_KEY, JSON.stringify(filtered));
        }
      }
      return true;
    }

    try {
      const { error } = await supabase.from('debts').delete().eq('id', debtId);
      if (error) {
        console.error('Error deleting debt from Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase deleteDebt exception:', err);
      return false;
    }
  },

  subscribe(onDebtsChange: () => void, onCustomersChange: () => void) {
    if (!isSupabaseConfigured()) {
      return () => {};
    }

    const channel = supabase
      .channel('table-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'debts' },
        () => onDebtsChange()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => onCustomersChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
