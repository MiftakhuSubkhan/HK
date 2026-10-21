'use client';

import React, { useState } from 'react';
import { CustomerSuggestion, DebtRecord } from '../types';
import { formatRupiah } from './SummaryCards';
import {
  Users,
  Search,
  Plus,
  FileText,
  X,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/date';

interface CustomersViewProps {
  customers: CustomerSuggestion[];
  debts: DebtRecord[];
  onAddCustomer: (customer: CustomerSuggestion) => void;
  onUpdateCustomer: (customer: CustomerSuggestion, oldName?: string) => void;
  onDeleteCustomer: (customerId: string, customerName: string) => void;
}

export function CustomersView({
  customers,
  debts,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}: CustomersViewProps) {
  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [editingCustomer, setEditingCustomer] = useState<CustomerSuggestion | null>(null);
  const [editName, setEditName] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [deletingCustomer, setDeletingCustomer] = useState<CustomerSuggestion | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.village.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query)
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomer({
      id: 'c-' + Date.now(),
      name: newName.trim(),
      village: newVillage.trim() || 'Desa Sidoharjo',
      phone: newPhone.trim() || '0812 0000 0000',
    });
    setNewName('');
    setNewVillage('');
    setNewPhone('');
    setShowAddModal(false);
  };

  const handleStartEdit = (c: CustomerSuggestion) => {
    setEditingCustomer(c);
    setEditName(c.name);
    setEditVillage(c.village);
    setEditPhone(c.phone);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editName.trim()) return;
    const oldName = editingCustomer.name;
    onUpdateCustomer(
      {
        ...editingCustomer,
        name: editName.trim(),
        village: editVillage.trim() || 'Desa Sidoharjo',
        phone: editPhone.trim() || '0812 0000 0000',
      },
      oldName
    );
    setEditingCustomer(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCustomer) return;
    onDeleteCustomer(deletingCustomer.id, deletingCustomer.name);
    setDeletingCustomer(null);
  };

  const deletingDebt = deletingCustomer
    ? debts.find((d) => d.customerName.toLowerCase() === deletingCustomer.name.toLowerCase())
    : null;

  return (
    <div className="flex-1 p-4 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Daftar Pelanggan Peternak</h2>
          <p className="text-[11px] text-slate-500">Total {customers.length} peternak terdaftar</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#127749] text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2.5 py-1.5 shadow-xs">
        <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari pelanggan / desa..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 text-center space-y-2 my-2 shadow-2xs">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Data Pelanggan</h4>
            <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              Daftar peternak masih kosong. Klik tombol &ldquo;Tambah&rdquo; di atas untuk mendaftarkan peternak baru.
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const customerDebt = debts.find((d) => d.customerName.toLowerCase() === c.name.toLowerCase());
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl p-3 border border-slate-100 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{c.name}</h4>
                    <p className="text-[10px] text-slate-500 truncate">{c.village} • {c.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-tight">Piutang:</span>
                    <span className={`text-xs font-bold ${customerDebt?.status === 'paid' ? 'text-slate-400 line-through' : 'text-emerald-700'}`}>
                      {customerDebt ? formatRupiah(customerDebt.totalAmount) : 'Rp 0'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 pl-2 border-l border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(c)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                      title="Ubah Data Peternak"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCustomer(c)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Hapus Peternak"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-dropdown">
          <div className="bg-white rounded-2xl p-4 w-full max-w-xs shadow-xl space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Tambah Peternak Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Pak Sukirno"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asal Desa / Dusun</label>
                <input
                  type="text"
                  placeholder="cth: Desa Karanganyar"
                  value={newVillage}
                  onChange={(e) => setNewVillage(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="cth: 0812 3456 7890"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600 font-mono"
                />
              </div>
              <div className="pt-1 space-y-1.5">
                <button
                  type="submit"
                  className="w-full bg-[#127749] text-white py-2 rounded-xl font-bold hover:bg-[#0a492d] cursor-pointer transition-all active:scale-98"
                >
                  Simpan Peternak
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-100 text-slate-700 py-1.5 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-dropdown">
          <div className="bg-white rounded-2xl p-4 w-full max-w-xs shadow-xl space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900">Ubah Data Peternak</h3>
              </div>
              <button onClick={() => setEditingCustomer(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Pak Sukirno"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asal Desa / Dusun</label>
                <input
                  type="text"
                  placeholder="cth: Desa Karanganyar"
                  value={editVillage}
                  onChange={(e) => setEditVillage(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  placeholder="cth: 0812 3456 7890"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 focus:outline-emerald-600 font-mono"
                />
              </div>
              <div className="pt-1 space-y-1.5">
                <button
                  type="submit"
                  className="w-full bg-[#127749] text-white py-2 rounded-xl font-bold hover:bg-[#0a492d] cursor-pointer transition-all active:scale-98"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="w-full bg-slate-100 text-slate-700 py-1.5 rounded-xl font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-dropdown">
          <div className="bg-white rounded-2xl p-4.5 w-full max-w-xs shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Hapus Peternak?</h3>
                <p className="text-[10.5px] text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
              <p>
                Apakah Anda yakin ingin menghapus data peternak <strong>&ldquo;{deletingCustomer.name}&rdquo;</strong>?
              </p>
              {deletingDebt && deletingDebt.totalAmount > 0 && deletingDebt.status !== 'paid' && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[10.5px] font-medium mt-1">
                  ⚠️ <strong>Perhatian:</strong> Peternak ini masih memiliki piutang aktif sebesar{' '}
                  <span className="font-bold text-red-700">{formatRupiah(deletingDebt.totalAmount)}</span>.
                  Menghapus peternak ini juga akan menghapus data piutang tersebut.
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-xs"
              >
                Ya, Hapus Peternak
              </button>
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TransactionsViewProps {
  debts: DebtRecord[];
  onDeleteDebt?: (debtId: string) => void;
}

export function TransactionsView({ debts, onDeleteDebt }: TransactionsViewProps) {
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);

  const targetDeletingDebt = deletingDebtId ? debts.find((d) => d.id === deletingDebtId) : null;

  const handleConfirmDelete = () => {
    if (deletingDebtId && onDeleteDebt) {
      onDeleteDebt(deletingDebtId);
      setDeletingDebtId(null);
    }
  };

  return (
    <div className="flex-1 p-4 pb-6 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Riwayat Transaksi Tempo</h2>
        <p className="text-[11px] text-slate-500">Semua pencatatan tempo pakan yang tersimpan</p>
      </div>

      <div className="space-y-2.5">
        {debts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-dashed border-slate-200 text-center space-y-2 my-2 shadow-2xs">
            <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Belum Ada Riwayat Transaksi</h4>
            <p className="text-[11px] text-slate-500 max-w-[240px] mx-auto leading-relaxed">
              Riwayat tempo akan otomatis tersimpan di sini begitu Anda memasukkan transaksi baru.
            </p>
          </div>
        ) : (
          debts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-3 border border-slate-100 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.customerName}</h4>
                  <p className="text-[10px] text-slate-500">{item.village}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                      item.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'paid' ? 'Lunas' : item.dueDateLabel}
                  </span>
                  <div className="text-[9px] text-slate-400 mt-0.5 font-medium space-y-0.5">
                    {item.startDate && (
                      <span>Mulai: {formatIndonesianDate(item.startDate, false)}</span>
                    )}
                    {item.dueDate && item.status !== 'paid' && (
                      <span className="block text-emerald-800 font-semibold">
                        Tempo: {formatIndonesianDate(item.dueDate, false)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {item.feedItems && item.feedItems.length > 0 && (
                <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                  {item.feedItems.map((f, i) => (
                    <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded">
                      {f.type} ({f.bags} karung)
                    </span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Total Transaksi:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">{formatRupiah(item.totalAmount)}</span>
                  {onDeleteDebt && (
                    <button
                      type="button"
                      onClick={() => setDeletingDebtId(item.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                      title="Hapus Transaksi Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {targetDeletingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-dropdown">
          <div className="bg-white rounded-2xl p-4.5 w-full max-w-xs shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Hapus Transaksi?</h3>
                <p className="text-[10.5px] text-slate-500">Catatan tempo ini akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              Apakah Anda yakin ingin menghapus catatan piutang atas nama{' '}
              <strong>{targetDeletingDebt.customerName}</strong> sebesar{' '}
              <strong className="text-emerald-800">{formatRupiah(targetDeletingDebt.totalAmount)}</strong>?
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-xs"
              >
                Ya, Hapus Transaksi
              </button>
              <button
                type="button"
                onClick={() => setDeletingDebtId(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
