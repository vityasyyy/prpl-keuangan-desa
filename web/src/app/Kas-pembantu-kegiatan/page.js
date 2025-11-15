"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import Header from "@/features/kas-pembantu/Header";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import MonthCard from "@/features/kas-pembantu/MonthCard";
import { getKegiatanList } from "@/services/kas-pembantu";
import { formatCurrency, formatMonthDisplay } from "@/lib/format";

export default function KasPembantuKegiatan() {
  const [open, setOpen] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname(); // deteksi halaman sekarang

  // path form otomatis disesuaikan
  const formPath = `${pathname}/Form`;

  // Fetch data from API on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const result = await getKegiatanList({
          tahun: currentYear,
          page: 1,
          limit: 50,
        });

        // Transform API response to match UI data structure
        const transformed = transformToMonthCards(result);
        setData(transformed);
      } catch (err) {
        setError(err.message);
        // Fallback to empty array on error
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Transform API response to month cards format
  function transformToMonthCards(apiResponse) {
    if (!apiResponse || !apiResponse.data || apiResponse.data.length === 0) {
      return [];
    }

    // Group transactions by month
    const monthGroups = {};

    apiResponse.data.forEach((transaction) => {
      const date = new Date(transaction.tanggal);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthKey = `${month}-${year}`;

      if (!monthGroups[monthKey]) {
        monthGroups[monthKey] = {
          month,
          year,
          total: 0,
          transactions: [],
        };
      }

      monthGroups[monthKey].transactions.push(transaction);
      const saldo = parseFloat(transaction.saldo_after) || 0;
      monthGroups[monthKey].total = saldo;
    });

    // Convert to array and sort by month descending
    const sorted = Object.values(monthGroups).sort((a, b) => b.month - a.month);

    // Map to MonthCard format
    return sorted.map((group, index) => ({
      bulan: formatMonthDisplay(group.month),
      total: formatCurrency(group.total),
      isCurrentMonth: index === 0,
      month: group.month,
      year: group.year,
      transactions: group.transactions,
    }));
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Kegiatan"]} />

        <div className="mb-6">
          <Header title="Buku Pembantu Kegiatan" />
          <p className="-mt-8 text-sm text-black">
            Buku Kas Pembantu Kegiatan <br />
            Desa <b>BANGUNTAPAN</b> Tahun Anggaran 2025
          </p>
        </div>

        <div className="space-y-3">
          {loading && <p className="text-gray-600">Memuat data...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && data.length === 0 && !error && (
            <p className="text-gray-600">Tidak ada data untuk tahun ini.</p>
          )}
          {data.map((item, index) => (
            <MonthCard
              key={index}
              bulan={item.bulan}
              total={item.total}
              isCurrentMonth={item.isCurrentMonth}
              formPath={formPath}
              moduleType="kegiatan"
              month={item.month}
              year={item.year}
              transactions={item.transactions}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
