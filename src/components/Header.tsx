'use client';

import React from 'react';
import { CowFaceIcon } from './icons/CustomIcons';
import { Bell, Menu, Tablet, Smartphone } from 'lucide-react';

interface HeaderProps {
  onOpenNotifications?: () => void;
  onOpenMenu?: () => void;
  unreadNotificationsCount?: number;
  viewMode?: 'tablet' | 'phone';
  onChangeViewMode?: (mode: 'tablet' | 'phone') => void;
}

export default function Header({
  onOpenNotifications,
  onOpenMenu,
  unreadNotificationsCount = 0,
  viewMode = 'tablet',
  onChangeViewMode,
}: HeaderProps) {
  return (
    <header className="bg-[#0a492d] text-white px-4 md:px-6 pt-3 md:pt-3.5 pb-3 md:pb-3.5 transition-colors shadow-sm shrink-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center p-1 border border-white/15 shrink-0">
            <CowFaceIcon className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white leading-tight">
                Catatan Tempo Pakan
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-600/40">
                {viewMode === 'tablet' ? '📟 Tampilan Tablet' : '📱 Tampilan HP'}
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-emerald-100/80 font-normal leading-snug">
              Kelola piutang & jatuh tempo peternak sapi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Switcher Tampilan (khusus layar tablet/desktop) */}
          {onChangeViewMode && (
            <div className="hidden md:flex items-center bg-black/20 rounded-full p-0.5 border border-white/15 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onChangeViewMode('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  viewMode === 'tablet'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-100/80 hover:text-white'
                }`}
                title="Beralih ke Tampilan Layar Lebar Tablet"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Mode Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('phone')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  viewMode === 'phone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-100/80 hover:text-white'
                }`}
                title="Beralih ke Tampilan Simulasi Ponsel"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mode HP</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Notifikasi"
            className="relative p-2 md:p-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all focus:outline-none cursor-pointer"
          >
            <Bell className="w-5 h-5 text-white/95" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a492d]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Menu samping"
            className="p-2 md:p-2.5 rounded-full hover:bg-white/10 active:scale-95 transition-all focus:outline-none cursor-pointer"
          >
            <Menu className="w-5 h-5 text-white/95" />
          </button>
        </div>
      </div>
    </header>
  );
}
