'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DebtRecord } from '../types';
import { formatRupiah } from './SummaryCards';
import { LeafIcon, SackIcon, PelletIcon } from './icons/CustomIcons';
import {
  Layers,
  ChevronDown,
  Clock,
  CheckCircle2,
  ChevronRight,
  Phone,
  Check,
  RotateCcw,
  Coins,
  FileText,
  Camera,
  X,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/date';

interface DebtListProps {
  debts: DebtRecord[];
  onMarkAsPaid: (debtId: string) => void;
  onUndoPaid: (debtId: string) => void;
  onOpenCustomerDetail?: (debt: DebtRecord) => void;
  onOpenPartialPayment?: (debt: DebtRecord) => void;
}

type SortOption = 'nearest_due' | 'highest_amount' | 'lowest_amount' | 'name_asc';

export default function DebtList({
  debts,
  onMarkAsPaid,
  onUndoPaid,
  onOpenCustomerDetail,
  onOpenPartialPayment,
}: DebtListProps) {
  const [sortOption, setSortOption] = useState<SortOption>('nearest_due');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const sortedDebts = [...debts].sort((a, b) => {
    if (a.status === 'paid' && b.status !== 'paid') return 1;
    if (b.status === 'paid' && a.status !== 'paid') return -1;

    if (sortOption === 'nearest_due') {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      const order = { due_2_days: 1, due_5_days: 2, safe: 3, paid: 4 };
      return (order[a.status] || 5) - (order[b.status] || 5);
    }
    if (sortOption === 'highest_amount') {
      return b.totalAmount - a.totalAmount;
    }
    if (sortOption === 'lowest_amount') {
      return a.totalAmount - b.totalAmount;
    }
    if (sortOption === 'name_asc') {
      return a.customerName.localeCompare(b.customerName);
    }
    return 0;
  });

  const getSortLabel = () => {
    switch (sortOption) {
      case 'nearest_due':
        return 'Terdekat Jatuh Tempo';
      case 'highest_amount':
        return 'Nominal Terbesar';
      case 'lowest_amount':
        return 'Nominal Terkecil';
      case 'name_asc':
        return 'Nama (A - Z)';
    }
  };

  return (
    <div className="px-3 pt-3 md:px-0 md:pt-0 pb-24 md:pb-6 space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-800 tracking-tight">
            Daftar Piutang
          </h3>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] text-slate-600 hover:text-slate-800 shadow-2xs transition-all active:scale-95"
          >
            <span>Urutkan: {getSortLabel()}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isSortDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-slate-200 shadow-md py-1 z-20 text-[11px] animate-dropdown">
              <button
                type="button"
                onClick={() => {
                  setSortOption('nearest_due');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                  sortOption === 'nearest_due' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                Terdekat Jatuh Tempo
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('highest_amount');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                  sortOption === 'highest_amount' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                Nominal Terbesar
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('lowest_amount');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                  sortOption === 'lowest_amount' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                Nominal Terkecil
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortOption('name_asc');
                  setIsSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 transition-colors ${
                  sortOption === 'name_asc' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                }`}
              >
                Nama Peternak (A-Z)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {sortedDebts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 text-center space-y-2 my-2 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Catatan Piutang</h4>
            <p className="text-[11px] text-slate-500 max-w-[260px] mx-auto leading-relaxed">
              Data piutang telah dibersihkan. Gunakan formulir &ldquo;Input Transaksi Baru&rdquo; di atas untuk mulai mencatat piutang peternak.
            </p>
          </div>
        ) : (
          sortedDebts.map((item) => {
            const isPaid = item.status === 'paid';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-3 border shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all ${
                isPaid ? 'border-emerald-200/80 bg-emerald-50/20 opacity-95' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => onOpenCustomerDetail?.(item)}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs">
                    <Image
                      src={item.avatarUrl || '/images/cow-avatar-1.jpg'}
                      alt={item.customerName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug hover:text-emerald-700 transition-colors">
                      {item.customerName}
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      {item.village}
                    </p>
                    <a
                      href={`tel:${item.phone.replace(/\s+/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-emerald-700 transition-colors leading-snug mt-0.5"
                    >
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      <span>{item.phone}</span>
                    </a>
                  </div>
                </div>

                <div
                  onClick={() => onOpenCustomerDetail?.(item)}
                  className="cursor-pointer flex flex-col items-end"
                >
                  {item.status === 'due_2_days' && (
                    <div className="flex items-center gap-1 bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] px-2 py-0.5 rounded-full text-[10px] font-medium shadow-2xs">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.dueDateLabel || 'Jatuh Tempo 2 Hari Lagi'}</span>
                      <ChevronRight className="w-3 h-3 text-[#dc2626]/70" />
                    </div>
                  )}

                  {item.status === 'due_5_days' && (
                    <div className="flex items-center gap-1 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] px-2 py-0.5 rounded-full text-[10px] font-medium shadow-2xs">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{item.dueDateLabel || 'Jatuh Tempo 5 Hari Lagi'}</span>
                      <ChevronRight className="w-3 h-3 text-[#b45309]/70" />
                    </div>
                  )}

                  {item.status === 'safe' && (
                    <div className="flex items-center gap-1 bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] px-2 py-0.5 rounded-full text-[10px] font-medium shadow-2xs">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{item.dueDateLabel || 'Aman (Belum Jatuh Tempo)'}</span>
                      <ChevronRight className="w-3 h-3 text-[#059669]/70" />
                    </div>
                  )}

                  {item.status === 'paid' && (
                    <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-2xs animate-pop">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                      <span>Lunas</span>
                    </div>
                  )}

                  <div className="mt-1 flex flex-col items-end text-[9.5px] leading-tight">
                    {item.startDate && (
                      <span className="text-slate-400">
                        Mulai: <span className="font-semibold text-slate-600">{formatIndonesianDate(item.startDate, false)}</span>
                      </span>
                    )}
                    {item.dueDate && item.status !== 'paid' && (
                      <span className="text-emerald-800 font-semibold mt-0.5">
                        Tempo: <span className="font-bold text-emerald-900">{formatIndonesianDate(item.dueDate, false)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {item.feedItems && item.feedItems.length > 0 && (
                <div className="flex items-start gap-2 mt-2.5 mb-3">
                  {item.feedItems.map((feed, idx) => {
                    return (
                      <div key={idx} className="flex flex-col">
                        <div
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            feed.type === 'Bran Daun'
                              ? 'bg-[#eaf4ee] text-[#127749]'
                              : feed.type === 'Polar'
                              ? 'bg-[#f1f5f9] text-[#475569]'
                              : 'bg-[#fef8ee] text-[#b45309]'
                          }`}
                        >
                          {feed.type === 'Bran Daun' && <LeafIcon className="w-3 h-3" />}
                          {feed.type === 'Polar' && <SackIcon className="w-3 h-3" />}
                          {feed.type === 'Pelet' && <PelletIcon className="w-3 h-3" />}
                          <span>{feed.type}</span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-medium mt-0.5 pl-0.5">
                          {feed.bags} karung
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {item.notes && (
                <div className="mt-2 mb-2 flex items-center gap-1.5 text-[10.5px] text-slate-700 bg-emerald-50/50 border border-emerald-100/80 rounded-lg px-2.5 py-1">
                  <FileText className="w-3 h-3 text-emerald-700 shrink-0" />
                  <span className="truncate">{item.notes}</span>
                </div>
              )}

              {item.photoUrl && (
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto(item.photoUrl!);
                    }}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 text-[10px] font-semibold transition-all shadow-2xs"
                  >
                    <Camera className="w-3 h-3 text-emerald-700" />
                    <span>Lihat Bukti Foto Nota</span>
                  </button>
                </div>
              )}

              {item.originalAmount && item.totalAmount < item.originalAmount && !isPaid && (
                <div className="flex items-center gap-1.5 mb-2 text-[9.5px]">
                  <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                    Sudah dicicil: {formatRupiah(item.originalAmount - item.totalAmount)}
                  </span>
                  <span className="text-slate-400">
                    (Awal: {formatRupiah(item.originalAmount)})
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                <div>
                  <span className="text-[10px] text-slate-500 block leading-tight font-normal">
                    {isPaid ? 'Sisa Piutang' : item.originalAmount && item.totalAmount < item.originalAmount ? 'Sisa Piutang' : 'Total Piutang'}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <p className={`text-xs font-bold tracking-tight leading-tight ${isPaid ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {isPaid ? 'Rp 0' : formatRupiah(item.totalAmount)}
                    </p>
                    {isPaid && (
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Total: {formatRupiah(item.originalAmount || item.totalAmount)})
                      </span>
                    )}
                  </div>
                </div>

                {isPaid ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                      ✓ Sudah Lunas
                    </span>
                    <button
                      type="button"
                      onClick={() => onUndoPaid(item.id)}
                      title="Batalkan pelunasan"
                      className="p-1 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenPartialPayment?.(item)}
                      className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 text-[10.5px] font-semibold px-2.5 py-1.5 rounded-xl border border-amber-200/80 shadow-2xs transition-all"
                      title="Bayar cicilan sebagian"
                    >
                      <Coins className="w-3 h-3 text-amber-700" />
                      <span>Cicil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(item.id)}
                      className="flex items-center gap-1 bg-[#127749] hover:bg-[#0a492d] active:scale-95 text-white text-[10.5px] font-semibold px-2.5 py-1.5 rounded-xl shadow-2xs transition-all focus:outline-none"
                    >
                      <Check className="w-3 h-3 stroke-[2.8]" />
                      <span>Lunas</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        }))}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-dropdown">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl space-y-3 p-3.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Foto Bukti Transaksi / Nota</h4>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-100 flex items-center justify-center bg-slate-900">
              <img src={selectedPhoto} alt="Bukti transaksi" className="max-w-full max-h-[65vh] object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
