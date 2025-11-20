import Link from 'next/link';
import DownloadButton from './DownloadButton';
import HideReversalsButton from './HideReversalsButton';

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function PageHeader({ latestMonth }) {
  return (
    <div className="flex items-center justify-between py-5 mb-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-[31px] leading-[46.5px] text-black">Buku Bank Desa</h1>
        <p className="font-normal text-[16px] leading-[24px] text-black">
          Buku Bank Desa <br />
          Desa BANGUNTAPAN Tahun Anggaran 2025
        </p>
      </div>
      <div className="flex gap-2">
        <HideReversalsButton />
        <DownloadButton latestMonth={latestMonth} />
        <Link href="/buku-bank/input" className="bg-[#099250] text-white rounded-[8px] px-[14px] py-[8px] flex items-center gap-2 font-medium text-[14px] hover:bg-[#077d43] transition-colors">
            <span>Input Data</span>
            <PlusIcon className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
