"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import { ArrowUpRight, Download, Plus, SquarePlus } from "@/components/icons";

export default function OutputAPBDes() {
  const router = useRouter();
  const [data, setData] = useState([]);

  // Helpers: sanitize anggaran and tolerant category matching
  const sanitizeNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const s = String(val).replace(/\s/g, "").replace(/[^0-9.,-]/g, "");
    if (s.indexOf(',') > -1 && s.indexOf('.') > -1) {
      return Number(s.replace(/\./g, '').replace(',', '.')) || 0;
    }
    if (s.indexOf('.') > -1 && s.indexOf(',') === -1) {
      if ((s.match(/\./g) || []).length > 1) {
        return Number(s.replace(/\./g, '')) || 0;
      }
      return Number(s) || 0;
    }
    if (s.indexOf(',') > -1) return Number(s.replace(',', '.')) || 0;
    return Number(s) || 0;
  };

  // Load data input draft APBDes and listen for updates
  useEffect(() => {
    const read = () => JSON.parse(localStorage.getItem("apbdesData") || "[]");
    setData(read());

    const onUpdate = () => setData(read());
    window.addEventListener('apbdes:update', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('apbdes:update', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  // Hitung total per kategori
  const total = (kategori) => {
    if (!data || data.length === 0) return 0;
    return data
      .filter((item) => {
        const val = ((item.kategori || item.pendapatanBelanja) || "").toString().toLowerCase();
        return val.includes(kategori.toLowerCase());
      })
      .reduce((sum, item) => sum + (typeof item.anggaran === 'number' ? item.anggaran : sanitizeNumber(item.anggaran)), 0);
  };

  // Ambil item per kategori
  const getItems = (kategori) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => {
      const val = ((item.kategori || item.pendapatanBelanja) || "").toString().toLowerCase();
      return val.includes(kategori.toLowerCase());
    });
  };

  // Simpan hasil posting ke localStorage
  const handlePostingAPB = () => {
    if (!data || data.length === 0) {
      alert("Belum ada data yang dapat diposting.");
      return;
    }

    localStorage.setItem("apbdesPosted", JSON.stringify(data));
    alert("APBDes berhasil diposting ke Buku APBDes.");
    router.push("/APBDes/BukuAPBDes");
  };

  const renderBox = (title, kategori) => {
    const items = getItems(kategori);

    return (
      <div className="rounded-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-center rounded-full border border-gray-300 px-5 py-3 mb-4 relative w-full min-w-[900px]">
          <h3 className="text-base font-semibold text-[#011829] absolute left-4">
            {title}
          </h3>

          <p className="text-sm text-gray-700 font-medium">
            Total{" "}
            <span className="font-bold text-black">
              Rp{total(kategori).toLocaleString("id-ID", {
                minimumFractionDigits: 2,
              })}
            </span>
          </p>

          <button
            className="absolute right-5 text-gray-600 hover:text-gray-900 transition"
            onClick={() => router.push("/APBDes/InputDraftAPBDes")}
          >
            <SquarePlus width={20} height={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[180px]">
          {items.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-2 hover:bg-gray-50"
                >
                  <div className="flex items-center text-sm text-gray-800 space-x-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/APBDes/InputDraftAPBDes?id=${item.id}`)}
                      className="flex items-center space-x-1 text-left"
                      title="Edit item"
                    >
                      <span>{item.objek || item.jenis || item.kelompok || item.pendapatanBelanja || "Tidak ada uraian"}</span>
                      <span className="text-gray-400 text-xs">✎</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/APBDes/InputDraftAPBDes?id=${item.id}`)}
                    className="text-sm font-light text-black"
                    title="Edit amount"
                  >
                    Rp{sanitizeNumber(item.anggaran || 0).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                    })}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic px-2 py-3">
              Belum ada data {kategori.toLowerCase()} yang diinput.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white px-6 md:px-16 py-8">
      <BreadCrumb category="APBDes" title="Draft APBDes" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Draft APBDes
          </h1>
          <h3 className="text-sm font-normal text-gray-700 mt-1">
            Anggaran Pendapatan dan Belanja Pemerintah Desa BANGUNTAPAN Tahun
            Anggaran 2025
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          {/* Tombol Posting */}
          <Button
            variant="solid"
            className="bg-[#0779ce] hover:bg-[#066bb8] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={handlePostingAPB}
          >
            <span>Posting APB</span>
            <ArrowUpRight width={18} height={18} />
          </Button>

          {/* Tombol Unduh (masih nonaktif) */}
          <Button
            variant="solid"
            className="bg-[#ff9500] hover:bg-[#e68600] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={() => alert("Fitur Unduh File belum diaktifkan")}
          >
            <span>Unduh File</span>
            <Download width={18} height={18} />
          </Button>

          {/* Tombol Input */}
          <Button
            variant="solid"
            className="bg-[#069250] hover:bg-[#058544] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={() => router.push("/APBDes/InputDraftAPBDes")}
          >
            <span>Input Data</span>
            <Plus width={18} height={18} />
          </Button>
        </div>
      </div>

      {/* Box Section */}
      <div className="space-y-8">
        {renderBox("Pendapatan", "Pendapatan")}
        {renderBox("Belanja", "Belanja")}
        {renderBox("Pembiayaan", "Pembiayaan")}
      </div>
    </main>
  );
}
