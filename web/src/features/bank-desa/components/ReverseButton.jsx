"use client";

import { useRouter } from 'next/navigation';

export default function ReverseButton({ id, tanggal, backendUrl }) {
  const router = useRouter();
  const base = backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

  const onReverse = async () => {
    if (!id) return;
    if (!confirm('Buat transaksi pembalik untuk baris ini?')) return;
    const qs = tanggal ? `?tanggal=${encodeURIComponent(String(tanggal).slice(0,10))}` : '';
    try {
      const res = await fetch(`${base}/api/bank-desa/${id}${qs}`, { method: 'DELETE' });
      if (!res.ok) {
        const raw = await res.text().catch(() => 'Gagal membuat pembalik');
        alert(raw);
        return;
      }
      router.refresh();
    } catch (e) {
      alert('Gagal terhubung ke server.');
    }
  };

  return (
    <button type="button" onClick={onReverse} className="text-red-500 hover:text-red-400 text-xs">
      Hapus (pembalik)
    </button>
  );
}
