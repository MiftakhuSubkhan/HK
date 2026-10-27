'use client';

import React from 'react';
import { SummaryStats } from '../types';
import { Calendar, Check } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
  onFilterStatus?: (statusFilter: string) => void;
}

export function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export default function SummaryCards({ stats, onFilterStatus }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 px-3 md:px-0 pt-3 md:pt-0">
      <div 
        onClick={() => onFilterStatus?.('all_active')}
        className="bg-white rounded-2xl p-2.5 md:p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      >
        <div>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#127749] text-white flex items-center justify-center mb-1.5 md:mb-2 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5 md:w-4.5 md:h-4.5">
              <rect x="2" y="6" width="20" height="13" rx="2" />
              <circle cx="12" cy="12.5" r="2.2" />
              <path d="M6 10H6.01M18 15H18.01" />
            </svg>
          </div>
          <span className="text-[10px] md:text-xs font-medium text-slate-600 block leading-tight mb-1 md:mb-1.5">
            Total Piutang Aktif
          </span>
          <p className="text-xs md:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {formatRupiah(stats.totalActiveDebt)}
          </p>
        </div>
        <span className="text-[10px] md:text-xs text-slate-400 font-normal mt-1.5 md:mt-2">
          {stats.activeCustomersCount} pelanggan
        </span>
      </div>

      <div 
        onClick={() => onFilterStatus?.('due_week')}
        className="bg-[#fef9f3] rounded-2xl p-2.5 md:p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-[#fae8d2] hover:border-orange-300 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      >
        <div>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#e77a1f] text-white flex items-center justify-center mb-1.5 md:mb-2 shadow-sm">
            <Calendar className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 stroke-[2.4]" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-slate-700 block leading-tight mb-1 md:mb-1.5">
            Jatuh Tempo Minggu Ini
          </span>
          <p className="text-xs md:text-base font-bold text-[#c75e0e] tracking-tight leading-tight">
            {formatRupiah(stats.dueThisWeekAmount)}
          </p>
        </div>
        <span className="text-[10px] md:text-xs text-slate-500 font-normal mt-1.5 md:mt-2">
          {stats.dueThisWeekCustomersCount} pelanggan
        </span>
      </div>

      <div 
        onClick={() => onFilterStatus?.('paid')}
        className="bg-white rounded-2xl p-2.5 md:p-4 flex flex-col justify-between shadow-[0_1px_4px_rgba(0,0,0,0.04)] border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
      >
        <div>
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#127749] text-white flex items-center justify-center mb-1.5 md:mb-2 shadow-sm">
            <Check className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 stroke-[2.8]" />
          </div>
          <span className="text-[10px] md:text-xs font-medium text-slate-600 block leading-tight mb-1 md:mb-1.5">
            Lunas
          </span>
          <p className="text-xs md:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {formatRupiah(stats.totalPaidAmount)}
          </p>
        </div>
        <span className="text-[10px] md:text-xs text-slate-400 font-normal mt-1.5 md:mt-2">
          {stats.paidCustomersCount} pelanggan
        </span>
      </div>
    </div>
  );
}
