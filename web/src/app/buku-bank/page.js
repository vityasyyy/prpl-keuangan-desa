// This page fetches data on the server and renders the list view.
import Link from 'next/link';
import ReverseButton from '@/features/bank-desa/components/ReverseButton.jsx';
import DownloadButton from '@/features/bank-desa/components/DownloadButton.jsx';

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

  return (
    // Main container
    <div className="p-4 md:p-8 max-w-full lg:max-w-7xl mx-auto text-foreground dark:text-gray-200">
      {/* Page Header (reverted to Tailwind utilities) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Buku Bank Desa</h1>
          <p className="text-gray-500 dark:text-gray-400">Desa Banguntapan - Tahun Anggaran 2025</p>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Link
            href={hideReversals ? '/buku-bank' : '/buku-bank?hideReversals=1'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
          >
            {hideReversals ? 'Tampilkan Reversal' : 'Sembunyikan Reversal'}
          </Link>
          <DownloadButton latestMonth={sortedMonthKeys[0]} />
          <Link
            href="/buku-bank/input"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
          >
            + Input Data
          </Link>
        </div>
      </div>

      {/* Monthly Transaction Sections */}
      <div className="space-y-6">
        {transactions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-10 bg-background dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
            Belum ada data transaksi bank yang dapat ditampilkan.
          </div>
        ) : (
          sortedMonthKeys.map((monthKey) => {
            const group = groupedByMonth[monthKey];
            // Sort transactions within a month by date asc, then created_at asc if available, as a stable chronological order
            const txs = [...group.transactions].sort((a, b) => {
              const da = new Date(a.tanggal).getTime();
              const db = new Date(b.tanggal).getTime();
              if (da !== db) return da - db;
              // tie-breaker using created_at if present (from backend), else leave stable
              if (a.created_at && b.created_at) {
                const ca = new Date(a.created_at).getTime();
                const cb = new Date(b.created_at).getTime();
                if (ca !== cb) return ca - cb;
              }
              return 0;
            });
            const totalMasuk = txs.reduce((sum, tx) => sum + (Number(tx.setoran) || 0) + (Number(tx.penerimaan_bunga) || 0), 0);
            const totalKeluar = txs.reduce((sum, tx) => sum + (Number(tx.penarikan) || 0) + (Number(tx.pajak) || 0) + (Number(tx.biaya_admin) || 0), 0);
            const saldoKumulatif = txs.length > 0 ? txs[txs.length - 1]?.saldo_after : 0;

            return (
              // Collapsible section for each month
              <details key={monthKey} className="bg-background dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden group" open>
                <summary className="p-4 list-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-center">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold">{group.label}</h2>
                    <div className="flex flex-wrap gap-x-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>Masuk: <span className="text-green-600 font-medium">{formatRupiah(totalMasuk)}</span></span>
                      <span>Keluar: <span className="text-red-600 font-medium">{formatRupiah(totalKeluar)}</span></span>
                      <span>Saldo Akhir: <span className="font-medium">{formatRupiah(saldoKumulatif)}</span></span>
                    </div>
                  </div>
                  <span className="text-xl text-gray-400 group-open:rotate-180 transform transition-transform duration-200">▼</span>
                </summary>

                {/* Transaction Table */}
                <div className="overflow-x-auto border-t dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uraian</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bukti</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Setoran</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bunga</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Penarikan</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pajak</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Biaya Adm</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {txs.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{new Date(tx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                          <td className="px-3 py-2 text-xs max-w-xs truncate" title={tx.uraian}>{tx.uraian}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{tx.bukti_transaksi || '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-green-600">{Number(tx.setoran) > 0 ? formatRupiah(tx.setoran) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-green-600">{Number(tx.penerimaan_bunga) > 0 ? formatRupiah(tx.penerimaan_bunga) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-red-600">{Number(tx.penarikan) > 0 ? formatRupiah(tx.penarikan) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-red-600">{Number(tx.pajak) > 0 ? formatRupiah(tx.pajak) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right text-red-600">{Number(tx.biaya_admin) > 0 ? formatRupiah(tx.biaya_admin) : '-'}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right font-medium">{formatRupiah(tx.saldo_after)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs text-right">
                            {/* Reversal button */}
                            <ReverseButton id={tx.id} tanggal={tx.tanggal} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}