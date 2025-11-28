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

export default function MonthCard({ monthName, monthKey, totalMonth, totalCumulative, transactions }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleDownload = (e) => {
        e.stopPropagation();
        if (!monthKey) return;
        const [year, month] = monthKey.split('-');
        
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';
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
        window.open(`${backendUrl}/api/bank-desa/print?${params.toString()}`, '_blank');
    };

    const handleAdd = (e) => {
        e.stopPropagation();
        if (!monthKey) return;
        router.push(`/buku-bank/input?date=${monthKey}-01`);
    };

    return (
        <div className="flex flex-col">
            <div className="border border-[#4b5565] rounded-[30px] h-[66px] px-[25px] py-[17px] flex items-center bg-white">
                {/* Left side: Chevron + Month Name */}
                <div className="flex items-center gap-[10px] min-w-[180px] cursor-pointer select-none shrink-0" onClick={() => setIsOpen(!isOpen)}>
                    <ChevronDown className={`w-6 h-6 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} text-black`} />
                    <span className="font-semibold text-[20px] leading-[30px] text-black whitespace-nowrap">{monthName}</span>
                </div>

                {/* Middle: Totals - use fixed widths for alignment */}
                <div className="flex items-center justify-center flex-1">
                    <div className="flex items-center gap-[10px] min-w-[280px]">
                        <span className="font-normal text-[16px] leading-[24px] text-black">Total Bulan ini</span>
                        <span className="font-semibold text-[16px] leading-[24px] text-black">{totalMonth}</span>
                    </div>

                    <div className="flex items-center gap-[10px] min-w-[280px]">
                        <span className="font-normal text-[16px] leading-[24px] text-black">Total Kumulatif</span>
                        <span className="font-semibold text-[16px] leading-[24px] text-black">{totalCumulative}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex gap-[4px] items-center shrink-0">
                    <button onClick={handleDownload} className="border border-[#4b5565] rounded-[8px] p-[8px] hover:bg-gray-100 transition-colors">
                        <DownloadIcon className="w-4 h-4 text-[#364152]" />
                    </button>
                    <button onClick={handleAdd} className="border border-[#4b5565] rounded-[8px] p-[8px] hover:bg-gray-100 transition-colors">
                        <PlusIcon className="w-4 h-4 text-[#364152]" />
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
                                        <ReverseButton id={tx.id} tanggal={tx.rawDate} />
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
