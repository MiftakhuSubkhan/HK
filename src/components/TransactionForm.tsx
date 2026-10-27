'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CustomerSuggestion } from '../types';
import {
  Search,
  X,
  Plus,
  FileText,
  User,
  Banknote,
  Calendar,
  Clock,
  Camera,
  Image as ImageIcon,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { compressImageFile } from '../utils/image';
import {
  getDateOffsetString,
  getTodayDateString,
  getYesterdayDateString,
  getDateOffsetFromDate,
  getDaysDifferenceFromToday,
  formatIndonesianDate,
  calculateDebtStatus,
} from '../utils/date';

const DUE_PRESETS = [
  { label: '3 Hari', days: 3 },
  { label: '7 Hari (1 Mgg)', days: 7 },
  { label: '14 Hari (2 Mgg)', days: 14 },
  { label: '30 Hari (1 Bln)', days: 30 },
];

const QUICK_AMOUNTS = ['100.000', '250.000', '500.000', '1.000.000'];

interface TransactionFormProps {
  customers: CustomerSuggestion[];
  onSubmitTransaction: (data: {
    customer: CustomerSuggestion;
    amount: number;
    startDate: string;
    dueDate: string;
    dueDateLabel?: string;
    notes?: string;
    photoUrl?: string;
  }) => void;
}

export default function TransactionForm({
  customers,
  onSubmitTransaction,
}: TransactionFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSuggestion | null>(null);

  const [amount, setAmount] = useState<string>('');

  const [startDate, setStartDate] = useState<string>(() => getTodayDateString());

  const [notes, setNotes] = useState<string>('');

  const [dueDate, setDueDate] = useState<string>(() => getDateOffsetString(7));
  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(7);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isViewingPhoto, setIsViewingPhoto] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (customer: CustomerSuggestion) => {
    setSelectedCustomer(customer);
    setSearchQuery(customer.name);
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCustomer(null);
    setIsDropdownOpen(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      setAmount('');
      return;
    }
    const num = parseInt(rawVal, 10);
    setAmount(num.toLocaleString('id-ID'));
  };

  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    if (typeof selectedPreset === 'number') {
      setDueDate(getDateOffsetFromDate(newStartDate, selectedPreset));
    }
  };

  const handleSelectPreset = (days: number) => {
    setSelectedPreset(days);
    setDueDate(getDateOffsetFromDate(startDate, days));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setDueDate(val);
    const diff = getDaysDifferenceFromToday(val);
    const matched = DUE_PRESETS.find((p) => p.days === diff);
    if (matched) {
      setSelectedPreset(matched.days);
    } else {
      setSelectedPreset('custom');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const base64 = await compressImageFile(file, 1000, 0.75);
      setPhotoUrl(base64);
    } catch (err) {
      console.error('Error compressing image:', err);
      alert('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const diffDays = getDaysDifferenceFromToday(dueDate);
  const statusInfo = calculateDebtStatus(diffDays);
  const formattedDueDate = formatIndonesianDate(dueDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = selectedCustomer ? selectedCustomer.name : searchQuery.trim();
    if (!customerName) {
      alert('Silakan pilih atau masukkan nama peternak terlebih dahulu.');
      return;
    }

    const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;
    if (parsedAmount <= 0) {
      alert('Silakan masukkan jumlah nominal utang (minimal Rp 1).');
      return;
    }

    const transactionData = {
      amount: parsedAmount,
      startDate,
      dueDate,
      dueDateLabel: statusInfo.dueDateLabel,
      notes: notes.trim() || undefined,
      photoUrl: photoUrl || undefined,
    };

    if (!selectedCustomer) {
      const customCustomer: CustomerSuggestion = {
        id: 'c-' + Date.now(),
        name: customerName,
        village: 'Desa Sidoharjo',
        phone: '0857 0000 1111',
      };
      onSubmitTransaction({
        customer: customCustomer,
        ...transactionData,
      });
    } else {
      onSubmitTransaction({
        customer: selectedCustomer,
        ...transactionData,
      });
    }

    setAmount('');
    setSearchQuery('');
    setSelectedCustomer(null);
    setStartDate(getTodayDateString());
    setNotes('');
    setPhotoUrl(null);
  };

  return (
    <div className="mx-3 mt-3 md:mx-0 md:mt-0 bg-[#edf6f1] rounded-2xl p-3.5 md:p-4.5 border border-[#d3e6db] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#127749] text-white flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <h2 className="text-[13px] font-bold text-[#0a492d] tracking-tight">
            Input Transaksi Baru
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <span className="text-amber-500 text-xs">⚡</span>
          <span>Cepat & Mudah</span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-slate-700">
              Nama Orang yang Utang (Peternak):
            </label>
            {selectedCustomer && (
              <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                ✓ {selectedCustomer.village}
              </span>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center bg-white rounded-xl border border-slate-200/90 shadow-2xs px-2.5 py-1.5 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all">
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mr-1.5 border border-emerald-200/60">
                <User className="w-3 h-3" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  if (selectedCustomer && selectedCustomer.name !== e.target.value) {
                    setSelectedCustomer(null);
                  }
                }}
                onFocus={() => {
                  if (filteredCustomers.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Tulis nama yang utang (cth: Pak Budi, Slamet)..."
                className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                  title="Hapus nama"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg z-30 overflow-hidden divide-y divide-slate-100 animate-dropdown">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => handleSelectCustomer(cust)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-emerald-50/70 transition-colors ${
                          isSelected ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                            {cust.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                            {cust.village} • {cust.phone}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-[11px] text-slate-500 text-center">
                    Peternak baru. Tekan simpan untuk mencatat utang nama ini.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/85 rounded-xl p-2.5 border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-700">
              <Banknote className="w-3.5 h-3.5 text-emerald-700" />
              <span>Jumlah Utang (Rp):</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">
              Ketik nominal utang
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-2.5 text-xs font-bold text-slate-500">Rp</span>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[9px] text-slate-400">Pilihan cepat:</span>
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold transition-all active:scale-95 ${
                  amount === val
                    ? 'bg-[#127749] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                }`}
              >
                {val === '1.000.000' ? '1 Jt' : `${parseInt(val, 10) / 1000} rb`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/85 rounded-xl p-2.5 border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tanggal Mulai (Ambil Pakan):</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStartDateChange(getTodayDateString())}
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold transition-all active:scale-95 ${
                  startDate === getTodayDateString()
                    ? 'bg-[#127749] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => handleStartDateChange(getYesterdayDateString())}
                className={`px-2 py-0.5 rounded-md text-[9.5px] font-semibold transition-all active:scale-95 ${
                  startDate === getYesterdayDateString()
                    ? 'bg-[#127749] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                }`}
              >
                Kemarin
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-2.5 pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => e.target.value && handleStartDateChange(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[9px] text-slate-400 block leading-tight">Tanggal Ambil:</span>
              <span className="text-[10.5px] font-bold text-slate-800 block leading-tight">
                {formatIndonesianDate(startDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/85 rounded-xl p-2.5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Waktu Jatuh Tempo (Tempo):</span>
            </div>
            <span
              className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                statusInfo.status === 'due_2_days'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : statusInfo.status === 'due_5_days'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{statusInfo.dueDateLabel}</span>
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-slate-500 font-medium">Pilihan Cepat Tempo:</span>
              {selectedPreset === 'custom' && (
                <span className="text-[9px] text-emerald-700 font-semibold">Tanggal Kustom</span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {DUE_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleSelectPreset(preset.days)}
                    className={`py-1 px-1 rounded-lg text-[10.5px] font-semibold transition-all text-center leading-tight ${
                      isSelected
                        ? 'bg-[#127749] text-white shadow-2xs font-bold ring-1 ring-emerald-700/50'
                        : 'bg-[#e7f1eb] text-slate-700 hover:bg-[#d8e9de] active:scale-95'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-0.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="relative flex-1 flex items-center">
              <span className="absolute left-2.5 pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={dueDate}
                min={startDate}
                onChange={handleDateChange}
                className="w-full pl-8 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <div className="shrink-0 text-right">
              <span className="text-[9px] text-slate-400 block leading-tight">Jatuh Tempo:</span>
              <span className="text-[10.5px] font-bold text-emerald-800 block leading-tight">
                {formattedDueDate}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/85 rounded-xl p-2.5 border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Catatan / Keterangan (Opsional):</span>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">Opsional</span>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Cth: Konsentrat 2 sak, Titip anak, Obat cacing..."
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="bg-white/85 rounded-xl p-2.5 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Foto Bukti / Nota (Opsional):</span>
            </div>
            {photoUrl ? (
              <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓ Foto Terlampir
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 font-medium">Bisa dari HP</span>
            )}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {isCompressing ? (
            <div className="flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-600">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Memproses & mengompres foto...</span>
            </div>
          ) : !photoUrl ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Buka Kamera</span>
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-all active:scale-95 shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Galeri</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-xl border border-emerald-200/80 gap-2.5">
              <div
                onClick={() => setIsViewingPhoto(true)}
                className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-300 shrink-0 cursor-pointer shadow-2xs group"
              >
                <img src={photoUrl} alt="Bukti nota" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">Foto Bukti Terpasang</p>
                <p className="text-[10px] text-slate-500">Tersimpan otomatis bersama transaksi.</p>
                <button
                  type="button"
                  onClick={() => setIsViewingPhoto(true)}
                  className="text-[10px] text-emerald-700 font-semibold hover:underline mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Lihat Ukuran Penuh</span>
                </button>
              </div>

              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  title="Ganti Foto"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Ubah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(null)}
                  title="Hapus Foto"
                  className="p-1.5 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#127749] hover:bg-[#0a492d] active:scale-[0.99] text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none mt-1"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Simpan Transaksi{amount ? ` (Rp ${amount})` : ''}</span>
        </button>
      </form>

      {isViewingPhoto && photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-dropdown">
          <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full overflow-hidden shadow-2xl space-y-3 p-3.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">Foto Bukti Transaksi / Nota</h4>
              <button
                type="button"
                onClick={() => setIsViewingPhoto(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-100 flex items-center justify-center bg-slate-900">
              <img src={photoUrl} alt="Bukti transaksi penuh" className="max-w-full max-h-[65vh] object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setIsViewingPhoto(false)}
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
