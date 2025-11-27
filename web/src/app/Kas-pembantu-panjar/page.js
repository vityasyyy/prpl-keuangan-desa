"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import Header from "@/features/kas-pembantu/Header";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import MonthCard from "@/features/kas-pembantu/MonthCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Utility functions (inline)
function formatCurrency(value) {
  if (!value) return "Rp0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "Rp0,00";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatMonthDisplay(monthNumber) {
  return `Bulan ${monthNumber}`;
}

export default function KasPembantuPanjar() {
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
        // GET http://localhost:8081/api/kas-pembantu/panjar
        const response = await fetch(`${API_BASE_URL}/api/kas-pembantu/panjar`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        // Transform API response to match UI data structure
        const transformed = transformToMonthCards(result);
        setData(transformed);
      } catch (err) {
        setError(err.message);
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
      saldo: index === 0,
      month: group.month,
      year: group.year,
      transactions: group.transactions,
    }));
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Panjar"]} />

        <div className="mb-6">
          <Header title="Buku Pembantu Panjar" />
          <p className="-mt-8 text-sm text-black">
            Buku Kas Pembantu Panjar <br />
            Desa <b>BANGUNTAPAN</b> Tahun Anggaran 2025
          </p>
        </div>

        <div className="space-y-3">
          {loading && <p className="text-gray-600">Memuat data...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && data.length === 0 && !error && (
            <p className="text-gray-600">Tidak ada data.</p>
          )}
          {data.map((item, index) => (
            <MonthCard
              key={index}
              bulan={item.bulan}
              total={item.total}
              saldo={item.saldo}
              formPath={formPath}
              moduleType="panjar"
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
