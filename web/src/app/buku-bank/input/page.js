import BukuBankForm from '@/features/bank-desa/components/forms/BukuBankForm.js';
import Link from 'next/link';

export default function InputBukuBankPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-foreground dark:text-gray-200">
      <div className="mb-6">
        <Link href="/buku-bank" className="text-blue-600 hover:underline text-sm font-medium">
          &larr; Kembali ke Daftar Buku Bank
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold mt-2 font-[var(--font-poppins)] text-black">Input Data Transaksi Bank</h1>
      </div>
      
      {/* Render the actual form component */}
      <BukuBankForm />
    </div>
  );
}