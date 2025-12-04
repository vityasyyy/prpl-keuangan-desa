"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import Header from "@/features/kas-pembantu/Header";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import MonthCard from "@/features/kas-pembantu/MonthCard";
import { useAuth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

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

// Format bulan + tahun langsung
function formatMonthYearDisplay(month, year) {
  const namaBulan = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  return `${namaBulan[month]} ${year}`;
}

// Transform API response to month cards format (PREFIX SUM BENAR)
function transformToMonthCards(apiResponse) {
  if (!apiResponse?.data?.length) return [];

  // 1) Urutkan semua transaksi berdasarkan tanggal agar prefix sum benar
  const all = [...apiResponse.data].sort((a, b) => {
    const ta = new Date(a.tanggal).getTime();
    const tb = new Date(b.tanggal).getTime();
    return ta - tb;
  });

  // 2) Hitung prefix sum global
  let runningSaldo = 0;
  const allWithSaldo = all.map((trx) => {
    const delta = (parseFloat(trx.pemberian) || 0) - (parseFloat(trx.pertanggungjawaban) || 0);
    runningSaldo += delta;

    return {
      ...trx,
      delta, // selisih bulan yg sebenarnya
      saldo_hitung: runningSaldo, // PREFIX SUM SALDO
      delta_formatted: formatCurrency(delta),
      saldo_hitung_formatted: formatCurrency(runningSaldo),
    };
  });

  // 3) Kelompokkan per bulan (YYYY-MM)
  const monthGroups = {};
  allWithSaldo.forEach((trx) => {
    const date = new Date(trx.tanggal);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const monthKey = `${year}-${month}`;

    if (!monthGroups[monthKey]) {
      monthGroups[monthKey] = {
        month,
        year,
        transactions: [],
        total: 0,
      };
    }

    monthGroups[monthKey].transactions.push(trx);
    // total bulan = saldo setelah transaksi TERAKHIR bulan tsb
    monthGroups[monthKey].total = trx.saldo_hitung;
  });

  // 4) Sort bulan dari yang terbaru
  const sorted = Object.values(monthGroups).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });

  // 5) Return format MonthCard
  return sorted.map((group, index) => ({
    bulan: formatMonthYearDisplay(group.month, group.year),
    total: formatCurrency(group.total),
    isCurrentMonth: index === 0, // bulan terbaru
    month: group.month,
    year: group.year,
    transactions: group.transactions,
  }));
}
export default function KasPembantuPanjar() {
  const [open, setOpen] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuth() || {};

  const formPath = `${pathname}/Form`;

  // Fetch data from API on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Buat headers dengan token jika ada
        const headers = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_BASE_URL}/kas-pembantu/panjar`,
          {
            method: "GET",
            headers: headers,
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP ${response.status}: ${errorText || response.statusText}`
          );
        }

        const result = await response.json();

        // Transform API response to match UI data structure
        const transformed = transformToMonthCards(result);
        setData(transformed);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);


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
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          {!loading && data.length === 0 && !error && (
            <p className="text-gray-600">Tidak ada data.</p>
          )}
          {data.map((item, index) => (
            <MonthCard
              key={index}
              bulan={item.bulan}
              total={item.total}
              saldo={item.isCurrentMonth}
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
