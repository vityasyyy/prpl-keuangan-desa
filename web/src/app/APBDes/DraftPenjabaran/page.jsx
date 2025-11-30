"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import { ArrowUpRight, Download, Plus, SquarePlus, Pencil } from "@/components/icons";

export default function OutputAPBDes() {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState([]);
  const [penjabaranData, setPenjabaranData] = useState([]);

  // Load data input draft APBDes dan penjabaran
  useEffect(() => {
    const loadData = () => {
      const saved = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const penjabaranSaved = JSON.parse(localStorage.getItem("penjabaranData") || "[]");
      console.log("📊 Loading data:");
      console.log("  Draft APBDes:", saved);
      console.log("  Penjabaran:", penjabaranSaved);
      setData(saved);
      setPenjabaranData(penjabaranSaved);
    };

    // Load data setiap kali pathname berubah
    loadData();

    // Listen untuk storage events
    const handleStorageChange = () => {
      console.log("🔄 Storage changed - reloading data");
      loadData();
    };

    // Listen untuk custom events dari InputDraftPenjabaran
    const handlePenjabaranUpdate = () => {
      console.log("✅ Penjabaran updated - reloading data");
      loadData();
    };

    // Listen untuk visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Tab visible - reloading data");
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("penjabaran:update", handlePenjabaranUpdate);
    window.addEventListener("apbdes:update", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("penjabaran:update", handlePenjabaranUpdate);
      window.removeEventListener("apbdes:update", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  // Hitung total per kategori
  const total = (kategori) => {
    if (!data || data.length === 0) return 0;
    return data
      .filter((item) => (item.pendapatanBelanja || "").toLowerCase() === kategori.toLowerCase())
      .reduce((sum, item) => sum + Number(item.anggaran || 0), 0);
  };

  // Ambil item per kategori
  const getItems = (kategori) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => (item.pendapatanBelanja || "").toLowerCase() === kategori.toLowerCase());
  };

  // Simpan hasil posting ke localStorage
  const handlePostingAPB = () => {
    if (!data || data.length === 0) {
      alert("Belum ada data yang dapat diposting.");
      return;
    }

    localStorage.setItem("apbdesPosted", JSON.stringify(data));
    alert("✅ APBDes berhasil diposting ke Buku APBDes.");
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
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[180px]">
          {items.length > 0 ? (
            <div className="divide-y divide-gray-300">
              {items.map((item, idx) => {
                // Filter penjabaran untuk item ini - konversi ke string untuk matching
                const itemPenjabaran = penjabaranData.filter(p => String(p.rincian_id) === String(item.id));
                console.log(`🔍 Item ${item.id}:`, {
                  item: item.objek || item.jenis || item.kelompok,
                  rincian_id: item.id,
                  rincian_id_type: typeof item.id,
                  penjabaranCount: itemPenjabaran.length,
                  penjabaran: itemPenjabaran
                });
                
                return (
                  <div key={item.id || idx}>
                    {/* Item Draft APBDes */}
                    <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition">
                      <div className="flex items-center text-sm text-gray-800 space-x-2">
                        <span>{item.objek || item.jenis || item.kelompok || item.pendapatanBelanja || "Tidak ada uraian"}</span>
                        <button
                          className="ml-1 text-gray-600 hover:text-gray-900 transition"
                          onClick={() => router.push(`/APBDes/InputDraftPenjabaran?rincian_id=${item.id}`)}
                        >
                          <SquarePlus width={20} height={20} />
                        </button>
                      </div>
                      <div className="text-sm font-light text-black">
                        Rp{Number(item.anggaran || 0).toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Item Penjabaran dengan Indentasi */}
                    {itemPenjabaran.length > 0 && (
                      <div className="ml-8 border-l-2 border-gray-200 pl-4">
                        {itemPenjabaran.map((penjabaran, pIdx) => (
                          <div
                            key={penjabaran.id || pIdx}
                            className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition text-gray-700"
                          >
                            <div className="flex items-center text-sm space-x-2">
                              <span>{penjabaran.objek || penjabaran.jenis || penjabaran.kelompok || "Penjabaran"}</span>
                              <button
                                className="ml-1 text-blue-600 hover:text-blue-800 transition"
                                onClick={() => router.push(`/APBDes/InputDraftPenjabaran?id=${penjabaran.id}&rincian_id=${item.id}`)}
                                title="Edit penjabaran"
                              >
                                <Pencil width={16} height={16} />
                              </button>
                            </div>
                            <div className="text-sm font-light">
                              Rp{Number(penjabaran.anggaran || 0).toLocaleString("id-ID", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
      <BreadCrumb category="APBDes" title="Draft Penjabaran APBDes" />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Draft Penjabaran APBDes
          </h1>
          <h3 className="text-sm font-normal text-gray-700 mt-1">
            Penjabaran Anggaran Pendapatan dan Belanja Pemerintah Desa
            BANGUNTAPAN Tahun Anggaran 2025
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            variant="solid"
            className="bg-[#0779ce] hover:bg-[#066bb8] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={handlePostingAPB}
          >
            <span>Posting APB</span>
            <ArrowUpRight width={18} height={18} />
          </Button>

          <Button
            variant="solid"
            className="bg-[#ff9500] hover:bg-[#e68600] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={() => alert("Fitur Unduh File belum diaktifkan")}
          >
            <span>Unduh File</span>
            <Download width={18} height={18} />
          </Button>

          {/* <Button
            variant="solid"
            className="bg-[#069250] hover:bg-[#058544] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={() => router.push("/APBDes/InputDraftPenjabaran")}
          >
            <span>Input Data</span>
            <Plus width={18} height={18} />
          </Button> */}
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
