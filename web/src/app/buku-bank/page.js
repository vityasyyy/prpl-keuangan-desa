'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReverseButton from '@/features/bank-desa/components/ReverseButton.jsx';
import DownloadButton from '@/features/bank-desa/components/DownloadButton.jsx';
import PageHeader from '@/features/bank-desa/components/PageHeader.jsx';
import MonthCard from '@/features/bank-desa/components/MonthCard.jsx';
import '@/features/bank-desa/styles/bank-desa.css';

// Helper to format currency
const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

// Simple heuristic to detect reversal entries
function isReversal(tx) {
  const keterangan = (tx.uraian || '').toUpperCase();
  const bukti = (tx.bukti_transaksi || '').toUpperCase();
  return keterangan.startsWith('[REVERSAL]') || bukti.endsWith('-REV');
}

// Loading fallback for Suspense
function LoadingSkeleton() {
  return (
    <div className="bank-desa-page px-[40px] py-[20px] min-h-screen bg-white">
      {/* Skeleton Header */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
      {/* Skeleton Month Cards */}
      <div className="flex flex-col gap-[10px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-[0.5px] border-gray-200 rounded-[30px] h-[66px] px-[25px] py-[17px] flex items-center animate-pulse">
            <div className="flex items-center gap-[10px] min-w-[180px]">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-32 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-center flex-1 gap-8">
              <div className="w-40 h-5 bg-gray-200 rounded"></div>
              <div className="w-40 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-[4px]">
              <div className="w-10 h-10 bg-gray-200 rounded-[8px]"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-[8px]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Inner Component that uses useSearchParams ---
function BukuBankContent() {
  const searchParams = useSearchParams();
  const hideReversals = searchParams.get('hideReversals') === '1' || searchParams.get('hideReversals') === 'true';
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch function extracted so it can be called on refresh
  const fetchTransactions = async () => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const apiUrl = `${API_BASE_URL}/bank-desa`;

    try {
      const res = await fetch(apiUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Anda harus login untuk mengakses halaman ini');
          return;
        }
        const raw = await res.text();
        let errorBody = `HTTP error! status: ${res.status}`;
        try {
          const errData = JSON.parse(raw);
          errorBody = errData.message || errData.error || JSON.stringify(errData);
        } catch (_) {
          errorBody = raw || errorBody;
        }
        throw new Error(errorBody);
      }

      const data = await res.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Function to refresh data (used after reversal)
  const refreshData = async () => {
    await fetchTransactions();
  };

  // Callback for when reversal succeeds
  const handleReversalSuccess = async () => {
    await fetchTransactions();
  };

  // Filter reversals if needed (for display only)
  const filteredTransactions = hideReversals
    ? transactions.filter((tx) => !isReversal(tx))
    : transactions;

  // --- Grouping Logic (for ALL transactions - used for totals) ---
  const allGroupedByMonth = transactions.reduce((acc, tx) => {
    try {
      const date = new Date(tx.tanggal);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });
      const monthLabel = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, transactions: [] };
      }
      acc[monthKey].transactions.push(tx);
    } catch (dateError) {
      console.error(`Skipping transaction ID ${tx.id} due to invalid date: ${tx.tanggal}`, dateError);
    }
    return acc;
  }, {});

  // --- Grouping Logic (for FILTERED transactions - used for display) ---
  const groupedByMonth = filteredTransactions.reduce((acc, tx) => {
    try {
      const date = new Date(tx.tanggal);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' });
      const monthLabel = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, transactions: [] };
      }
      acc[monthKey].transactions.push(tx);
    } catch (dateError) {
      console.error(`Skipping transaction ID ${tx.id} due to invalid date: ${tx.tanggal}`, dateError);
    }
    return acc;
  }, {});
  const sortedMonthKeys = Object.keys(groupedByMonth).sort().reverse();

  const latestMonth = sortedMonthKeys.length > 0 ? sortedMonthKeys[0] : null;

  if (loading) {
    return (
      <div className="bank-desa-page px-[40px] py-[20px] min-h-screen bg-white">
        {/* Skeleton Header */}
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {/* Skeleton Month Cards */}
        <div className="flex flex-col gap-[10px]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-[0.5px] border-gray-200 rounded-[30px] h-[66px] px-[25px] py-[17px] flex items-center animate-pulse">
              <div className="flex items-center gap-[10px] min-w-[180px]">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-32 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-center flex-1 gap-8">
                <div className="w-40 h-5 bg-gray-200 rounded"></div>
                <div className="w-40 h-5 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-[4px]">
                <div className="w-10 h-10 bg-gray-200 rounded-[8px]"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-[8px]"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bank-desa-page px-[40px] py-[20px] min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Klik untuk login
        </Link>
      </div>
    );
  }

  return (
    <div className="bank-desa-page px-[40px] py-[20px] min-h-screen bg-white">
      <PageHeader latestMonth={latestMonth} />

      <div className="flex flex-col gap-[10px]">
        {filteredTransactions.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
                Belum ada data transaksi.
             </div>
        ) : (
            sortedMonthKeys.map(monthKey => {
                const group = groupedByMonth[monthKey];
                // Get ALL transactions for this month (for calculating totals)
                const allTxsForMonth = allGroupedByMonth[monthKey]?.transactions || [];
                const allTxsSorted = [...allTxsForMonth].sort((a, b) => {
                    const da = new Date(a.tanggal).getTime();
                    const db = new Date(b.tanggal).getTime();
                    if (da !== db) return da - db;
                    if (a.created_at && b.created_at) {
                        const ca = new Date(a.created_at).getTime();
                        const cb = new Date(b.created_at).getTime();
                        if (ca !== cb) return ca - cb;
                    }
                    return 0;
                });

                // Get FILTERED transactions for display
                const txs = [...group.transactions].sort((a, b) => {
                    const da = new Date(a.tanggal).getTime();
                    const db = new Date(b.tanggal).getTime();
                    if (da !== db) return da - db;
                    if (a.created_at && b.created_at) {
                        const ca = new Date(a.created_at).getTime();
                        const cb = new Date(b.created_at).getTime();
                        if (ca !== cb) return ca - cb;
                    }
                    return 0;
                });

                // Calculate totals from ALL transactions (not filtered)
                const totalMasuk = allTxsSorted.reduce((sum, tx) => sum + (Number(tx.setoran) || 0) + (Number(tx.penerimaan_bunga) || 0), 0);
                const totalKeluar = allTxsSorted.reduce((sum, tx) => sum + (Number(tx.penarikan) || 0) + (Number(tx.pajak) || 0) + (Number(tx.biaya_admin) || 0), 0);
                const saldoKumulatif = allTxsSorted.length > 0 ? allTxsSorted[allTxsSorted.length - 1]?.saldo_after : 0;

                const mappedTxs = txs.map(tx => ({
                    id: tx.id,
                    rawDate: tx.tanggal,
                    date: new Date(tx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    description: tx.uraian,
                    proof_no: tx.bukti_transaksi || '-',
                    deposit: Number(tx.setoran) > 0 ? formatRupiah(tx.setoran) : '-',
                    interest: Number(tx.penerimaan_bunga) > 0 ? formatRupiah(tx.penerimaan_bunga) : '-',
                    withdrawal: Number(tx.penarikan) > 0 ? formatRupiah(tx.penarikan) : '-',
                    tax: Number(tx.pajak) > 0 ? formatRupiah(tx.pajak) : '-',
                    admin_fee: Number(tx.biaya_admin) > 0 ? formatRupiah(tx.biaya_admin) : '-',
                    balance: formatRupiah(tx.saldo_after)
                }));

                return (
                    <MonthCard 
                        key={monthKey}
                        monthKey={monthKey}
                        monthName={group.label}
                        totalMonth={formatRupiah(totalMasuk - totalKeluar)} 
                        totalCumulative={formatRupiah(saldoKumulatif)}
                        transactions={mappedTxs}
                        onReversalSuccess={refreshData}
                    />
                );
            })
        )}
      </div>
    </div>
  );
}

// --- Main Page Component wrapped in Suspense ---
export default function BukuBankPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BukuBankContent />
    </Suspense>
  );
}
