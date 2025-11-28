'use client';

import Link from 'next/link';
import { useState } from 'react';

const ChevronDown = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
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
);

// Sidebar menu item component
const SidebarMenuItem = ({ label, isOpen, onClick, hasChevron = true }) => (
  <div 
    className="flex items-center gap-[5px] cursor-pointer hover:text-gray-300 select-none w-full"
    onClick={onClick}
  >
    {hasChevron && (
      <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
    )}
    <span className="font-semibold text-[14px] lg:text-[16px] leading-[24px]">{label}</span>
  </div>
);

// Sidebar sub-item component
const SidebarSubItem = ({ href, children, indent = false }) => (
  <Link 
    href={href} 
    className={`text-[13px] lg:text-[14px] xl:text-[16px] font-normal leading-[24px] hover:text-gray-300 ${indent ? 'pl-[20px] lg:pl-[25px]' : ''}`}
  >
    {children}
  </Link>
);

export default function Sidebar() {
  const [isAPBDesOpen, setIsAPBDesOpen] = useState(false);
  const [isRencanaOpen, setIsRencanaOpen] = useState(false);
  const [isPenatausahaanOpen, setIsPenatausahaanOpen] = useState(true);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);

  return (
    <aside className="w-[260px] lg:w-[300px] xl:w-[333px] bg-[#414141] min-h-screen flex items-center justify-center px-[14px] lg:px-[18px] py-[35px] text-white shrink-0 sticky top-0 overflow-y-auto">
      <div className="w-full max-w-[287px] h-full flex flex-col justify-between">
        {/* Main Content */}
        <div className="flex flex-col gap-[35px]">
          {/* User Section */}
          <div className="flex flex-col gap-[10px] items-center w-full">
            {/* Jabatan dan desa */}
            <div className="flex flex-col gap-[5px] text-center w-full">
              <p className="font-bold text-[14px] lg:text-[16px] leading-[24px]">Kepala Desa</p>
              <p className="font-semibold text-[12px] lg:text-[14px] leading-[19.5px]">Desa Banguntapan</p>
            </div>
            {/* Avatar */}
            <div className="w-[50px] h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
              <UserIcon className="w-full h-full text-gray-500" />
            </div>
            {/* Name and ID */}
            <div className="flex flex-col text-center w-full">
              <p className="font-semibold text-[12px] lg:text-[14px] leading-[19.5px]">Sudaryono</p>
              <p className="font-normal text-[12px] lg:text-[14px] leading-[19.5px]">9232753828</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[280px] h-px bg-gray-500"></div>

          {/* Navigation Menu */}
          <div className="flex flex-col gap-[10px] w-[287px]">
            {/* Beranda - No chevron, no sub-items */}
            <Link href="#" className="font-semibold text-[16px] leading-[24px] hover:text-gray-300">
              Beranda
            </Link>

            {/* APBDes Section */}
            <div className="flex flex-col gap-[4px]">
              <SidebarMenuItem 
                label="APBDes" 
                isOpen={isAPBDesOpen} 
                onClick={() => setIsAPBDesOpen(!isAPBDesOpen)} 
              />
              {isAPBDesOpen && (
                <>
                  <SidebarSubItem href="#" indent>Draft APBDes</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Draft Penjabaran APBDes</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Buku APBDes</SidebarSubItem>
                </>
              )}
            </div>

            {/* Rencana & Kegiatan Section */}
            <div className="flex flex-col gap-[4px]">
              <SidebarMenuItem 
                label="Rencana & Kegiatan" 
                isOpen={isRencanaOpen} 
                onClick={() => setIsRencanaOpen(!isRencanaOpen)} 
              />
              {isRencanaOpen && (
                <>
                  <SidebarSubItem href="#" indent>Rencana Kegiatan dan Anggaran</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Rencana Kerja Kegiatan</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Rencana Anggaran Biaya</SidebarSubItem>
                </>
              )}
            </div>

            {/* Penatausahaan Section */}
            <div className="flex flex-col gap-[4px]">
              <SidebarMenuItem 
                label="Penatausahaan" 
                isOpen={isPenatausahaanOpen} 
                onClick={() => setIsPenatausahaanOpen(!isPenatausahaanOpen)} 
              />
              {isPenatausahaanOpen && (
                <>
                  <SidebarSubItem href="#" indent>Buku Kas Umum</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Buku Pembantu Pajak</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Buku Pembantu Panjar</SidebarSubItem>
                  <SidebarSubItem href="#" indent>Buku Pembantu Kegiatan</SidebarSubItem>
                  <SidebarSubItem href="/buku-bank" indent>Buku Bank Desa</SidebarSubItem>
                </>
              )}
            </div>

            {/* Laporan Akhir Section */}
            <div className="flex flex-col gap-[4px]">
              <SidebarMenuItem 
                label="Laporan Akhir" 
                isOpen={isLaporanOpen} 
                onClick={() => setIsLaporanOpen(!isLaporanOpen)} 
              />
              {isLaporanOpen && (
                <SidebarSubItem href="#" indent>Laporan Realisasi Akhir Tahun</SidebarSubItem>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <button className="flex items-center justify-center gap-[10px] bg-[#e9e9e9] text-black w-[94px] h-[34px] rounded-[10px] hover:bg-gray-200 transition-colors">
            <LogOutIcon className="w-4 h-4 rotate-180" />
            <span className="font-normal text-[14px] leading-[19.5px]">Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
