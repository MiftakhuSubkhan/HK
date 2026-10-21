'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-dropdown">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-xl border border-slate-700/60 flex items-start gap-2.5">
        <div className="shrink-0 mt-0.5">
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          {toast.type === 'warning' && (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          )}
          {toast.type === 'info' && (
            <Info className="w-5 h-5 text-sky-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
