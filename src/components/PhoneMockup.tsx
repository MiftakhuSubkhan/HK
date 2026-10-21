'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor, Wifi } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  const [isFramed, setIsFramed] = useState(true);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen">
      <div className="hidden md:flex items-center gap-3 mb-4 bg-slate-800/90 text-white px-4 py-2 rounded-full text-xs shadow-lg backdrop-blur-md border border-slate-700/60 z-50">
        <span className="text-slate-400 font-medium">Tampilan:</span>
        <button
          onClick={() => setIsFramed(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            isFramed
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Frame Mockup HP (Persis Gambar)</span>
        </button>
        <button
          onClick={() => setIsFramed(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            !isFramed
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Layar Penuh (Responsif)</span>
        </button>
      </div>

      <div
        className={`w-full transition-all duration-300 ${
          isFramed
            ? 'max-w-[400px] bg-black p-[11px] rounded-[52px] shadow-[0_25px_70px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.12)] border-[4px] border-[#2d3748]'
            : 'max-w-md w-full shadow-2xl rounded-2xl overflow-hidden'
        }`}
      >
        <div
          className={`relative w-full bg-[#f4f7f5] overflow-hidden flex flex-col ${
            isFramed
              ? 'rounded-[42px] h-[844px] max-h-[92vh]'
              : 'min-h-screen h-[100dvh]'
          }`}
        >
          <div className="bg-[#0a492d] text-white pt-2.5 px-7 pb-1 flex items-center justify-between select-none z-30 shrink-0">
            <span className="text-xs font-semibold tracking-tight">9:41</span>

            <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end pr-2.5 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-[#1f2937]/50" />
            </div>

            <div className="flex items-center gap-1.5 text-white">
              <div className="flex items-end gap-[1.5px] h-3">
                <span className="w-[2.5px] h-1 bg-white rounded-xs" />
                <span className="w-[2.5px] h-1.5 bg-white rounded-xs" />
                <span className="w-[2.5px] h-2 bg-white rounded-xs" />
                <span className="w-[2.5px] h-2.5 bg-white rounded-xs" />
              </div>

              <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />

              <div className="flex items-center">
                <div className="w-5 h-2.5 border-[1.2px] border-white rounded-[4px] p-[1.5px] flex items-center">
                  <div className="w-full h-full bg-white rounded-[2px]" />
                </div>
                <div className="w-[1.5px] h-1 bg-white rounded-r-xs -ml-[0.5px]" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden min-h-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
