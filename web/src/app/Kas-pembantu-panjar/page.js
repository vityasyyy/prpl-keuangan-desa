"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import Header from "@/features/kas-pembantu/Header";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import MonthCard from "@/features/kas-pembantu/MonthCard";

export default function KasPembantuPanjar() {
  const [open, setOpen] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // deteksi halaman sekarang

  // path form otomatis disesuaikan
  const formPath = `${pathname}/Form`;

  const data = [
    { bulan: "Bulan 2", total: "Rp1.500.000.000,00", saldo: true },
    { bulan: "Bulan 1", total: "Rp1.500.000.000,00" },
    { bulan: "Bulan 1", total: "Rp1.500.000.000,00" },
    { bulan: "Bulan 1", total: "Rp1.500.000.000,00" },
    { bulan: "Bulan 1", total: "Rp1.500.000.000,00" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Panjar"]} />

        <div className="mb-6">
          <Header title="Buku Pembantu Panjar" />
          <p className="text-sm text-black -mt-8">
            Buku Kas Pembantu Panjar <br />
            Desa <b>BANGUNTAPAN</b> Tahun Anggaran 2025
          </p>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <MonthCard
              key={index}
              bulan={item.bulan}
              total={item.total}
              saldo={item.saldo}
              formPath={formPath}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
