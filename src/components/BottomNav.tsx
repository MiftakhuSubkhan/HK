'use client';

import React from 'react';
import { Home, Users, FileText } from 'lucide-react';

export type NavTab = 'beranda' | 'pelanggan' | 'transaksi';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    {
      id: 'beranda' as NavTab,
      label: 'Beranda',
      icon: Home,
    },
    {
      id: 'pelanggan' as NavTab,
      label: 'Pelanggan',
      icon: Users,
    },
    {
      id: 'transaksi' as NavTab,
      label: 'Transaksi',
      icon: FileText,
    },
  ];

  return (
    <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-40">
      <nav className="flex items-center justify-around px-2 py-1.5 md:py-2.5 max-w-md mx-auto" aria-label="Menu Navigasi Utama">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 md:py-1.5 px-4 md:px-8 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#0a492d] font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 md:w-5.5 md:h-5.5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0a492d] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] md:text-xs mt-0.5 tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="w-full flex justify-center pb-1 pt-0.5">
        <div className="w-28 h-1 bg-slate-300 rounded-full" />
      </div>
    </div>
  );
}
