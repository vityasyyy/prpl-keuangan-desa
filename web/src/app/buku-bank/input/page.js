import { Suspense } from 'react';
import BukuBankForm from '@/features/bank-desa/components/forms/BukuBankForm.js';
import Link from 'next/link';
import '@/features/bank-desa/styles/bank-desa.css';

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

const BreadcrumbIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

const BookIcon = ({ className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 19.5V4.5H18.5C19.3284 4.5 20 5.17157 20 6V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 19.5H18.5C19.3284 19.5 20 18.8284 20 18V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2V4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function InputBukuBankPage() {
  return (
    <div className="bank-desa-page p-4 md:p-8 max-w-4xl mx-auto text-foreground dark:text-gray-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[#6B7280] text-[14px] font-medium mb-6">
        <BreadcrumbIcon className="w-5 h-5 text-[#6B7280]" />
        <BookIcon className="w-5 h-5 text-[#6B7280]" />
        <span>Penatausahaan</span>
        <span>{'>'}</span>
        <Link href="/buku-bank" className="hover:underline">Buku Bank Desa</Link>
        <span>{'>'}</span>
        <span className="text-[#2563EB] underline cursor-pointer">Input Data Transaksi Bank</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mt-2 font-poppins text-black">Input Data Transaksi Bank</h1>
      </div>
      
      {/* Render the actual form component wrapped in Suspense */}
      <Suspense fallback={<LoadingSkeleton />}>
        <BukuBankForm />
      </Suspense>
    </div>
  );
}
