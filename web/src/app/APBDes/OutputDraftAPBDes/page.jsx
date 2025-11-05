"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import { ArrowUpRight, Download, Plus } from "@/components/icons";

export default function OutputAPBDes() {
  const router = useRouter();
  const [data, setData] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("apbdesData") || "[]");
    setData(saved);
  }, []);

  const total = (kategori) => {
    if (!data || data.length === 0) return 0;
    return data
      .filter((item) => item.pendapatanBelanja === kategori)
      .reduce((sum, item) => sum + Number(item.anggaran || 0), 0);
  };

  const getItems = (kategori) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => item.pendapatanBelanja === kategori);
  };

  const renderBox = (title, kategori, color) => {
    const items = getItems(kategori);

    return (
      <div className="border border-gray-300 rounded-2xl p-4">
        <div className="flex flex-col">
          {/* Header Section */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
            <h3 className="text-base font-semibold text-[#011829]">{title}</h3>
            <p className="text-sm text-gray-700 font-medium">
              Total:{" "}
              <span className="text-black font-semibold">
                Rp {total(kategori).toLocaleString("id-ID")}
              </span>
            </p>
          </div>

          {/* Scrollable Section */}
          <div className="overflow-x-auto">
            {items.length > 0 ? (
              <div className="flex space-x-3 min-w-[800px]">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 border border-gray-200 rounded-xl p-3 w-60 shadow-sm"
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {item.uraian2 || "-"}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {item.kegiatan || ""}
                    </p>
                    <p className={`text-sm font-semibold ${color}`}>
                      Rp {Number(item.anggaran).toLocaleString("id-ID")}
                    </p>
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
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-white px-6 md:px-16 py-8">
      <BreadCrumb category="APBDes" title="Output APBDes" />

      <div className="flex justify-between items-start mb-6">
  {/* Bagian kiri: Title */}
  <div>
    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
      Draft APBDes
    </h1>
    <h3 className="text-sm font-normal text-gray-700 mt-1">
      Anggaran Pendapatan dan Belanja Pemerintah Desa BANGUNTAPAN Tahun Anggaran 2025
    </h3>
  </div>

  {/* Bagian kanan: Button Stack */}
  <div className="flex flex-col space-y-2">
    {/* Tombol 1: Posting APB */}
    <Button
        variant="solid"
        className="bg-[#0779ce] hover:bg-[#066bb8] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
        onClick={() => alert("Fitur Posting APB belum diaktifkan")}
    >
        <span>Posting APB</span>
        <ArrowUpRight width={18} height={18} />
    </Button>

    {/* Tombol 2: Unduh File */}
    <Button
        variant="solid"
        className="bg-[#ff9500] hover:bg-[#e68600] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
        onClick={() => alert("Fitur Unduh File belum diaktifkan")}
    >
        <span>Unduh File</span>
        <Download width={18} height={18} />
    </Button>

    {/* Tombol 3: Input Data */}
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
    <div className="space-y-6">
        {renderBox("Pendapatan", "Pendapatan", "text-[#0779ce]")}
        {renderBox("Belanja", "Belanja", "text-[#ff9500]")}
        {renderBox("Pembiayaan", "Pembiayaan", "text-[#069250]")}
    </div>
    </main>
  );
}
