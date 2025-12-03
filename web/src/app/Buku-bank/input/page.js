// This page simply renders the form component.
import BukuBankForm from '../../components/forms/BukuBankForm.js'; // Adjust path if needed
import Link from 'next/link';

export default function InputBukuBankPage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto text-foreground dark:text-gray-200">
      {/* Navigation and Title */}
      <div className="mb-6">
        <Link href="/buku-bank" className="text-blue-500 hover:underline text-sm">
          &larr; Kembali ke Daftar Buku Bank
        </Link>
        {/* Title matches the breadcrumb in image_e050d3.jpg */}
        <h1 className="text-2xl md:text-3xl font-bold mt-1">Input Data Transaksi Bank</h1>
      </div>

      {/* Render the actual form component */}
      <BukuBankForm />
    </div>
  );
}