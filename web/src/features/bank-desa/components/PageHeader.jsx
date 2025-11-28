import Link from 'next/link';
import DownloadButton from './DownloadButton';
import HideReversalsButton from './HideReversalsButton';

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
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

export default function PageHeader({ latestMonth }) {
  return (
    <div className="flex flex-col gap-[40px] py-[20px]">
      {/* Breadcrumb */}
      <div className="flex items-center text-[14px] leading-[19.5px] font-normal">
        <BreadcrumbIcon className="w-3 h-3 text-black" />
        <BookIcon className="w-[14px] h-[14px] text-black ml-1" />
        <span className="text-black ml-[6px]">Penatausahaan</span>
        <span className="text-[#697586] mx-1">{'>'}</span>
        <span className="text-[#0040C1] border-b border-[#0040C1] cursor-pointer">Buku Bank Desa</span>
      </div>

      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-[7px] flex-1">
          <h1 className="font-semibold text-[24px] lg:text-[31px] leading-[36px] lg:leading-[46.5px] text-black">Buku Bank Desa</h1>
          <p className="font-normal text-[14px] lg:text-[16px] leading-[24px] text-black">
            Buku Bank Desa<br />
            Desa BANGUNTAPAN Tahun Anggaran 2025
          </p>
        </div>
        <div className="flex flex-col gap-[2px] shrink-0">
          <HideReversalsButton />
          <DownloadButton latestMonth={latestMonth} />
          <Link href="/buku-bank/input" className="bg-[#099250] border border-[#099250] text-white rounded-[8px] px-[14px] py-[8px] h-[36px] flex items-center justify-center gap-[8px] font-medium !text-[14px] !leading-[20px] hover:bg-[#077d43] transition-colors">
              <span>Input Data</span>
              <PlusIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
