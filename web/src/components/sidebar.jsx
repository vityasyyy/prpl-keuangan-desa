"use client";
import { useState } from "react";
import Button from "./button";
import { Chevron, Logout } from "./icons";

export default function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null);
  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const listNav = [
    { title: "APBDes", subItems: ["Draft APBDes", "Draft Penjabaran APBDes", "Buku APBDes"] },
    {
      title: "Rencana & Kegiatan",
      subItems: [
        "Rencana Kegiatan dan Anggaran",
        "Rencana Kerja Kegiatan",
        "Rencana Anggaran Biaya",
      ],
    },
    {
      title: "Penatausahaan",
      subItems: [
        "Buku Kas Umum",
        "Buku Pembantu Pajak",
        "Buku Pembantu Panjar",
        "Buku Pembantu Kegiatan",
        "Buku Bank Desa",
      ],
    },
    {
      title: "Laporan Akhir",
      subItems: ["Laporan Realisasi Akhir Tahun"],
    },
  ];

  return (
    <aside className="sticky top-0 left-0 flex max-h-screen min-h-screen w-66 flex-col justify-between bg-[#3D3D3D] px-6 py-8 text-white">
      <div>
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="text-lg font-semibold">Kepala Desa</h2>
          <p className="text-sm text-gray-300">Desa Banguntapan</p>
          <div className="mt-4 mb-3 h-20 w-20 rounded-full bg-gray-400"></div>
          <p className="font-medium">Sudaryono</p>
          <p className="text-sm text-gray-300">9232753828</p>
        </div>

        <hr className="my-6 border-gray-600" />

        <nav className="space-y-3">
          <div>
            <h3 className="font-semibold text-white">Beranda</h3>
          </div>
          {listNav.map((item) => (
            <div key={item.title}>
              <button
                onClick={() => toggleMenu(item.title)}
                className="flex items-center justify-between text-left font-semibold"
              >
                <Chevron open={openMenu === item.title} />
                <span className="ml-2">{item.title}</span>
              </button>
              {openMenu === item.title && (
                <ul className="mt-2 ml-3 space-y-1 pl-3 text-sm text-gray-300">
                  {item.subItems.map((subItem) => (
                    <li className="hover:underline" key={subItem}>
                      {subItem}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div>
        <Button variant="neutral">
          <Logout />
          <span>Keluar</span>
        </Button>
      </div>
    </aside>
  );
}