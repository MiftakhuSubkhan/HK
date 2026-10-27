'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DebtRecord } from '../types';
import { formatRupiah } from './SummaryCards';
import { X, Phone, MessageSquare, Clock, Calendar, Check, AlertTriangle, Coins, FileText, History, Camera, Eye } from 'lucide-react';
import { formatIndonesianDate } from '../utils/date';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtRecord[];
  onMarkAsPaid: (id: string) => void;
}

export function NotificationModal({
  isOpen,
  onClose,
  debts,
  onMarkAsPaid,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const urgentDebts = debts.filter(
    (d) => d.status === 'due_2_days' || d.status === 'due_5_days'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-dropdown">
      <div className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg rounded-t-3xl sm:rounded-2xl p-4 md:p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Notifikasi Jatuh Tempo
              </h3>
              <p className="text-[11px] text-slate-500">
                {urgentDebts.length} tagihan butuh perhatian minggu ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 py-3">
          {urgentDebts.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              🎉 Tidak ada piutang yang mendesak saat ini.
            </div>
          ) : (
            urgentDebts.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900">
                    {item.customerName}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'due_2_days'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.dueDateLabel}
                  </span>
                </div>
                <div className="text-xs text-slate-600 flex justify-between">
                  <span>Nominal Piutang:</span>
                  <span className="font-bold text-slate-900">
                    {formatRupiah(item.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://wa.me/62${item.phone.replace(/^0|\s+/g, '')}?text=Halo%20${encodeURIComponent(item.customerName)},%20mengingatkan%20tempo%20pakan%20ternak%20sebesar%20${encodeURIComponent(formatRupiah(item.totalAmount))}${item.dueDate ? `%20(Jatuh%20tempo:%20${encodeURIComponent(formatIndonesianDate(item.dueDate))})` : ''}.%20Terima%20kasih.`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-[#25D366] text-white py-1.5 rounded-lg text-xs font-semibold hover:opacity-90"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      onMarkAsPaid(item.id);
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-[#127749] text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0a492d]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Tandai Lunas</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

interface CustomerDetailModalProps {
  debt: DebtRecord | null;
  onClose: () => void;
  onMarkAsPaid: (id: string) => void;
  onOpenPartialPayment?: (debt: DebtRecord) => void;
}

export function CustomerDetailModal({
  debt,
  onClose,
  onMarkAsPaid,
  onOpenPartialPayment,
}: CustomerDetailModalProps) {
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);
  if (!debt) return null;

  const hasPaidSome = debt.originalAmount && debt.originalAmount > debt.totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-dropdown">
      <div className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg rounded-t-3xl sm:rounded-2xl p-4.5 md:p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Detail Piutang Peternak</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2 flex flex-col items-center text-center">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md mb-2">
            <Image
              src={debt.avatarUrl || '/images/cow-avatar-1.jpg'}
              alt={debt.customerName}
              fill
              className="object-cover"
            />
          </div>
          <h4 className="text-base font-bold text-slate-900">{debt.customerName}</h4>
          <p className="text-xs text-slate-500">{debt.village}</p>
          <p className="text-xs font-mono text-slate-700 mt-0.5">{debt.phone}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Status Tempo:</span>
            <span className="font-semibold text-slate-900">{debt.dueDateLabel}</span>
          </div>

          {(debt.startDate || debt.createdAt) && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tanggal Mulai (Ambil):</span>
              <span className="font-semibold text-slate-800">
                {formatIndonesianDate(debt.startDate || debt.createdAt!.split('T')[0])}
              </span>
            </div>
          )}

          {debt.dueDate && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>Tanggal Jatuh Tempo:</span>
              <span className="font-bold text-emerald-800">{formatIndonesianDate(debt.dueDate)}</span>
            </div>
          )}

          {debt.notes && (
            <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
              <span>Catatan:</span>
              <span className="font-semibold text-slate-900 text-right max-w-[200px]">{debt.notes}</span>
            </div>
          )}

          {hasPaidSome && (
            <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
              <span>Total Awal:</span>
              <span className="text-slate-500 line-through">{formatRupiah(debt.originalAmount!)}</span>
            </div>
          )}

          {hasPaidSome && (
            <div className="flex justify-between text-xs text-slate-600">
              <span>Sudah Dicicil:</span>
              <span className="font-semibold text-emerald-700">
                {formatRupiah(debt.originalAmount! - debt.totalAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-1.5">
            <span>Sisa Piutang:</span>
            <span className="font-bold text-emerald-700 text-sm">
              {debt.status === 'paid' ? 'Rp 0 (Lunas)' : formatRupiah(debt.totalAmount)}
            </span>
          </div>

          {debt.photoUrl && (
            <div className="border-t border-slate-200/60 pt-2 space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Foto Bukti Transaksi / Nota:</span>
              </div>
              <div
                onClick={() => setIsViewingReceipt(true)}
                className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-36 bg-slate-900 flex items-center justify-center cursor-pointer group shadow-2xs"
              >
                <img src={debt.photoUrl} alt="Bukti nota" className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Klik untuk perbesar</span>
                </div>
              </div>
            </div>
          )}

          {debt.feedItems && debt.feedItems.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">
                Rincian Pakan:
              </span>
              <div className="space-y-1">
                {debt.feedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700">
                    <span>{item.type}</span>
                    <span className="font-semibold">{item.bags} karung</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debt.paymentHistory && debt.paymentHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1.5">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Riwayat Pembayaran Cicilan:</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {debt.paymentHistory.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-lg p-2 border border-slate-200/80 text-[11px] flex justify-between items-center shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-emerald-800">{formatRupiah(p.amount)}</span>
                      {p.note && <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{p.note}</p>}
                    </div>
                    <span className="text-[9.5px] text-slate-400 font-medium">
                      {formatIndonesianDate(p.paidAt.split('T')[0], false)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {debt.status !== 'paid' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPartialPayment?.(debt);
                }}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <Coins className="w-4 h-4" />
                <span>Bayar Cicilan</span>
              </button>

              <button
                onClick={() => {
                  onMarkAsPaid(debt.id);
                  onClose();
                }}
                className="flex-1 bg-[#127749] hover:bg-[#0a492d] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[2.8]" />
                <span>Tandai Lunas</span>
              </button>
            </div>
          )}

          <a
            href={`https://wa.me/62${debt.phone.replace(/^0|\s+/g, '')}?text=Halo%20${encodeURIComponent(debt.customerName)},%20mengingatkan%20catatan%20tempo%20pakan%20sebesar%20${encodeURIComponent(formatRupiah(debt.totalAmount))}${debt.dueDate ? `%20(Jatuh%20tempo:%20${encodeURIComponent(formatIndonesianDate(debt.dueDate))})` : ''}.%20Terima%20kasih.`}
            target="_blank"
            rel="noreferrer"
            className="w-full bg-[#25D366] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim Pengingat WhatsApp</span>
          </a>

          <a
            href={`tel:${debt.phone.replace(/\s+/g, '')}`}
            className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-all"
          >
            <Phone className="w-4 h-4" />
            <span>Panggil Nomor Telepon</span>
          </a>
        </div>

        {isViewingReceipt && debt.photoUrl && (
          <div
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
            onClick={() => setIsViewingReceipt(false)}
          >
            <div className="w-full max-w-md flex justify-between items-center text-white pb-3" onClick={(e) => e.stopPropagation()}>
              <div>
                <p className="text-xs font-bold">Bukti Nota / Transaksi</p>
                <p className="text-[11px] text-white/70">{debt.customerName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsViewingReceipt(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative max-w-md max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={debt.photoUrl}
                alt="Bukti Nota Transaksi"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtRecord | null;
  onSubmitPayment: (debtId: string, amount: number, note?: string) => void;
}

export function PartialPaymentModal({
  isOpen,
  onClose,
  debt,
  onSubmitPayment,
}: PartialPaymentModalProps) {
  const [payAmount, setPayAmount] = useState<string>('');
  const [payNote, setPayNote] = useState<string>('');

  useEffect(() => {
    if (debt) {
      const half = Math.round(debt.totalAmount / 2);
      setPayAmount(half.toLocaleString('id-ID'));
      setPayNote('');
    }
  }, [debt]);

  if (!isOpen || !debt) return null;

  const currentTotal = debt.totalAmount;
  const parsedPayAmount = parseInt(payAmount.replace(/\D/g, ''), 10) || 0;
  const remaining = Math.max(0, currentTotal - parsedPayAmount);
  const isFullPayment = parsedPayAmount >= currentTotal;

  const handlePercentageClick = (percentage: number) => {
    const calculated = Math.round((currentTotal * percentage) / 100);
    setPayAmount(calculated.toLocaleString('id-ID'));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setPayAmount('');
      return;
    }
    const num = parseInt(rawVal, 10);
    setPayAmount(num.toLocaleString('id-ID'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPayAmount <= 0) return;
    onSubmitPayment(debt.id, parsedPayAmount, payNote.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-dropdown">
      <div className="bg-white w-full max-w-sm sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shadow-2xs">
              <Coins className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Catat Cicilan / Angsuran</h3>
              <p className="text-[10.5px] text-slate-500">Bayar sebagian piutang peternak</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            title="Tutup"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-emerald-50/90 to-teal-50/60 rounded-xl p-3 border border-emerald-100 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0 mr-2">
            <div className="w-8.5 h-8.5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {debt.customerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">{debt.customerName}</h4>
              <p className="text-[10px] text-slate-500 truncate">{debt.village} • {debt.phone}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9.5px] font-semibold text-emerald-800/80 uppercase tracking-wider block">Sisa Piutang</span>
            <span className="text-xs font-black text-emerald-900">
              {formatRupiah(debt.totalAmount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                Nominal yang Dibayarkan
              </label>
              {parsedPayAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setPayAmount('')}
                  className="text-[10.5px] text-slate-400 hover:text-red-600 cursor-pointer font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="relative flex items-center bg-white border-2 border-emerald-600/30 focus-within:border-emerald-600 rounded-xl px-3 py-2 transition-all shadow-2xs">
              <span className="text-xs font-black text-emerald-800 mr-2.5 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                Rp
              </span>
              <input
                type="text"
                value={payAmount}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full text-lg sm:text-xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none tracking-tight font-mono"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[25, 50, 75, 100].map((pct) => {
                const targetAmount = Math.round((currentTotal * pct) / 100);
                const isSelected = parsedPayAmount === targetAmount;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className={`py-1.5 px-1 rounded-lg text-[10.5px] transition-all cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-[#127749] text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {pct === 100 ? 'Lunas (100%)' : `${pct}%`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder="Cth: Uang setoran susu, titip transfer..."
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Sisa Piutang Saat Ini</span>
              <span className="font-medium text-slate-700">{formatRupiah(currentTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Nominal Dibayarkan</span>
              <span>- {formatRupiah(parsedPayAmount)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
              <span className="font-bold text-slate-800">Sisa Piutang Baru</span>
              <span className={`font-black text-sm ${remaining === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                {formatRupiah(remaining)}
              </span>
            </div>
            {isFullPayment && (
              <div className="mt-1 p-1.5 bg-emerald-100/70 border border-emerald-200 rounded-lg text-emerald-800 text-[10.5px] font-semibold flex items-center gap-1.5">
                <span>🎉</span>
                <span>Pembayaran ini akan langsung melunasi seluruh piutang!</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              type="submit"
              disabled={parsedPayAmount <= 0}
              className="w-full bg-[#127749] hover:bg-[#0a492d] disabled:opacity-50 disabled:pointer-events-none text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.8]" />
              <span>Simpan Pembayaran ({formatRupiah(parsedPayAmount)})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
