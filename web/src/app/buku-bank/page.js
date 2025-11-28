// This page fetches data on the server and renders the list view.
import Link from 'next/link';
import ReverseButton from '@/features/bank-desa/components/ReverseButton.jsx';
import DownloadButton from '@/features/bank-desa/components/DownloadButton.jsx';
import PageHeader from '@/features/bank-desa/components/PageHeader.jsx';
import MonthCard from '@/features/bank-desa/components/MonthCard.jsx';

/**
 * Fetches transaction data directly from our Backend API endpoint.
 * This runs on the server when the page is requested.
 */
// Tiny fetch helper with retries to smooth out transient dev restarts
async function fetchWithRetry(url, options = {}, attempts = 3, backoffMs = 250) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastErr = err;
      // brief backoff before retrying
      await new Promise((r) => setTimeout(r, backoffMs * (i + 1)));
    }
  }
  throw lastErr;
}

async function getTransactions() {
  // Use environment variable for backend URL or default
  // Prefer env var; default to backend dev port 8081
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
  // Ensure the API path matches the backend router definition
  const apiUrl = `${backendUrl}/api/bank-desa`; // Use '/api/bank-desa'

  console.log(`Fetching transactions from: ${apiUrl}`);

  try {
    const res = await fetchWithRetry(apiUrl, {
      cache: 'no-store', // Always get fresh data
      // headers: { 'Authorization': 'Bearer <token>' } // Add auth later
    });

    if (!res.ok) {
      // Read body ONCE, then attempt to parse JSON from text
      const raw = await res.text();
      let errorBody = `HTTP error! status: ${res.status}`;
      try {
        const errData = JSON.parse(raw);
        errorBody = errData.message || errData.error || JSON.stringify(errData);
      } catch (_) {
        errorBody = raw || errorBody;
      }
      throw new Error(`Failed to fetch transactions: ${errorBody}`);
    }

    const data = await res.json();
    console.log(`Successfully fetched ${data.length} transactions.`);
    return data;
  } catch (error) {
    // Quieter in dev to avoid noisy overlay; keep a concise warning
    if (process.env.NODE_ENV !== 'production') {
      console.warn('getTransactions: backend fetch failed, showing cached/empty data');
    }
    // Return empty array on error so the page can still render
    return [];
  }
}

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

// --- Main Page Component ---
export default async function BukuBankPage({ searchParams }) {
  // Next.js 15: searchParams is async
  const sp = await searchParams;
  const hideReversals = (
    sp?.hideReversals === '1' ||
    sp?.hideReversals === 'true'
  );

  const transactionsRaw = await getTransactions();
  const transactions = hideReversals
    ? transactionsRaw.filter((tx) => !isReversal(tx))
    : transactionsRaw;

  // --- Grouping Logic ---
  const groupedByMonth = transactions.reduce((acc, tx) => {
    try {
      const date = new Date(tx.tanggal);
      if (isNaN(date.getTime())) throw new Error('Invalid date'); // Basic date validation
      const monthKey = date.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit' }); // "YYYY-MM"
      const monthLabel = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' }); // "Oktober 2025"

      if (!acc[monthKey]) {
        acc[monthKey] = { label: monthLabel, transactions: [] };
      }
      acc[monthKey].transactions.push(tx);
    } catch (dateError) {
      console.error(`Skipping transaction ID ${tx.id} due to invalid date: ${tx.tanggal}`, dateError);
    }
    return acc;
  }, {});
  const sortedMonthKeys = Object.keys(groupedByMonth).sort().reverse(); // Show newest month first
  // --- End Grouping Logic ---

  const latestMonth = sortedMonthKeys.length > 0 ? sortedMonthKeys[0] : null;

  return (
    <div className="px-[40px] py-[20px] min-h-screen bg-white">
      <PageHeader latestMonth={latestMonth} />

      <div className="flex flex-col gap-[10px]">
        {transactions.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
                Belum ada data transaksi.
             </div>
        ) : (
            sortedMonthKeys.map(monthKey => {
                const group = groupedByMonth[monthKey];
                // Sort transactions
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

                // Calculate totals
                const totalMasuk = txs.reduce((sum, tx) => sum + (Number(tx.setoran) || 0) + (Number(tx.penerimaan_bunga) || 0), 0);
                const totalKeluar = txs.reduce((sum, tx) => sum + (Number(tx.penarikan) || 0) + (Number(tx.pajak) || 0) + (Number(tx.biaya_admin) || 0), 0);
                const saldoKumulatif = txs.length > 0 ? txs[txs.length - 1]?.saldo_after : 0;

                // Map to MonthCard format
                const mappedTxs = txs.map(tx => {
                    return {
                        id: tx.id,
                        rawDate: tx.tanggal,
                        date: new Date(tx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                        description: tx.uraian,
                        proof_no: tx.bukti_transaksi || '-',
                        
                        // Pemasukan
                        deposit: Number(tx.setoran) > 0 ? formatRupiah(tx.setoran) : '-',
                        interest: Number(tx.penerimaan_bunga) > 0 ? formatRupiah(tx.penerimaan_bunga) : '-',
                        
                        // Pengeluaran
                        withdrawal: Number(tx.penarikan) > 0 ? formatRupiah(tx.penarikan) : '-',
                        tax: Number(tx.pajak) > 0 ? formatRupiah(tx.pajak) : '-',
                        admin_fee: Number(tx.biaya_admin) > 0 ? formatRupiah(tx.biaya_admin) : '-',
                        
                        balance: formatRupiah(tx.saldo_after)
                    };
                });

                return (
                    <MonthCard 
                        key={monthKey}
                        monthKey={monthKey}
                        monthName={group.label}
                        totalMonth={formatRupiah(totalMasuk - totalKeluar)} 
                        totalCumulative={formatRupiah(saldoKumulatif)}
                        transactions={mappedTxs}
                    />
                );
            })
        )}
      </div>
    </div>
  );
}