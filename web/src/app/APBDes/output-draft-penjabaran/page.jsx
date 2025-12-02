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
  const [refreshKey, setRefreshKey] = useState(0);

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

    // Listen untuk apbdes updates
    const handleApbdesUpdate = () => {
      console.log("📝 APBDes updated - reloading data");
      loadData();
    };

    // Listen untuk visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Tab visible - reloading data");
        loadData();
        // Force re-render
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("penjabaran:update", handlePenjabaranUpdate);
    window.addEventListener("apbdes:update", handleApbdesUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("penjabaran:update", handlePenjabaranUpdate);
      window.removeEventListener("apbdes:update", handleApbdesUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, refreshKey]);

  // Hitung total per kategori - menjumlahkan semua level
  const total = (kategori) => {
    if (!data || data.length === 0) return 0;
    
    // Filter semua item dengan kategori yang sesuai (semua level)
    const allItems = data.filter((item) => 
      (item.pendapatanBelanja || "").toLowerCase() === kategori.toLowerCase()
    );
    
    return allItems.reduce((sum, item) => {
      // Hitung total penjabaran untuk item ini
      const penjabaranSum = (penjabaranData || [])
        .filter((p) => String(p.rincian_id) === String(item.id))
        .reduce((s, p) => s + Number(p.anggaran || 0), 0);
      
      // Ambil nilai terbesar antara anggaran item atau total penjabarannya
      const itemTotal = Math.max(Number(item.anggaran || 0), penjabaranSum);
      return sum + itemTotal;
    }, 0);
  };

  // Ambil item per kategori
  const getItems = (kategori) => {
    if (!data || data.length === 0) return [];
    
    // Filter items dengan kategori yang sesuai
    const filtered = data.filter((item) => 
      (item.pendapatanBelanja || "").toLowerCase() === kategori.toLowerCase()
    );
    
    // Jika ada data dengan level, filter hanya kelompok atau yang tidak punya parent
    const hasLevelProperty = filtered.some(item => item.level);
    if (hasLevelProperty) {
      return filtered.filter(item => 
        (item.level || "").toLowerCase() === "kelompok" || 
        !item.parent_id  // atau yang tidak punya parent (data lama)
      );
    }
    
    // Jika tidak ada property level, return semua (untuk backward compatibility)
    return filtered;
  };

  // Ambil item jenis untuk parent tertentu
  const getJenisItems = (parentId) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => 
      String(item.parent_id) === String(parentId) && 
      (item.level || "").toLowerCase() === "jenis"
    );
  };

  // Ambil item objek untuk parent tertentu
  const getObjekItems = (parentId) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => 
      String(item.parent_id) === String(parentId) && 
      (item.level || "").toLowerCase() === "objek"
    );
  };

  // Simpan hasil posting ke localStorage
  const handlePostingAPB = () => {
    if (!data || data.length === 0) {
      alert("Belum ada data yang dapat diposting.");
      return;
    }

    localStorage.setItem("apbdesPosted", JSON.stringify(data));
    alert("✅ APBDes berhasil diposting ke Buku APBDes.");
    router.push("/APBDes/buku-apbdes");
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
                // Filter penjabaran untuk item kelompok ini
                const itemPenjabaran = penjabaranData.filter((p) => String(p.rincian_id) === String(item.id));
                const penjabaranSum = (itemPenjabaran || []).reduce((s, p) => s + Number(p.anggaran || 0), 0);
                const parentTotal = Math.max(Number(item.anggaran || 0), penjabaranSum);

                // Ambil item jenis yang merupakan child dari kelompok ini
                const jenisItems = getJenisItems(item.id);

                return (
                  <div key={item.id || idx}>
                    {/* Item Kelompok (Level 1) atau Data Lama */}
                    <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition">
                      <div className="flex items-center text-sm text-gray-800 space-x-2">
                        {/* Tampilkan uraian sesuai dengan property yang ada */}
                        <span className="font-semibold">
                          {item.kelompok || item.jenis || item.objek || item.uraian || "Tidak ada uraian"}
                        </span>
                        <button
                          className="ml-1 text-gray-600 hover:text-gray-900 transition"
                          onClick={() => router.push(`/APBDes/input-draft-penjabaran?rincian_id=${item.id}`)}
                          title="Tambah penjabaran"
                        >
                          <SquarePlus width={20} height={20} />
                        </button>
                      </div>
                      <div className="text-sm font-light text-black">
                        Rp{parentTotal.toLocaleString("id-ID", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>

                    {/* Item Penjabaran Kelompok dengan Indentasi */}
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
                                onClick={() => router.push(`/APBDes/input-draft-penjabaran?id=${penjabaran.id}&rincian_id=${item.id}`)}
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

                    {/* Item Jenis (Level 2) - Child dari Kelompok */}
                    {jenisItems.length > 0 && (
                      <div className="ml-6 border-l-2 border-blue-200 pl-4">
                        {jenisItems.map((jenisItem, jIdx) => {
                          // Filter penjabaran untuk item jenis ini
                          const jenisPenjabaran = penjabaranData.filter((p) => String(p.rincian_id) === String(jenisItem.id));
                          const jenisPenjabaranSum = (jenisPenjabaran || []).reduce((s, p) => s + Number(p.anggaran || 0), 0);
                          const jenisTotal = Math.max(Number(jenisItem.anggaran || 0), jenisPenjabaranSum);

                          // Ambil item objek yang merupakan child dari jenis ini
                          const objekItems = getObjekItems(jenisItem.id);

                          return (
                            <div key={jenisItem.id || `jenis-${jIdx}`} className="mt-1">
                              {/* Item Jenis */}
                              <div className="flex items-center justify-between py-2 px-2 hover:bg-blue-50 rounded-md transition">
                                <div className="flex items-center text-sm text-blue-800 space-x-2">
                                  <span className="font-medium">{jenisItem.jenis || "Tidak ada uraian"}</span>
                                  <button
                                    className="ml-1 text-blue-600 hover:text-blue-900 transition"
                                    onClick={() => router.push(`/APBDes/input-draft-penjabaran?rincian_id=${jenisItem.id}`)}
                                    title="Tambah item objek"
                                  >
                                    <SquarePlus width={18} height={18} />
                                  </button>
                                </div>
                                <div className="text-sm font-light text-blue-900">
                                  Rp{jenisTotal.toLocaleString("id-ID", {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                              </div>

                              {/* Item Penjabaran Jenis dengan Indentasi */}
                              {jenisPenjabaran.length > 0 && (
                                <div className="ml-8 border-l-2 border-gray-200 pl-4">
                                  {jenisPenjabaran.map((penjabaran, pIdx) => (
                                    <div
                                      key={penjabaran.id || pIdx}
                                      className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition text-gray-600"
                                    >
                                      <div className="flex items-center text-sm space-x-2">
                                        <span>{penjabaran.objek || penjabaran.jenis || penjabaran.kelompok || "Penjabaran"}</span>
                                        <button
                                          className="ml-1 text-blue-600 hover:text-blue-800 transition"
                                          onClick={() => router.push(`/APBDes/input-draft-penjabaran?id=${penjabaran.id}&rincian_id=${jenisItem.id}`)}
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

                              {/* Item Objek (Level 3) - Child dari Jenis */}
                              {objekItems.length > 0 && (
                                <div className="ml-6 border-l-2 border-green-200 pl-4">
                                  {objekItems.map((objekItem, oIdx) => {
                                    // Filter penjabaran untuk item objek ini
                                    const objekPenjabaran = penjabaranData.filter((p) => String(p.rincian_id) === String(objekItem.id));
                                    const objekPenjabaranSum = (objekPenjabaran || []).reduce((s, p) => s + Number(p.anggaran || 0), 0);
                                    const objekTotal = Math.max(Number(objekItem.anggaran || 0), objekPenjabaranSum);

                                    return (
                                      <div key={objekItem.id || `objek-${oIdx}`} className="mt-1">
                                        {/* Item Objek */}
                                        <div className="flex items-center justify-between py-2 px-2 hover:bg-green-50 rounded-md transition">
                                          <div className="flex items-center text-sm text-green-800 space-x-2">
                                            <span>{objekItem.objek || "Tidak ada uraian"}</span>
                                            <button
                                              className="ml-1 text-green-600 hover:text-green-900 transition"
                                              onClick={() => router.push(`/APBDes/input-draft-penjabaran?rincian_id=${objekItem.id}`)}
                                              title="Tambah penjabaran objek"
                                            >
                                              <SquarePlus width={16} height={16} />
                                            </button>
                                          </div>
                                          <div className="text-sm font-light text-green-900">
                                            Rp{objekTotal.toLocaleString("id-ID", {
                                              minimumFractionDigits: 2,
                                            })}
                                          </div>
                                        </div>

                                        {/* Item Penjabaran Objek dengan Indentasi */}
                                        {objekPenjabaran.length > 0 && (
                                          <div className="ml-8 border-l-2 border-gray-200 pl-4">
                                            {objekPenjabaran.map((penjabaran, pIdx) => (
                                              <div
                                                key={penjabaran.id || pIdx}
                                                className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition text-gray-600"
                                              >
                                                <div className="flex items-center text-sm space-x-2">
                                                  <span>{penjabaran.objek || penjabaran.jenis || penjabaran.kelompok || "Penjabaran"}</span>
                                                  <button
                                                    className="ml-1 text-blue-600 hover:text-blue-800 transition"
                                                    onClick={() => router.push(`/APBDes/input-draft-penjabaran?id=${penjabaran.id}&rincian_id=${objekItem.id}`)}
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
                              )}
                            </div>
                          );
                        })}
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
