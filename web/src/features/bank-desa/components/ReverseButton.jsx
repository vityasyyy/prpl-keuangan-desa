"use client";

import { useState } from 'react';
import { useToast } from './Toast';

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export default function ReverseButton({ id, tanggal, backendUrl, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const base = backendUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const onReverse = async () => {
    if (!id) return;
    if (!confirm('Buat transaksi pembalik untuk baris ini?')) return;
    
    setIsLoading(true);
    const qs = tanggal ? `?tanggal=${encodeURIComponent(String(tanggal).slice(0,10))}` : '';
    try {
      const res = await fetch(`${base}/bank-desa/${id}${qs}`, { 
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const raw = await res.text().catch(() => 'Gagal membuat pembalik');
        addToast(raw, 'error');
        return;
      }
      addToast('Transaksi pembalik berhasil dibuat', 'success');
      // Call the success callback to refresh data
      if (onSuccess) {
        await onSuccess();
      }
    } catch (e) {
      addToast('Gagal terhubung ke server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button" 
      onClick={onReverse}
      disabled={isLoading}
      className="bg-red-100 text-red-600 border border-red-200 rounded-[8px] px-3 py-2 flex items-center justify-center gap-2 font-medium text-[12px] hover:bg-red-200 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
      title="Buat Transaksi Pembalik"
    >
      <TrashIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      <span>{isLoading ? 'Memproses...' : 'Reversal'}</span>
    </button>
  );
}
