"use client"; // REQUIRED for client-side interactivity

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Reusable Input Field Component
 */
const InputField = ({ label, id, type, value, onChange, placeholder = '', required = false, disabled = false, min }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} id={id} name={id} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required} disabled={disabled}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
      min={min}
    />
  </div>
);

/**
 * Form for inputting Buku Bank transactions.
 */
export default function BukuBankForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [makeAgain, setMakeAgain] = useState(false);

  // Form state
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nomorRekening] = useState('1234-56-789012-3'); // Placeholder
  const [cabangBank] = useState('Cabang Sleman');   // Placeholder
  const [uraian, setUraian] = useState('');
  const [setoran, setSetoran] = useState('');
  const [penerimaanBunga, setPenerimaanBunga] = useState('');
  const [penarikan, setPenarikan] = useState('');
  const [pajak, setPajak] = useState('');
  const [biayaAdmin, setBiayaAdmin] = useState('');
  const [buktiTransaksi, setBuktiTransaksi] = useState('');
  const [saldo] = useState('Auto-calculated'); // Placeholder

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
      tanggal, uraian, bukti_transaksi: buktiTransaksi,
      setoran: Number(setoran) || 0, penerimaan_bunga: Number(penerimaanBunga) || 0,
      penarikan: Number(penarikan) || 0, pajak: Number(pajak) || 0,
      biaya_admin: Number(biayaAdmin) || 0,
    };
    console.log('(Client-side) Submitting to /api/bank-desa:', formData);

    try {
      // Client-side fetch automatically includes cookies (usually).
      // Use relative path '/api/bank-desa'
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
      const response = await fetch(`${backendUrl}/api/bank-desa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        // credentials: 'include', // Uncomment if needed for CORS/cookie issues
      });

      if (response.status === 401) { throw new Error('Unauthorized. Sesi Anda mungkin telah berakhir.'); }
      if (!response.ok) {
        // Read body ONCE, then try JSON parse from text to avoid double-read errors
        const raw = await response.text();
        let errorMsg = `HTTP error ${response.status}`;
        try { const errData = JSON.parse(raw); errorMsg = errData.message || JSON.stringify(errData); }
        catch { errorMsg = raw || errorMsg; }
        throw new Error(errorMsg);
      }

      console.log('Form submitted successfully!');
      if (makeAgain) {
        // Stay on page and clear numeric fields for fast next entry
        setSetoran('');
        setPenerimaanBunga('');
        setPenarikan('');
        setPajak('');
        setBiayaAdmin('');
        setBuktiTransaksi('');
        setIsLoading(false);
        return; // do not navigate
      }
      router.push('/buku-bank'); // Redirect back to list

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Gagal menyimpan data.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-background dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
      {/* Section 1: Detail & Bank Detail */}
      <fieldset className="space-y-4 p-4 border dark:border-gray-600 rounded-lg">
        <legend className="text-base font-semibold px-2 text-gray-700 dark:text-gray-300">Detail Transaksi</legend>
        <InputField label="Tanggal" id="tanggal" type="date" value={tanggal} onChange={setTanggal} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nomor Rekening" id="nomorRekening" type="text" value={nomorRekening} onChange={() => {}} disabled />
          <InputField label="Cabang Bank" id="cabangBank" type="text" value={cabangBank} onChange={() => {}} disabled />
        </div>
        <InputField label="Uraian Transaksi" id="uraian" type="text" value={uraian} onChange={setUraian} placeholder="Mis: Setoran Dana Desa Tahap 1" required />
      </fieldset>

      {/* Section 2: Pemasukan */}
      <fieldset className="space-y-4 p-4 border dark:border-gray-600 rounded-lg">
        <legend className="text-base font-semibold px-2 text-gray-700 dark:text-gray-300">Pemasukan</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Setoran" id="setoran" type="number" value={setoran} onChange={setSetoran} placeholder="Rp 0" min="0"/>
          <InputField label="Bunga Bank" id="penerimaanBunga" type="number" value={penerimaanBunga} onChange={setPenerimaanBunga} placeholder="Rp 0" min="0"/>
        </div>
      </fieldset>

      {/* Section 3: Pengeluaran */}
      <fieldset className="space-y-4 p-4 border dark:border-gray-600 rounded-lg">
         <legend className="text-base font-semibold px-2 text-gray-700 dark:text-gray-300">Pengeluaran</legend>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Penarikan" id="penarikan" type="number" value={penarikan} onChange={setPenarikan} placeholder="Rp 0" min="0"/>
            <InputField label="Pajak" id="pajak" type="number" value={pajak} onChange={setPajak} placeholder="Rp 0" min="0"/>
            <InputField label="Biaya Administrasi" id="biayaAdmin" type="number" value={biayaAdmin} onChange={setBiayaAdmin} placeholder="Rp 0" min="0"/>
         </div>
      </fieldset>

      {/* Section 4: Bukti dan Kumulatif */}
      <fieldset className="space-y-4 p-4 border dark:border-gray-600 rounded-lg">
        <legend className="text-base font-semibold px-2 text-gray-700 dark:text-gray-300">Bukti dan Kumulatif</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Bukti Transaksi" id="buktiTransaksi" type="text" value={buktiTransaksi} onChange={setBuktiTransaksi} placeholder="No. 12345" />
          <InputField label="Saldo (Kumulatif)" id="saldo" type="text" value={saldo} onChange={() => {}} disabled />
        </div>
      </fieldset>

      {/* Error Display */}
      {error && (
        <div className="my-4 text-center text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <strong>Gagal menyimpan:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-600">
        <label className="flex items-center gap-2 mr-auto text-sm">
          <input type="checkbox" checked={makeAgain} onChange={(e) => setMakeAgain(e.target.checked)} />
          <span>Tetap di form (Make again)</span>
        </label>
        <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}