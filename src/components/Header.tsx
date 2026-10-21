'use client';

import React from 'react';
import { CowFaceIcon } from './icons/CustomIcons';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenNotifications?: () => void;
  onOpenMenu?: () => void;
  unreadNotificationsCount?: number;
}

export default function Header({
  onOpenNotifications,
  onOpenMenu,
  unreadNotificationsCount = 0,
}: HeaderProps) {
  return (
    <header className="bg-[#0a492d] text-white px-4 pt-3 pb-3.5 transition-colors shadow-sm shrink-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center p-1 border border-white/15">
            <CowFaceIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Catatan Tempo Pakan
            </h1>
            <p className="text-[11px] text-emerald-100/80 font-normal leading-snug">
              Kelola piutang & jatuh tempo pelanggan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Notifikasi"
            className="relative p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
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
            className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
          >
            <Menu className="w-5 h-5 text-white/95" />
          </button>
        </div>
      </div>
    </header>
  );
}
