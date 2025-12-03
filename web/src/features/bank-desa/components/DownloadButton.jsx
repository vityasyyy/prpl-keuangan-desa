'use client';

import { useState } from 'react';

export default function DownloadButton({ latestMonth, className = '' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    try {
      // Default to current date if no data
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;

      if (latestMonth) {
        const [y, m] = latestMonth.split('-');
        year = parseInt(y);
        month = parseInt(m);
      }

      // Construct the backend URL for printing
      // We use the NEXT_PUBLIC_API_URL env var or default to localhost:3001
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Add default metadata (can be made dynamic later)
      const params = new URLSearchParams({
        year,
        month,
        desa: 'Banguntapan',
        kecamatan: 'Banguntapan',
        bankCabang: 'BPD DIY Capem Banguntapan',
        rekNo: '001.221.000123',
        kodeRekening: '1.1.1.01',
        autoPrint: 'true'
      });

      const printUrl = `${API_BASE_URL}/bank-desa/print?${params.toString()}`;
      
      // Open in new tab
      window.open(printUrl, '_blank');
    } catch (error) {
      console.error('Failed to open print view:', error);
      alert('Gagal membuka tampilan cetak.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isLoading}
      className={`bg-[#EF6820] border border-[#EF6820] text-white rounded-[8px] px-[14px] py-[8px] h-[36px] flex items-center justify-center gap-[8px] font-medium !text-[14px] !leading-[20px] hover:bg-[#d55a1a] transition-colors disabled:opacity-50 ${className}`}
    >
      <span>{isLoading ? 'Loading...' : 'Unduh File'}</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 10.5l4.5 4.5m0 0 4.5-4.5m-4.5 4.5V3" />
      </svg>
    </button>
  );
}
