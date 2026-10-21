'use client';

import React from 'react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  return (
    <div className="w-full min-h-screen flex justify-center bg-[#0a492d] md:bg-slate-200/80">
      <div className="w-full max-w-md min-h-screen h-[100dvh] bg-[#f4f7f5] flex flex-col relative overflow-hidden shadow-2xl md:rounded-3xl md:my-6 md:h-[880px] md:max-h-[94vh] md:border md:border-slate-300">
        <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
