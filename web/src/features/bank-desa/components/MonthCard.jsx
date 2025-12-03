'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReverseButton from './ReverseButton';

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const DownloadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 10.5l4.5 4.5m0 0 4.5-4.5m-4.5 4.5V3" />
    </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function MonthCard({ monthName, monthKey, totalMonth, totalCumulative, transactions, onReversalSuccess }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const router = useRouter();

    // Month names for filename
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!monthKey || isPrinting) return;
        
        setIsPrinting(true);
        const [year, month] = monthKey.split('-');
        const monthName = monthNames[parseInt(month) - 1] || month;
        const docTitle = `Buku Bank Desa - ${monthName} ${year}`;
        
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const params = new URLSearchParams({
            year,
            month,
            desa: 'Banguntapan',
            kecamatan: 'Banguntapan',
            bankCabang: 'BPD DIY Capem Banguntapan',
            rekNo: '001.221.000123',
            kodeRekening: '1.1.1.01',
            autoPrint: 'false'
        });
        
        try {
            // Fetch with credentials to handle authentication
            const printUrl = `${API_BASE_URL}/bank-desa/print?${params.toString()}`;
            const response = await fetch(printUrl, {
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch print data');
            }
            
            const html = await response.text();
            
            // Open a new window with the HTML content
            const printWindow = window.open('', '_blank', 'width=1200,height=800');
            if (printWindow) {
                printWindow.document.write(html);
                printWindow.document.close();
                // Set the title explicitly for PDF filename
                printWindow.document.title = docTitle;
                
                // Wait for content to load then trigger print
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                        setIsPrinting(false);
                    }, 300);
                };
                
                // Fallback if onload doesn't fire
                setTimeout(() => {
                    printWindow.document.title = docTitle;
                    printWindow.print();
                    setIsPrinting(false);
                }, 800);
            } else {
                // Popup blocked - fallback to opening in same tab
                alert('Popup diblokir. Silakan izinkan popup untuk mencetak.');
                setIsPrinting(false);
            }
        } catch (error) {
            console.error('Print error:', error);
            setIsPrinting(false);
        }
    };

    const handleAdd = (e) => {
        e.stopPropagation();
        if (!monthKey) return;
        router.push(`/buku-bank/input?date=${monthKey}-01`);
    };

    return (
        <div className="flex flex-col">
            <div className="border-[0.5px] border-[#4b5565] rounded-[30px] h-[66px] px-[25px] py-[17px] flex items-center bg-white">
                {/* Left side: Chevron + Month Name */}
                <div className="flex items-center gap-[10px] min-w-[180px] cursor-pointer select-none shrink-0" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} text-black`} />
                    <span className="font-jakarta font-semibold text-[20px] leading-[30px] text-black whitespace-nowrap">{monthName}</span>
                </div>

                {/* Middle: Totals - use fixed widths for alignment */}
                <div className="flex items-center justify-center flex-1">
                    <div className="flex items-center gap-[10px] min-w-[280px]">
                        <span className="font-jakarta font-normal text-[16px] leading-[24px] text-black">Total Bulan ini</span>
                        <span className="font-poppins font-semibold text-[16px] leading-[24px] text-black">{totalMonth}</span>
                    </div>

                    <div className="flex items-center gap-[10px] min-w-[280px]">
                        <span className="font-jakarta font-normal text-[16px] leading-[24px] text-black">Total Kumulatif</span>
                        <span className="font-poppins font-semibold text-[16px] leading-[24px] text-black">{totalCumulative}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-[4px] items-center shrink-0">
                    <button 
                        onClick={handleDownload} 
                        disabled={isPrinting}
                        className="border border-[#4b5565] rounded-[8px] p-[8px] hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cetak"
                    >
                        {isPrinting ? (
                            <svg className="w-[16px] h-[16px] text-[#364152] animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <DownloadIcon className="w-[16px] h-[16px] text-[#364152]" />
                        )}
                    </button>
                    <button onClick={handleAdd} className="border border-[#4b5565] rounded-[8px] p-[8px] hover:bg-gray-100 transition-colors">
                        <PlusIcon className="w-[16px] h-[16px] text-[#364152]" />
                    </button>
                </div>
            </div>

            {/* Expanded Content (Table) */}
            {isOpen && (
                <div className="mt-4 border border-black border-t-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white text-[14px] font-semibold">
                                <th rowSpan="2" className="p-3 border-r border-white/20 text-center w-[50px]">No</th>
                                <th rowSpan="2" className="p-3 border-r border-white/20">Tanggal</th>
                                <th rowSpan="2" className="p-3 border-r border-white/20">Uraian</th>
                                <th rowSpan="2" className="p-3 border-r border-white/20">Bukti</th>
                                <th colSpan="2" className="p-3 border-r border-white/20 text-center border-b">Pemasukan</th>
                                <th colSpan="3" className="p-3 border-r border-white/20 text-center border-b">Pengeluaran</th>
                                <th rowSpan="2" className="p-3 border-r border-white/20 text-right">Saldo</th>
                                <th rowSpan="2" className="p-3 text-center">Aksi</th>
                            </tr>
                            <tr className="bg-black text-white text-[14px] font-semibold">
                                <th className="p-3 border-r border-white/20 text-right">Setoran</th>
                                <th className="p-3 border-r border-white/20 text-right">Bunga</th>
                                <th className="p-3 border-r border-white/20 text-right">Penarikan</th>
                                <th className="p-3 border-r border-white/20 text-right">Pajak</th>
                                <th className="p-3 border-r border-white/20 text-right">Adm</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-black">
                            {transactions.map((tx, idx) => (
                                <tr key={tx.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3 text-center">{idx + 1}</td>
                                    <td className="p-3 whitespace-nowrap">{tx.date}</td>
                                    <td className="p-3">{tx.description}</td>
                                    <td className="p-3 whitespace-nowrap">{tx.proof_no}</td>
                                    <td className="p-3 text-right text-green-600 whitespace-nowrap">{tx.deposit}</td>
                                    <td className="p-3 text-right text-green-600 whitespace-nowrap">{tx.interest}</td>
                                    <td className="p-3 text-right text-red-600 whitespace-nowrap">{tx.withdrawal}</td>
                                    <td className="p-3 text-right text-red-600 whitespace-nowrap">{tx.tax}</td>
                                    <td className="p-3 text-right text-red-600 whitespace-nowrap">{tx.admin_fee}</td>
                                    <td className="p-3 text-right font-medium whitespace-nowrap border-r border-gray-200">{tx.balance}</td>
                                    <td className="p-3 text-center">
                                        <ReverseButton id={tx.id} tanggal={tx.rawDate} onSuccess={onReversalSuccess} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
