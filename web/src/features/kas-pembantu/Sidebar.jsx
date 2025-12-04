"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(null);

  const menus = [
    {
      title: "APBDes",
      items: [
        { label: "Draft APBDes", href: "#" },
        { label: "Draft Penjabaran APBDes", href: "#" },
        { label: "Buku APBDes", href: "#" },
      ],
    },
    {
      title: "Rencana & Kegiatan",
      items: [
        { label: "Rencana Kegiatan dan Anggaran", href: "#" },
        { label: "Rencana Kerja Kegiatan", href: "#" },
        { label: "Rencana Anggaran Biaya", href: "#" },
      ],
    },
    {
      title: "Penatausahaan",
      items: [
        { label: "Buku Kas Umum", href: "#" },
        { label: "Buku Pembantu Pajak", href: "/Kas-pembantu-pajak" },
        { label: "Buku Pembantu Panjar", href: "/Kas-pembantu-panjar" },
        { label: "Buku Pembantu Kegiatan", href: "/Kas-pembantu-kegiatan" },
        { label: "Buku Bank Desa", href: "#" },
      ],
    },
    {
      title: "Laporan Akhir",
      items: [
        { label: "Laporan Realisasi Akhir Tahun", href: "#" },
      ],
    },
  ];

  const handleMenuItemClick = (href) => {
    if (href !== "#") {
      router.push(href);
    }
  };

  return (
    <div className="flex flex-col justify-between h-screen w-64 bg-[#3C3C3C] text-gray-100">
      {/* Header Info */}
      <div>
        <div className="flex flex-col items-center pt-6 pb-2">
          <p className="text-sm font-semibold">Kepala Desa</p>
          <p className="text-sm text-gray-300">Desa Banguntapan</p>
          <div className="w-14 h-14 rounded-full bg-gray-400 mt-3"></div>
          <p className="mt-2 text-sm font-medium">Sudaryono</p>
          <p className="text-xs text-gray-300">9237573828</p>
        </div>

        <div className="border-t border-gray-500 mx-4 my-3"></div>

        <div className="px-5 text-sm font-medium text-gray-200 mb-2">Beranda</div>

        {/* Menu Groups */}
        <div className="text-sm">
          {menus.map((menu, idx) => (
            <div key={idx} className="mb-2">
              <button
                onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                className="flex items-center gap-2 w-full px-5 py-2 hover:bg-[#4A4A4A] font-medium text-gray-100 text-left"
              >
                {/* Chevron di kiri */}
                {openMenu === idx ? (
                  <ChevronUp size={16} className="shrink-0" />
                ) : (
                  <ChevronDown size={16} className="shrink-0" />
                )}
                {menu.title}
              </button>

              {openMenu === idx && (
                <div className="pl-10 mt-1 space-y-1 text-gray-300">
                  {menu.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleMenuItemClick(item.href)}
                      className="w-full text-left cursor-pointer hover:text-white transition"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Logout */}
      <div className="border-t border-gray-600 px-3 py-4">
        <button className="flex items-center gap-2 bg-white text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition ml-1">
          {/* Icon logout menghadap kiri */}
          <LogOut size={14} className="rotate-180" />
          Keluar
        </button>
      </div>
    </div>
  );
}
