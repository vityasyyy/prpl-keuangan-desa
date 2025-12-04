"use client";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

function formatDate(isoString) {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

// Define column configurations for each module type
const MODULE_FIELDS = {
  kegiatan: {
    columns: [
      { key: "tanggal", label: "Tanggal", width: "100px" },
      { key: "uraian", label: "Uraian", width: "200px" },
      { key: "penerimaan_bendahara", label: "Penerimaan dari Bendahara", width: "auto" },
      { key: "penerimaan_swadaya", label: "Penerimaan dari Swadaya", width: "auto" },
      { key: "pengeluaran_barang_dan_jasa", label: "Pengeluaran Barang dan Jasa", width: "auto" },
      { key: "pengeluaran_modal", label: "Pengeluaran Modal", width: "auto" },
      { key: "saldo_hitung", label: "Saldo", width: "120px" },
    ],
  },
  panjar: {
    columns: [
      { key: "tanggal", label: "Tanggal", width: "100px" },
      { key: "uraian", label: "Uraian", width: "auto" },
      { key: "pemberian", label: "Pemberian", width: "120px" },
      { key: "pertanggungjawaban", label: "Pertanggungjawaban", width: "140px" },
      { key: "saldo_hitung", label: "Saldo", width: "120px" },
    ],
  },
  pajak: {
    columns: [
      { key: "tanggal", label: "Tanggal", width: "100px" },
      { key: "uraian", label: "Uraian", width: "auto" },
      { key: "pemotongan", label: "Pemotongan", width: "120px" },
      { key: "penyetoran", label: "Penyetoran", width: "120px" },
      { key: "saldo_hitung", label: "Saldo", width: "120px" },
    ],
  },
};

export default function MonthCard({
  bulan,
  total,
  saldo,
  formPath,
  moduleType = "kegiatan",
  transactions = [],
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const columns = MODULE_FIELDS[moduleType]?.columns || [];

  const handleDownload = (e) => {
    e.stopPropagation();
    const bulan = parseInt(transactions[0].tanggal.slice(5, 7));
    const tahun = parseInt(transactions[0].tanggal.slice(0, 4));

    const locationPath = window.location.pathname.toLowerCase();
    const moduleMap = {
      "kas-pembantu-kegiatan": "kegiatan",
      "kas-pembantu-panjar": "panjar",
      "kas-pembantu-pajak": "pajak",
    };
    const moduleType = moduleMap[Object.keys(moduleMap).find(key => locationPath.includes(key))] || "kegiatan";
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";
    const exportUrl = `${API_BASE_URL}/kas-pembantu/${moduleType}/export?bulan=${bulan}&tahun=${tahun}`;
    window.location.href = exportUrl;
  };

  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-sm">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setOpen(!open)}
      >
        {/* Kiri: Toggle + Bulan */}
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown size={18} className="text-gray-600" />
          ) : (
            <ChevronRight size={18} className="text-gray-600" />
          )}
          <span className="font-medium text-gray-800">{bulan}</span>
        </div>

        {/* Tengah: Total */}
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-700">
            {saldo ? (
              <>
                Saldo Total <b className="font-semibold text-black">{total}</b>
              </>
            ) : (
              <>
                Total <b className="font-semibold text-black">{total}</b>
              </>
            )}
          </span>
        </div>

        {/* Kanan: Tombol Unduh & Input */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50"
            onClick={handleDownload}
          >
            <Download size={16} className="text-gray-600 hover:cursor-pointer" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(formPath);
            }}
            className="rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-50 hover:cursor-pointer"
          >
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-200 p-4 text-sm text-gray-600">
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="border-r border-gray-200 px-2 py-2 text-left font-semibold text-gray-700 last:border-r-0"
                        style={{ width: col.width }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, idx) => (
                    <tr
                      key={transaction.id || idx}
                      className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                      onClick={() => router.push(`${formPath}?id=${transaction.id}`)}
                    >
                      {columns.map((col) => (
                        <td
                          key={`${transaction.id}-${col.key}`}
                          className="border-r border-gray-100 px-2 py-2 text-gray-800 last:border-r-0"
                          style={{ width: col.width }}
                        >
                          {col.key === "tanggal"
                            ? formatDate(transaction[col.key])
                            : col.key === "uraian"
                              ? transaction[col.key]
                              : col.key.includes("saldo") ||
                                  col.key === "penerimaan" ||
                                  col.key === "pengeluaran" ||
                                  col.key === "pemberian" ||
                                  col.key === "pertanggungjawaban" ||
                                  col.key === "pemotongan" ||
                                  col.key === "penyetoran"
                                ? formatCurrency(transaction[col.key])
                                : transaction[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <p>Rincian transaksi bulan ini belum diinput.</p>
              <button
                onClick={() => router.push(formPath)}
                className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} className="mr-1" /> Tambah Transaksi
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
