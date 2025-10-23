"use client";
import { ChevronDown, ChevronRight, Download, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MonthCard({ bulan, total, saldo, formPath }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-white border border-gray-300 rounded-2xl shadow-sm">
      <div
        className="flex justify-between items-center px-4 py-3 cursor-pointer"
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
          <span className="text-gray-700 text-sm">
            {saldo ? (
              <>
                Saldo Total{" "}
                <b className="font-semibold text-black">{total}</b>
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
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={16} className="text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(formPath);
            }}
            className="px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 border-t border-gray-200 text-gray-600 text-sm">
          <p>Rincian transaksi bulan ini belum diinput.</p>
          <button
            onClick={() => router.push(formPath)}
            className="flex items-center mt-2 text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" /> Tambah Transaksi
          </button>
        </div>
      )}
    </div>
  );
}
