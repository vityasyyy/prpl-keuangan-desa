import Link from 'next/link';

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const LogOutIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
  </svg>
);

const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
)

export default function Sidebar() {
  return (
    <aside className="w-[333px] bg-[#414141] h-screen flex flex-col px-[18px] py-[35px] text-white shrink-0 sticky top-0 overflow-y-auto">
      <div className="flex flex-col items-center w-full mb-8">
        <div className="text-center mb-4">
          <h2 className="font-bold text-[16px]">Kepala Desa</h2>
          <p className="font-semibold text-[14px]">Desa Banguntapan</p>
        </div>
        <div className="w-[70px] h-[70px] bg-gray-300 rounded-full mb-2 overflow-hidden flex items-center justify-center">
            {/* Placeholder for user image */}
            <UserIcon className="w-full h-full text-gray-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[14px]">Sudaryono</p>
          <p className="font-normal text-[14px]">9232753828</p>
        </div>
      </div>

      <div className="w-full h-px bg-gray-500 mb-8"></div>

      <nav className="flex-1 w-full flex flex-col gap-4">
        {/* Draft APBDes */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[16px] font-semibold cursor-pointer hover:text-gray-300">
                <ChevronRight className="w-5 h-5" />
                <span>Draft APBDes</span>
            </div>
        </div>

        {/* Rencana Anggaran Biaya */}
        <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[16px] font-semibold cursor-pointer hover:text-gray-300">
                <ChevronRight className="w-5 h-5" />
                <span>Rencana Anggaran Biaya</span>
            </div>
        </div>

        {/* Penatausahaan */}
        <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[16px] font-semibold cursor-pointer hover:text-gray-300">
                <ChevronDown className="w-5 h-5" />
                <span>Penatausahaan</span>
            </div>
            <div className="pl-7 flex flex-col gap-2">
                <Link href="/buku-bank" className="text-[14px] hover:text-gray-300">Buku Bank Desa</Link>
                <Link href="#" className="text-[14px] hover:text-gray-300">Buku Kas Umum</Link>
                <Link href="#" className="text-[14px] hover:text-gray-300">Buku Kas Pembantu</Link>
                <Link href="#" className="text-[14px] hover:text-gray-300">Buku Pembantu Panjar</Link>
            </div>
        </div>

        {/* Laporan */}
        <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[16px] font-semibold cursor-pointer hover:text-gray-300">
                <ChevronRight className="w-5 h-5" />
                <span>Laporan</span>
            </div>
        </div>
      </nav>

      <div className="mt-auto">
        <button className="flex items-center justify-center gap-2 bg-[#e9e9e9] text-black w-[94px] py-2 rounded-[10px] hover:bg-gray-200 transition-colors">
          <LogOutIcon className="w-4 h-4" />
          <span className="text-[14px]">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
