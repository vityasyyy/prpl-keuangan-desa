"use client"; // REQUIRED for components with state and event handlers

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after success

/**
 * Reusable Input Field Component for the form
 */
const InputField = ({ label, id, type, value, onChange, placeholder = '', required = false, disabled = false, min }) => (
  <div className="mb-4"> {/* Added margin bottom for spacing */}
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white ${disabled ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
      min={min} // Pass min attribute for number inputs
    />
  </div>
);


/**
 * The main form component for inputting Buku Bank transactions.
 * [cite_start]Corresponds to lo-fi image_e050d3.jpg and Sprint 2 Report fields [cite: 41-54].
 */
export default function BukuBankForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for each form field (matches image_e050d3.jpg)
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nomorRekening] = useState('1234-56-789012-3'); // Placeholder - make dynamic later
  const [cabangBank] = useState('Cabang Sleman');   // Placeholder - make dynamic later
  const [uraian, setUraian] = useState('');
  const [setoran, setSetoran] = useState('');
  const [penerimaanBunga, setPenerimaanBunga] = useState('');
  const [penarikan, setPenarikan] = useState('');
  const [pajak, setPajak] = useState('');
  const [biayaAdmin, setBiayaAdmin] = useState('');
  const [buktiTransaksi, setBuktiTransaksi] = useState('');
  const [saldo] = useState('100.000.000,00'); // Placeholder - make dynamic later

  /**
   * Handles the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
      tanggal,
      uraian,
      bukti_transaksi: buktiTransaksi,
      setoran: Number(setoran) || 0,
      penerimaan_bunga: Number(penerimaanBunga) || 0,
      penarikan: Number(penarikan) || 0,
      pajak: Number(pajak) || 0,
      biaya_admin: Number(biayaAdmin) || 0,
    };

    console.log('Submitting form data to /api/bank-desa:', formData);

    try {
      // Use relative URL for client-side fetch
      const response = await fetch('/api/bank-desa', { // Correct API path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || JSON.stringify(errData);
        } catch { /* Ignore if response not JSON */ }
        throw new Error(errorMsg);
      }

      console.log('Form submitted successfully!');
      router.push('/buku-bank'); // Go back to the list page on success

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
      setIsLoading(false);
    }
  };

  return (
    // Form container styled to somewhat match the image
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

      {/* Error Display Area */}
      {error && (
        <div className="my-4 text-center text-red-600 dark:text-red-400 text-sm p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
          <strong>Gagal menyimpan:</strong> {error}
        </div>
      )}

      {/* Action Buttons (Matches image_e050d3.jpg) */}
      <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-600">
        <button
          type="button" // Important: Prevents accidental submission
          // No delete functionality specified yet, so maybe just Cancel/Back
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
          onClick={() => router.back()} // Go back to previous page
        >
          {/* Hapus */} Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}