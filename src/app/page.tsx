'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import PhoneMockup from '../components/PhoneMockup';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import TransactionForm from '../components/TransactionForm';
import DebtList from '../components/DebtList';
import BottomNav, { NavTab } from '../components/BottomNav';
import Toast, { ToastMessage } from '../components/Toast';
import { NotificationModal, CustomerDetailModal, PartialPaymentModal } from '../components/Modals';
import { CustomersView, TransactionsView } from '../components/OtherViews';
import { INITIAL_CUSTOMERS, INITIAL_DEBTS, INITIAL_STATS } from '../data/initialData';
import { CustomerSuggestion, DebtRecord, PaymentLog, SummaryStats } from '../types';
import { debtService } from '../services/debtService';
import { isSupabaseConfigured } from '../lib/supabase';
import { X, ShieldCheck, History, Cloud, HardDrive, Download, Activity } from 'lucide-react';
import {
  getDaysDifferenceFromToday,
  calculateDebtStatus,
  formatIndonesianDate,
} from '../utils/date';

export default function Home() {
  const [debts, setDebts] = useState<DebtRecord[]>(INITIAL_DEBTS);
  const [stats, setStats] = useState<SummaryStats>(INITIAL_STATS);
  const [customers, setCustomers] = useState<CustomerSuggestion[]>(INITIAL_CUSTOMERS);
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [viewMode, setViewMode] = useState<'tablet' | 'phone'>('tablet');

  const [isCloudEnabled, setIsCloudEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedDebtDetail, setSelectedDebtDetail] = useState<DebtRecord | null>(null);
  const [partialPaymentDebt, setPartialPaymentDebt] = useState<DebtRecord | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0d5c3a', '#10b981', '#34d399', '#f59e0b', '#22c55e'],
      });
    } catch {
    }
  };

  const showToast = (type: 'success' | 'warning' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3800);
  };

  const calculateStats = useCallback((debtsList: DebtRecord[]): SummaryStats => {
    const activeDebts = debtsList.filter((d) => d.status !== 'paid');
    const dueThisWeek = activeDebts.filter((d) => d.status === 'due_2_days' || d.status === 'due_5_days');
    const paidDebts = debtsList.filter((d) => d.status === 'paid');

    const totalPaidFromHistory = debtsList.reduce((sum, d) => {
      const historySum = (d.paymentHistory || []).reduce((hSum, p) => hSum + p.amount, 0);

      if (d.status === 'paid') {
        // Jika sudah berstatus lunas, uang pelunasan adalah akumulasi cicilan
        // atau minimal senilai total awal transaksi jika pelunasan langsung
        const fullDebtAmount = d.originalAmount || d.totalAmount || 0;
        return sum + Math.max(historySum, fullDebtAmount);
      } else {
        // Jika transaksi masih berjalan, yang dihitung sebagai uang masuk adalah cicilan yang sudah dibayarkan
        return sum + historySum;
      }
    }, 0);

    return {
      totalActiveDebt: activeDebts.reduce((sum, d) => sum + d.totalAmount, 0),
      activeCustomersCount: activeDebts.length,
      dueThisWeekAmount: dueThisWeek.reduce((sum, d) => sum + d.totalAmount, 0),
      dueThisWeekCustomersCount: dueThisWeek.length,
      totalPaidAmount: totalPaidFromHistory,
      paidCustomersCount: paidDebts.length,
    };
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      const [fetchedDebts, fetchedCustomers] = await Promise.all([
        debtService.getDebts(),
        debtService.getCustomers(),
      ]);
      setDebts(fetchedDebts);
      setCustomers(fetchedCustomers);
      setStats(calculateStats(fetchedDebts));
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    setIsCloudEnabled(isSupabaseConfigured());
    loadInitialData();

    const unsubscribe = debtService.subscribe(
      () => {
        debtService.getDebts().then((d) => {
          setDebts(d);
          setStats(calculateStats(d));
        });
      },
      () => {
        debtService.getCustomers().then(setCustomers);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadInitialData, calculateStats]);

  const handleMarkAsPaid = async (debtId: string) => {
    const target = debts.find((d) => d.id === debtId);
    if (!target || target.status === 'paid') return;

    const paidAt = new Date().toISOString();
    const remainingToPay = target.totalAmount;
    const originalDebtAmount = target.originalAmount || remainingToPay;

    // Catat pelunasan langsung ke paymentHistory agar saldo Lunas dan riwayat pembayaran sinkron
    let updatedHistory = target.paymentHistory || [];
    if (remainingToPay > 0) {
      const fullPaymentLog: PaymentLog = {
        id: 'pay-' + Date.now(),
        amount: remainingToPay,
        paidAt,
        note: 'Pelunasan langsung',
      };
      updatedHistory = [fullPaymentLog, ...updatedHistory];
    }

    const updated = debts.map((item) => {
      if (item.id === debtId) {
        return {
          ...item,
          totalAmount: 0,
          originalAmount: originalDebtAmount,
          status: 'paid' as const,
          dueDateLabel: 'Lunas',
          paidAt,
          paymentHistory: updatedHistory,
        };
      }
      return item;
    });

    setDebts(updated);
    setStats(calculateStats(updated));

    await debtService.markAsPaid(debtId, paidAt, updatedHistory, originalDebtAmount);

    triggerConfetti();
    showToast(
      'success',
      'Piutang Berhasil Ditandai Lunas!',
      `${target.customerName} sebesar Rp ${remainingToPay.toLocaleString('id-ID')} telah lunas.`
    );
  };

  const handleUndoPaid = async (debtId: string) => {
    const target = debts.find((d) => d.id === debtId);
    if (!target || target.status !== 'paid') return;

    let originalStatus: DebtRecord['status'] = 'safe';
    let originalLabel = 'Aman (Belum Jatuh Tempo)';
    if (target.dueDate) {
      const diffDays = getDaysDifferenceFromToday(target.dueDate);
      const res = calculateDebtStatus(diffDays);
      originalStatus = res.status;
      originalLabel = res.dueDateLabel;
    }

    let restoredHistory = target.paymentHistory || [];
    let restoredTotal = target.originalAmount || 0;

    // Jika pembayaran teratas adalah 'Pelunasan langsung', batalkan pencatatan tersebut
    if (restoredHistory.length > 0 && restoredHistory[0].note === 'Pelunasan langsung') {
      const directPaidAmount = restoredHistory[0].amount;
      restoredHistory = restoredHistory.slice(1);
      const remainingCicilan = restoredHistory.reduce((sum, p) => sum + p.amount, 0);
      restoredTotal = Math.max(0, (target.originalAmount || directPaidAmount) - remainingCicilan);
    } else {
      const totalCicil = restoredHistory.reduce((sum, p) => sum + p.amount, 0);
      restoredTotal = Math.max(0, (target.originalAmount || 0) - totalCicil);
    }

    const updated = debts.map((item) => {
      if (item.id === debtId) {
        return {
          ...item,
          totalAmount: restoredTotal,
          status: originalStatus,
          dueDateLabel: originalLabel,
          paidAt: undefined,
          paymentHistory: restoredHistory,
        };
      }
      return item;
    });

    setDebts(updated);
    setStats(calculateStats(updated));

    await debtService.undoPaid(debtId, originalStatus, originalLabel, restoredTotal, restoredHistory);

    showToast(
      'info',
      'Pelunasan Dibatalkan',
      `Status piutang ${target.customerName} dikembalikan menjadi aktif.`
    );
  };

  const handlePartialPayment = async (debtId: string, amountPaid: number, note?: string) => {
    const target = debts.find((d) => d.id === debtId);
    if (!target || target.status === 'paid' || amountPaid <= 0) return;

    const newTotal = Math.max(0, target.totalAmount - amountPaid);
    const isNowPaid = newTotal === 0;

    const newLog = {
      id: 'pay-' + Date.now(),
      amount: amountPaid,
      paidAt: new Date().toISOString(),
      note: note || 'Pembayaran cicilan',
    };

    const newHistory = [newLog, ...(target.paymentHistory || [])];

    const updatedDebts = debts.map((item) => {
      if (item.id === debtId) {
        return {
          ...item,
          totalAmount: newTotal,
          originalAmount: item.originalAmount || item.totalAmount,
          status: isNowPaid ? ('paid' as const) : item.status,
          dueDateLabel: isNowPaid ? 'Lunas' : item.dueDateLabel,
          paidAt: isNowPaid ? new Date().toISOString() : item.paidAt,
          paymentHistory: newHistory,
        };
      }
      return item;
    });

    setDebts(updatedDebts);
    setStats(calculateStats(updatedDebts));

    await debtService.addPartialPayment(debtId, newTotal, isNowPaid, newHistory);

    triggerConfetti();

    if (isNowPaid) {
      showToast(
        'success',
        'Piutang Lunas Sepenuhnya!',
        `Pembayaran cicilan Rp ${amountPaid.toLocaleString('id-ID')} melunasi seluruh piutang ${target.customerName}.`
      );
    } else {
      showToast(
        'success',
        'Cicilan Berhasil Dicatat!',
        `Diterima Rp ${amountPaid.toLocaleString('id-ID')} dari ${target.customerName}. Sisa piutang: Rp ${newTotal.toLocaleString('id-ID')}.`
      );
    }
  };

  const handleSubmitTransaction = async (data: {
    customer: CustomerSuggestion;
    amount: number;
    startDate: string;
    dueDate: string;
    dueDateLabel?: string;
    notes?: string;
    photoUrl?: string;
  }) => {
    const additionalAmount = data.amount;

    const diffDays = getDaysDifferenceFromToday(data.dueDate);
    const statusResult = calculateDebtStatus(diffDays);
    const calculatedStatus = statusResult.status;
    const calculatedLabel = data.dueDateLabel || statusResult.dueDateLabel;

    if (!customers.some((c) => c.name.toLowerCase() === data.customer.name.toLowerCase())) {
      setCustomers((prev) => [data.customer, ...prev]);
      await debtService.upsertCustomer(data.customer);
    }

    const existingIndex = debts.findIndex(
      (d) => d.customerName.toLowerCase() === data.customer.name.toLowerCase()
    );

    let nextDebts: DebtRecord[];
    let targetDebtToSave: DebtRecord;

    if (existingIndex >= 0) {
      const updatedDebts = [...debts];
      const existing = updatedDebts[existingIndex];
      const wasPaid = existing.status === 'paid';

      targetDebtToSave = {
        ...existing,
        totalAmount: wasPaid ? additionalAmount : existing.totalAmount + additionalAmount,
        originalAmount: wasPaid ? additionalAmount : (existing.originalAmount || existing.totalAmount) + additionalAmount,
        status: calculatedStatus,
        startDate: data.startDate,
        dueDate: data.dueDate,
        dueDateLabel: calculatedLabel,
        notes: data.notes || existing.notes,
        photoUrl: data.photoUrl || existing.photoUrl,
      };

      updatedDebts[existingIndex] = targetDebtToSave;
      nextDebts = updatedDebts;
      setDebts(updatedDebts);
    } else {
      targetDebtToSave = {
        id: 'debt-' + Date.now(),
        customerName: data.customer.name,
        village: data.customer.village,
        phone: data.customer.phone,
        avatarUrl: '/images/cow-avatar-2.jpg',
        feedItems: [],
        totalAmount: additionalAmount,
        originalAmount: additionalAmount,
        status: calculatedStatus,
        startDate: data.startDate,
        dueDate: data.dueDate,
        dueDateLabel: calculatedLabel,
        notes: data.notes,
        photoUrl: data.photoUrl,
        paymentHistory: [],
        createdAt: new Date().toISOString(),
      };

      nextDebts = [targetDebtToSave, ...debts];
      setDebts(nextDebts);
    }

    setStats(calculateStats(nextDebts));

    await debtService.upsertDebt(targetDebtToSave);

    triggerConfetti();
    const noteSnippet = data.notes ? ` (${data.notes})` : '';
    showToast(
      'success',
      'Transaksi Tersimpan!',
      `Catatan utang ${data.customer.name} sebesar Rp ${additionalAmount.toLocaleString('id-ID')}${noteSnippet} tersimpan (Jatuh Tempo: ${formatIndonesianDate(data.dueDate, false)}).`
    );
  };

  const handleAddCustomer = async (newCustomer: CustomerSuggestion) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    await debtService.upsertCustomer(newCustomer);
    showToast(
      'success',
      'Pelanggan Baru Terdaftar',
      `${newCustomer.name} (${newCustomer.village}) berhasil ditambahkan.`
    );
  };

  const handleUpdateCustomer = async (updatedCustomer: CustomerSuggestion, oldName?: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );

    if (oldName && oldName.toLowerCase() !== updatedCustomer.name.toLowerCase()) {
      setDebts((prev) =>
        prev.map((d) =>
          d.customerName.toLowerCase() === oldName.toLowerCase()
            ? { ...d, customerName: updatedCustomer.name, village: updatedCustomer.village, phone: updatedCustomer.phone }
            : d
        )
      );
    }

    await debtService.upsertCustomer(updatedCustomer);
    showToast(
      'success',
      'Data Peternak Diperbarui',
      `Data ${updatedCustomer.name} berhasil diperbarui.`
    );
  };

  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));

    setDebts((prev) => {
      const remainingDebts = prev.filter((d) => d.customerName.toLowerCase() !== customerName.toLowerCase());
      setStats(calculateStats(remainingDebts));
      return remainingDebts;
    });

    await debtService.deleteCustomer(customerId, customerName);
    showToast(
      'info',
      'Peternak Dihapus',
      `Data ${customerName} telah berhasil dihapus.`
    );
  };

  const handleDeleteDebt = async (debtId: string) => {
    const debtToDelete = debts.find((d) => d.id === debtId);
    setDebts((prev) => {
      const remainingDebts = prev.filter((d) => d.id !== debtId);
      setStats(calculateStats(remainingDebts));
      return remainingDebts;
    });

    await debtService.deleteDebt(debtId);
    showToast(
      'info',
      'Transaksi Dihapus',
      debtToDelete
        ? `Catatan transaksi ${debtToDelete.customerName} berhasil dihapus.`
        : 'Transaksi berhasil dihapus.'
    );
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        appName: 'Catatan Tempo Pakan',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        customersCount: customers.length,
        debtsCount: debts.length,
        customers,
        debts,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `backup-catatan-tempo-${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('success', 'Cadangan Berhasil Diunduh!', 'File salinan data peternak & piutang telah tersimpan di perangkat.');
    } catch (err) {
      console.error('Backup error:', err);
      showToast('warning', 'Gagal Membuat Cadangan', 'Terjadi kesalahan saat mengunduh data.');
    }
  };

  return (
    <PhoneMockup viewMode={viewMode}>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <Header
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        unreadNotificationsCount={
          debts.filter((d) => d.status === 'due_2_days' || d.status === 'due_5_days').length
        }
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
      />

      <div className="px-3 md:px-6 pt-2 shrink-0">
        <div
          className={`flex items-center justify-between px-2.5 py-1 md:py-1.5 md:px-3.5 rounded-xl text-[10px] md:text-xs font-semibold transition-all ${
            isCloudEnabled
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/90'
              : 'bg-amber-50 text-amber-800 border border-amber-200/90'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {isCloudEnabled ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            ) : (
              <HardDrive className="w-3 h-3 text-amber-600" />
            )}
            <span>
              {isCloudEnabled
                ? 'Terhubung Database Cloud Supabase'
                : 'Penyimpanan Lokal Aktif (Data Tersimpan di HP/Browser)'}
            </span>
          </div>
          <span className="text-[9.5px] md:text-[11px] opacity-75 font-normal">
            {isCloudEnabled ? 'Live Real-time' : 'Buka .env.local untuk Cloud'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {activeTab === 'beranda' && (
          <main className="flex-1 flex flex-col pb-4">
            <div className="px-0 md:px-6 md:pt-3">
              <SummaryCards stats={stats} />
            </div>

            {viewMode === 'tablet' ? (
              <div className="flex-1 min-h-0 md:grid md:grid-cols-12 md:gap-5 md:px-6 md:py-4">
                <div className="md:col-span-5 md:overflow-y-auto space-y-4">
                  <TransactionForm
                    customers={customers}
                    onSubmitTransaction={handleSubmitTransaction}
                  />
                </div>

                <div className="md:col-span-7 md:overflow-y-auto space-y-4">
                  <DebtList
                    debts={debts}
                    onMarkAsPaid={handleMarkAsPaid}
                    onUndoPaid={handleUndoPaid}
                    onOpenCustomerDetail={(debt) => setSelectedDebtDetail(debt)}
                    onOpenPartialPayment={(debt) => setPartialPaymentDebt(debt)}
                  />
                </div>
              </div>
            ) : (
              <>
                <TransactionForm
                  customers={customers}
                  onSubmitTransaction={handleSubmitTransaction}
                />

                <DebtList
                  debts={debts}
                  onMarkAsPaid={handleMarkAsPaid}
                  onUndoPaid={handleUndoPaid}
                  onOpenCustomerDetail={(debt) => setSelectedDebtDetail(debt)}
                  onOpenPartialPayment={(debt) => setPartialPaymentDebt(debt)}
                />
              </>
            )}
          </main>
        )}

        {activeTab === 'pelanggan' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <CustomersView
              customers={customers}
              debts={debts}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
            />
          </div>
        )}

        {activeTab === 'transaksi' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <TransactionsView debts={debts} onDeleteDebt={handleDeleteDebt} />
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        debts={debts}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <CustomerDetailModal
        debt={selectedDebtDetail}
        onClose={() => setSelectedDebtDetail(null)}
        onMarkAsPaid={handleMarkAsPaid}
        onOpenPartialPayment={(debt) => setPartialPaymentDebt(debt)}
      />

      <PartialPaymentModal
        isOpen={!!partialPaymentDebt}
        onClose={() => setPartialPaymentDebt(null)}
        debt={partialPaymentDebt}
        onSubmitPayment={handlePartialPayment}
      />

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-2xs animate-dropdown">
          <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#0a492d]">Catatan Tempo Pakan</h3>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('beranda');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 font-semibold flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Beranda Catatan</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pelanggan');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 font-semibold flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Data Peternak Sapi</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('transaksi');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 font-semibold flex items-center gap-2"
                >
                  <History className="w-4 h-4 text-emerald-700" />
                  <span>Riwayat Transaksi Tempo</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Keamanan & Cadangan Data
                </span>

                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full text-left px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold flex items-center justify-between text-xs transition-colors cursor-pointer border border-emerald-200/70"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Unduh Cadangan (Backup)</span>
                  </div>
                  <span className="text-[9.5px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    JSON
                  </span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cron Keep-Alive Aktif 24/7</span>
                </div>
                <p className="text-slate-600 leading-snug">
                  Sistem otomatis menyapa database Supabase setiap hari via Vercel Cron & GitHub Actions agar database aktif terus dan tidak pernah tidur/pause.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              <p className="font-semibold text-slate-600">Catatan Tempo Pakan v1.0</p>
              <p>Khusus Peternak & Toko Pakan Sapi</p>
            </div>
          </div>
        </div>
      )}
    </PhoneMockup>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
