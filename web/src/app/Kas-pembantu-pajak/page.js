"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/kas-pembantu/Sidebar";
import Header from "@/components/kas-pembantu/Header";
import BreadcrumbHeader from "@/components/kas-pembantu/BreadcrumbHeader";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import MonthCard from "@/components/kas-pembantu/MonthCard";

export default function KasPembantuPajak() {
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
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Pajak"]} />

        <div className="mb-6">
          <Header title="Buku Pembantu Pajak" />
          <p className="text-sm text-black -mt-8">
            Buku Kas Pembantu Pajak, Retribusi, dan Penerimaan Lainnya <br />
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
