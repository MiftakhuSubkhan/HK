'use client';

import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
  viewMode?: 'tablet' | 'phone';
}

export default function PhoneMockup({ children, viewMode = 'tablet' }: PhoneMockupProps) {
  const isPhone = viewMode === 'phone';

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:justify-center bg-[#073621] md:bg-gradient-to-br md:from-slate-900 md:via-slate-800 md:to-emerald-950 p-0 md:p-3 transition-all duration-300">
      <div
        className={`w-full bg-[#f4f7f5] flex flex-col relative overflow-hidden shadow-2xl transition-all duration-300 ${
          isPhone
            ? 'max-w-md min-h-screen h-[100dvh] md:min-h-0 md:h-[880px] md:max-h-[94vh] md:rounded-3xl md:my-4 md:border md:border-slate-300'
            : 'max-w-md md:max-w-4xl lg:max-w-6xl min-h-screen h-[100dvh] md:min-h-0 md:h-[92vh] md:rounded-3xl md:my-3 md:border md:border-slate-700/50'
        }`}
      >
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
