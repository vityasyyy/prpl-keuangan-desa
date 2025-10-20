'use client';

export default function Sidebar() {
  return (
    <aside className="flex w-[333px] min-h-screen px-[18px] py-[35px] justify-center items-center gap-2.5 flex-shrink-0 bg-[#414141]">
      <div className="flex w-[287px] flex-col justify-between items-start flex-shrink-0 self-stretch">
        <div className="flex flex-col justify-center items-start gap-[35px] self-stretch">
          {/* User Section */}
          <div className="flex flex-col items-center gap-2.5 self-stretch">
            <div className="flex flex-col items-start gap-[5px] self-stretch">
              <div className="self-stretch text-white text-center font-['Plus_Jakarta_Sans'] text-base font-bold leading-6">
                Kepala Desa
              </div>
              <div className="self-stretch text-white text-center font-['Plus_Jakarta_Sans'] text-sm font-bold leading-[19.5px]">
                Desa Banguntapan
              </div>
            </div>
            <div className="w-[70px] h-[70px] rounded-full bg-[#d9d9d9]"></div>
            <div className="flex flex-col items-start self-stretch">
              <div className="self-stretch text-white text-center font-['Plus_Jakarta_Sans'] text-sm font-bold leading-[19.5px]">
                Sudaryono
              </div>
              <div className="self-stretch text-white text-center font-['Plus_Jakarta_Sans'] text-sm font-normal leading-[19.5px]">
                9232753828
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[280px] h-0 border-t border-white/25 mx-auto"></div>

          {/* Navigation Menu */}
          <nav className="flex w-[287px] flex-col items-start gap-2.5">
            <div className="flex items-center gap-[5px] self-stretch">
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Poppins'] text-base font-bold leading-6">
                Beranda
              </div>
            </div>

            {/* APBDes Section */}
            <div className="flex flex-col items-start gap-1 self-stretch">
              <div className="flex items-center gap-[5px] self-stretch">
                <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#FCFCFD" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Poppins'] text-base font-bold leading-6">
                  APBDes
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Draft APBDes
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Draft Penjabaran APBDes
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku APBDes
              </div>
            </div>

            {/* Rencana & Kegiatan Section */}
            <div className="flex flex-col items-start gap-1 self-stretch">
              <div className="flex items-center gap-[5px] self-stretch">
                <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#FCFCFD" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Poppins'] text-base font-bold leading-6">
                  Rencana & Kegiatan
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Rencana Kegiatan dan Anggaran
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Rencana Kerja Kegiatan
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Rencana Anggaran Biaya
              </div>
            </div>

            {/* Penatausahaan Section */}
            <div className="flex flex-col items-start gap-1 self-stretch">
              <div className="flex items-center gap-[5px] self-stretch">
                <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#FCFCFD" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Poppins'] text-base font-bold leading-6">
                  Penatausahaan
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku Kas Umum
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku Pembantu Pajak
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku Pembantu Panjar
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku Pembantu Kegiatan
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Buku Bank Desa
              </div>
            </div>

            {/* Laporan Akhir Section */}
            <div className="flex flex-col items-start gap-1 self-stretch">
              <div className="flex items-center gap-[5px] self-stretch">
                <svg className="w-5 h-5 flex-shrink-0" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="#FCFCFD" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Poppins'] text-base font-bold leading-6">
                  Laporan Akhir
                </div>
              </div>
              <div className="flex flex-col justify-center flex-1 self-stretch text-white font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 pl-[25px]">
                Laporan Realisasi Akhir Tahun
              </div>
            </div>
          </nav>
        </div>

        {/* Logout Button */}
        <button className="flex w-[94px] h-[34px] p-2.5 justify-center items-center gap-2.5 rounded-[10px] bg-[#e9e9e9] border-none cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 14H12.6667C13.0203 14 13.3594 13.8595 13.6095 13.6095C13.8595 13.3594 14 13.0203 14 12.6667V3.33333C14 2.97971 13.8595 2.64057 13.6095 2.39052C13.3594 2.14048 13.0203 2 12.6667 2H10M5.33333 11.3333L2 8M2 8L5.33333 4.66667M2 8H10"
              stroke="#121926"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-black font-['Plus_Jakarta_Sans'] text-sm font-normal leading-[19.5px]">Keluar</span>
        </button>
      </div>
    </aside>
  );
}
