'use client';

import { useState } from 'react';

export default function DownloadButton({ latestMonth }) {
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
      // We use the NEXT_PUBLIC_BACKEND_URL env var or default to localhost:8081
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
      
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

      const printUrl = `${backendUrl}/api/bank-desa/print?${params.toString()}`;
      
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
      className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? 'Memuat...' : 'Unduh File'}
    </button>
  );
}
