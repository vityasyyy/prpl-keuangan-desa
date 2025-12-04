// This page fetches data on the server and renders the list view.
import Link from 'next/link';

/**
 * Fetches transaction data directly from our Backend API endpoint.
 * This runs on the server when the page is requested.
 */
async function getTransactions() {
  // Use environment variable for backend URL or default
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Default to 3001 if not set
  // Ensure the API path matches the backend router definition
  const apiUrl = `${backendUrl}/api/bank-desa`; // Use '/api/bank-desa'

  console.log(`Fetching transactions from: ${apiUrl}`);

  try {
    const res = await fetch(apiUrl, {
      cache: 'no-store', // Always get fresh data
      // headers: { 'Authorization': 'Bearer <token>' } // Add auth later
    });

    if (!res.ok) {
      // Improved error handling to show backend message if possible
      let errorBody = `HTTP error! status: ${res.status}`;
      try {
        const errData = await res.json();
        errorBody = errData.message || errData.error || JSON.stringify(errData);
      } catch (e) {
        errorBody = await res.text(); // Fallback to text if not JSON
      }
      throw new Error(`Failed to fetch transactions: ${errorBody}`);
    }

    const data = await res.json();
    console.log(`Successfully fetched ${data.length} transactions.`);
    return data;
  } catch (error) {
    console.error('Error in getTransactions:', error);
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

// --- Main Page Component ---
export default async function BukuBankPage() {
  const transactions = await getTransactions();

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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Buku Bank Desa</h1>
          <p className="text-gray-500 dark:text-gray-400">Desa Banguntapan - Tahun Anggaran 2025</p>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-600 transition-colors">
            Unduh File
          </button>
          <Link
            href="/buku-bank/input" // Link to the input page
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
            const txs = group.transactions;
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
                      [cite_start]{/* Table Headers matching Form C.6 [cite: 16] [cite_start]and Figma [cite: 27-40] */}
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
