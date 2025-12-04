"use client"; // REQUIRED for client-side interactivity

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../Toast';

// Icons
const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ToggleLeftIcon = ({ checked }) => (
  <svg width="44" height="24" viewBox="0 0 44 24" fill="none" className="cursor-pointer">
    <rect width="44" height="24" rx="12" fill={checked ? "#2563EB" : "#4B5563"} className="transition-colors duration-200" />
    <circle cx={checked ? 32 : 12} cy="12" r="10" fill="white" className="transition-all duration-200" />
  </svg>
);

// Helper to format currency input
const formatCurrencyInput = (val) => {
  if (!val) return '';
  const num = val.replace(/\D/g, '');
  if (!num) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

// Helper to parse currency input back to number
const parseCurrencyInput = (val) => {
  if (!val) return 0;
  return Number(val.replace(/\./g, '').replace(/,/g, '.'));
};

/**
 * Reusable Input Field Component matching Figma design
 */
const InputField = ({ label, id, type, value, onChange, placeholder = '', required = false, disabled = false, min, prefix, icon, isCurrency = false }) => {
  const handleChange = (e) => {
    let val = e.target.value;
    if (isCurrency) {
      val = formatCurrencyInput(val);
    }
    onChange(val);
  };

  return (
    <div className="flex flex-col gap-[8px] w-full">
      <label htmlFor={id} className="font-[var(--font-inter)] font-bold text-[16px] md:text-[18px] leading-[24px] text-black">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className={`bg-white border border-solid border-black rounded-[8px] w-full overflow-hidden ${disabled ? 'bg-gray-200 cursor-not-allowed' : ''}`}>
        <div className="flex items-center px-[14px] py-[12px] gap-[8px]">
          {prefix && (
            <span className="font-[var(--font-inter)] font-semibold text-[16px] md:text-[18px] leading-[24px] text-black border-r border-black pr-3 mr-1">
              {prefix}
            </span>
          )}
          {icon && (
            <div className="shrink-0 text-black">
              {icon}
            </div>
          )}
          <input
            type={isCurrency ? "text" : type}
            id={id}
            name={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            className="w-full font-[var(--font-inter)] font-bold text-[16px] md:text-[18px] leading-[24px] !text-black placeholder-gray-900 outline-none bg-transparent disabled:!text-black disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Section Container Component
 */
const FormSection = ({ title, children }) => (
  <div className="border-[#4b5565] border-[0.5px] border-solid rounded-[30px] px-[20px] py-[30px] flex flex-col gap-[20px] w-full bg-white">
    <p className="font-[var(--font-plus-jakarta-sans)] font-normal text-[16px] md:text-[18px] leading-[24px] text-black">
      {title}
    </p>
    {children}
  </div>
);

/**
 * Form for inputting Buku Bank transactions.
 */
export default function BukuBankForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [makeAgain, setMakeAgain] = useState(false);

  // Form state
  const [tanggal, setTanggal] = useState('');
  const [nomorRekening] = useState('1234-56-789012-3'); // Placeholder
  const [cabangBank] = useState('Cabang Sleman');   // Placeholder
  const [uraian, setUraian] = useState('');
  const [setoran, setSetoran] = useState('');

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setTanggal(dateParam);
    } else {
      setTanggal(new Date().toISOString().split('T')[0]);
    }
  }, [searchParams]);
  const [penerimaanBunga, setPenerimaanBunga] = useState('');
  const [penarikan, setPenarikan] = useState('');
  const [pajak, setPajak] = useState('');
  const [biayaAdmin, setBiayaAdmin] = useState('');
  const [buktiTransaksi, setBuktiTransaksi] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = {
      tanggal, uraian, bukti_transaksi: buktiTransaksi,
      setoran: parseCurrencyInput(setoran), 
      penerimaan_bunga: parseCurrencyInput(penerimaanBunga),
      penarikan: parseCurrencyInput(penarikan), 
      pajak: parseCurrencyInput(pajak),
      biaya_admin: parseCurrencyInput(biayaAdmin),
    };
    console.log('(Client-side) Submitting to /api/bank-desa:', formData);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/bank-desa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send cookies for authentication
        body: JSON.stringify(formData),
      });

      if (response.status === 401) { throw new Error('Unauthorized. Sesi Anda mungkin telah berakhir.'); }
      if (!response.ok) {
        const raw = await response.text();
        let errorMsg = `HTTP error ${response.status}`;
        try { const errData = JSON.parse(raw); errorMsg = errData.message || JSON.stringify(errData); }
        catch { errorMsg = raw || errorMsg; }
        throw new Error(errorMsg);
      }

      console.log('Form submitted successfully!');
      addToast('Transaksi berhasil disimpan', 'success');
      
      if (makeAgain) {
        setSetoran('');
        setPenerimaanBunga('');
        setPenarikan('');
        setPajak('');
        setBiayaAdmin('');
        setBuktiTransaksi('');
        setUraian('');
        setIsLoading(false);
        return;
      }
      router.push('/buku-bank');

    } catch (err) {
      console.error('Form submission error:', err);
      setError(err.message || 'Gagal menyimpan data.');
      addToast(err.message || 'Gagal menyimpan data', 'error');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[29px] w-full max-w-4xl mx-auto pb-10">
      
      {/* Section 1: Detail */}
      <FormSection title="Detail">
        <div className="flex flex-col md:flex-row gap-[20px] w-full">
          <InputField 
            label="Tanggal" 
            id="tanggal" 
            type="date" 
            value={tanggal} 
            onChange={setTanggal} 
            required 
            icon={<MailIcon />}
          />
          <InputField 
            label="Uraian" 
            id="uraian" 
            type="text" 
            value={uraian} 
            onChange={setUraian} 
            placeholder="Uraian Transaksi" 
            required 
          />
        </div>
        
        <div className="flex flex-col gap-[6px] w-full">
          <label className="font-[var(--font-inter)] font-medium text-[14px] md:text-[16px] leading-[20px] text-[#011829]">
            Bank Detail
          </label>
          <div className="flex flex-col md:flex-row gap-[20px] w-full">
            <div className="w-full md:w-1/2">
              <div className="bg-white border border-solid border-gray-600 rounded-[8px] overflow-hidden bg-gray-200">
                <div className="flex items-center px-[14px] py-[12px] gap-[8px]">
                  <input
                    type="text"
                    value={nomorRekening}
                    disabled
                    className="w-full font-[var(--font-inter)] font-medium text-[16px] leading-[24px] text-black bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-white border border-solid border-gray-600 rounded-[8px] overflow-hidden bg-gray-200">
                <div className="flex items-center px-[14px] py-[12px] gap-[8px]">
                  <input
                    type="text"
                    value={cabangBank}
                    disabled
                    className="w-full font-[var(--font-inter)] font-medium text-[16px] leading-[24px] text-black bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 2: Pemasukan */}
      <FormSection title="Pemasukan">
        <div className="flex flex-col md:flex-row gap-[20px] w-full">
          <InputField 
            label="Setoran" 
            id="setoran" 
            type="text" 
            value={setoran} 
            onChange={setSetoran} 
            placeholder="0" 
            min="0"
            prefix="Rp"
            isCurrency={true}
          />
          <InputField 
            label="Bunga Bank" 
            id="penerimaanBunga" 
            type="text" 
            value={penerimaanBunga} 
            onChange={setPenerimaanBunga} 
            placeholder="0" 
            min="0"
            prefix="Rp"
            isCurrency={true}
          />
        </div>
      </FormSection>

      {/* Section 3: Pengeluaran */}
      <FormSection title="Pengeluaran">
        <div className="flex flex-col md:flex-row gap-[20px] w-full">
          <InputField 
            label="Penarikan" 
            id="penarikan" 
            type="text" 
            value={penarikan} 
            onChange={setPenarikan} 
            placeholder="0" 
            min="0"
            prefix="Rp"
            isCurrency={true}
          />
          <InputField 
            label="Pajak" 
            id="pajak" 
            type="text" 
            value={pajak} 
            onChange={setPajak} 
            placeholder="0" 
            min="0"
            prefix="Rp"
            isCurrency={true}
          />
          <InputField 
            label="Biaya Administrasi" 
            id="biayaAdmin" 
            type="text" 
            value={biayaAdmin} 
            onChange={setBiayaAdmin} 
            placeholder="0" 
            min="0"
            prefix="Rp"
            isCurrency={true}
          />
        </div>
      </FormSection>

      {/* Section 4: Bukti dan Kumulatif */}
      <FormSection title="Bukti dan Kumulatif">
        <div className="flex flex-col md:flex-row gap-[20px] w-full">
          <InputField 
            label="Bukti Transaksi" 
            id="buktiTransaksi" 
            type="text" 
            value={buktiTransaksi} 
            onChange={setBuktiTransaksi} 
            placeholder="12345" 
            prefix="No"
          />
          <InputField 
            label="Saldo" 
            id="saldo" 
            type="text" 
            value="Terkalkulasi otomatis" 
            onChange={() => {}} 
            disabled 
            icon={<LockIcon />}
          />
        </div>
      </FormSection>

      {/* Error Display */}
      {error && (
        <div className="text-center text-red-600 text-sm p-3 bg-red-100 border border-red-300 rounded-lg">
          <strong>Gagal menyimpan:</strong> {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between w-full mt-4">
        {/* Left: Delete/Reset Button */}
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="bg-red-600 border border-red-600 rounded-[8px] px-[18px] py-[10px] flex items-center gap-[8px] hover:bg-red-700 transition-colors"
        >
          <span className="font-[var(--font-inter)] font-medium text-[16px] leading-[24px] text-white">Hapus</span>
          <TrashIcon />
        </button>

        {/* Right: Toggle & Save */}
        <div className="flex items-center gap-[20px]">
          <label className="flex items-center gap-[10px] cursor-pointer select-none">
            <span className="font-[var(--font-plus-jakarta-sans)] font-normal text-[16px] leading-[24px] text-black">Buat lagi</span>
            <div>
              <ToggleLeftIcon checked={makeAgain} />
            </div>
            <input 
              type="checkbox" 
              checked={makeAgain} 
              onChange={(e) => setMakeAgain(e.target.checked)} 
              className="hidden" 
            />
          </label>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="bg-[#0479ce] border border-[#0479ce] rounded-[8px] px-[18px] py-[10px] flex items-center gap-[8px] min-w-[170px] justify-center hover:bg-[#0360a4] transition-colors disabled:opacity-50"
          >
            <span className="font-[var(--font-inter)] font-medium text-[16px] leading-[24px] text-white">
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </span>
            <SaveIcon />
          </button>
        </div>
      </div>
    </form>
  );
}
