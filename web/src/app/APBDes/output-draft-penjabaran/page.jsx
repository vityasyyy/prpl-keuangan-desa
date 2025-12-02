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
  const [loading, setLoading] = useState(true);
  const [kodeEkonomiMap, setKodeEkonomiMap] = useState({});
  const [kodeFungsiMap, setKodeFungsiMap] = useState({});
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Helpers: sanitize anggaran
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

  // Fetch kode ekonomi untuk mapping ID ke uraian
  const fetchKodeEkonomi = async () => {
    try {
      const res = await fetch(`${API}/kode-ekonomi`);
      if (!res.ok) throw new Error("Failed to fetch kode ekonomi");
      const ekonomiData = await res.json();
      
      // Create map: id -> full item
      const map = {};
      ekonomiData.forEach((item) => {
        map[item.id] = item;
      });
      setKodeEkonomiMap(map);
    } catch (error) {
      console.error("Error fetching kode ekonomi:", error);
    }
  };

  // Fetch kode fungsi untuk mapping ID ke uraian
  const fetchKodeFungsi = async () => {
    try {
      const res = await fetch(`${API}/kode-fungsi`);
      if (!res.ok) throw new Error("Failed to fetch kode fungsi");
      const fungsiData = await res.json();
      
      // Create map: id -> full item
      const map = {};
      fungsiData.forEach((item) => {
        map[item.id] = item;
      });
      setKodeFungsiMap(map);
    } catch (error) {
      console.error("Error fetching kode fungsi:", error);
    }
  };

  // Fetch data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch rincian dari draft (status = draft)
      const rincianDraftRes = await fetch(`${API}/draft/rincian`);
      if (!rincianDraftRes.ok) throw new Error("Failed to fetch draft rincian");
      const rincianDraftData = await rincianDraftRes.json();

      // TODO: Jika perlu fetch rincian posted juga, tambahkan endpoint baru di backend
      // Untuk sementara, kita hanya tampilkan draft rincian
      // Tapi penjabaran tetap bisa diinput untuk rincian yang sudah posted
      
      // Fetch penjabaran (semua status)
      const penjabaranRes = await fetch(`${API}/draft/penjabaran`);
      if (!penjabaranRes.ok) throw new Error("Failed to fetch penjabaran");
      const penjabaranDataList = await penjabaranRes.json();

      console.log("📊 Rincian data:", rincianDraftData);
      console.log("📋 Penjabaran data:", penjabaranDataList);

      // Jika ada penjabaran yang parent rinciannya sudah posted,
      // kita perlu fetch parent rincian tersebut juga
      const penjabaranRincianIds = [...new Set(penjabaranDataList.map(p => p.rincian_id))];
      const missingRincianIds = penjabaranRincianIds.filter(
        id => !rincianDraftData.some(r => r.id === id)
      );

      // Fetch missing rincian (yang sudah posted tapi punya penjabaran)
      let additionalRincian = [];
      if (missingRincianIds.length > 0) {
        console.log("🔍 Fetching missing rincian IDs:", missingRincianIds);
        const fetchPromises = missingRincianIds.map(id =>
          fetch(`${API}/draft/rincian/${id}`).then(res => res.ok ? res.json() : null)
        );
        const results = await Promise.all(fetchPromises);
        additionalRincian = results.filter(r => r !== null);
        console.log("➕ Additional rincian (posted):", additionalRincian);
      }

      // Gabungkan draft dan posted rincian
      const allRincian = [...rincianDraftData, ...additionalRincian];

      setData(allRincian);
      setPenjabaranData(penjabaranDataList);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when pathname/refreshKey changes
  useEffect(() => {
    fetchKodeEkonomi();
    fetchKodeFungsi();
    fetchData();

    // Listen untuk visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Tab visible - reloading data");
        fetchData();
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, refreshKey]);

  // Hitung total per kategori
  const total = (kategori) => {
    if (!data || data.length === 0) return 0;
    return data
      .filter((item) => {
        const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
        return ekonomiInfo && ekonomiInfo.uraian.toLowerCase().includes(kategori.toLowerCase());
      })
      .reduce((sum, item) => {
        // hitung juga total penjabaran untuk item ini
        const penjabaranSum = (penjabaranData || [])
          .filter((p) => String(p.rincian_id) === String(item.id))
          .reduce((s, p) => s + sanitizeNumber(p.jumlah_anggaran || 0), 0);
        const parentTotal = Math.max(sanitizeNumber(item.jumlah_anggaran || 0), penjabaranSum);
        return sum + parentTotal;
      }, 0);
  };

  // Ambil item per kategori
  const getItems = (kategori) => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => {
      const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
      return ekonomiInfo && ekonomiInfo.uraian.toLowerCase().includes(kategori.toLowerCase());
    });
  };

  // Posting penjabaran ke Buku APBDes
  const handlePostingAPB = async () => {
    if (!data || data.length === 0) {
      alert("Belum ada data rincian. Silakan input data rincian terlebih dahulu.");
      return;
    }

    if (!penjabaranData || penjabaranData.length === 0) {
      alert("Belum ada data penjabaran yang dapat diposting.");
      return;
    }

    try {
      // Get apbdes_id from first rincian item
      const apbdesId = data[0]?.apbdes_id;
      if (!apbdesId) {
        alert("Data tidak valid: apbdes_id tidak ditemukan.");
        return;
      }

      // STEP 1: Check if rincian sudah diposting
      const statusRes = await fetch(`${API}/status/${apbdesId}`);
      if (!statusRes.ok) {
        throw new Error("Gagal memeriksa status APBDes");
      }
      
      const statusData = await statusRes.json();
      console.log("📊 APBDes Status:", statusData);
      
      if (statusData.status !== "posted") {
        const postRincianFirst = window.confirm(
          "⚠️ APBDes Rincian belum diposting!\n\n" +
          "Untuk memposting penjabaran, Anda harus memposting APBDes Rincian terlebih dahulu.\n\n" +
          "Apakah Anda ingin memposting APBDes Rincian sekarang?"
        );
        
        if (postRincianFirst) {
          // Redirect ke halaman draft apbdes untuk posting rincian
          router.push("/APBDes/output-draft-apbdes");
          return;
        } else {
          return; // User membatalkan
        }
      }

      // STEP 2: Jika rincian sudah diposting, lanjutkan posting penjabaran
      const confirmPost = window.confirm(
        `Apakah Anda yakin ingin memposting ${penjabaranData.length} item penjabaran ke Buku APBDes?\n\n` +
        `Setelah diposting, data tidak dapat diubah lagi.`
      );
      
      if (!confirmPost) return;

      // Post semua penjabaran
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      for (const penjabaran of penjabaranData) {
        try {
          const res = await fetch(`${API}/draft/penjabaran/${penjabaran.id}/penjabaran/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (res.ok) {
            successCount++;
          } else {
            errorCount++;
            const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
            errors.push(`ID ${penjabaran.id}: ${errorData.message || res.statusText}`);
            console.error(`Failed to post penjabaran ${penjabaran.id}:`, errorData);
          }
        } catch (err) {
          errorCount++;
          errors.push(`ID ${penjabaran.id}: ${err.message}`);
          console.error(`Error posting penjabaran ${penjabaran.id}:`, err);
        }
      }

      if (errorCount === 0) {
        alert(`✅ Berhasil memposting ${successCount} item penjabaran ke Buku APBDes.`);
        router.push("/APBDes/buku-apbdes");
      } else {
        const errorMsg = errors.length > 0 ? `\n\nError:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}` : '';
        alert(
          `⚠️ Posting selesai dengan:\n` +
          `✅ ${successCount} berhasil\n` +
          `❌ ${errorCount} gagal` +
          errorMsg +
          `\n\nSilakan periksa console untuk detail lengkap.`
        );
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error("Error posting penjabaran:", error);
      alert(`❌ Gagal posting penjabaran: ${error.message}`);
    }
  };

  const renderBox = (title, kategori) => {
    const items = getItems(kategori);

    if (loading) {
      return (
        <div className="rounded-2xl bg-white p-8 text-center">
          <p className="text-gray-500">Memuat data...</p>
        </div>
      );
    }

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
                // Filter penjabaran untuk item ini
                const itemPenjabaran = penjabaranData.filter((p) => String(p.rincian_id) === String(item.id));
                // jumlahkan semua anggaran penjabaran untuk parent ini
                const penjabaranSum = (itemPenjabaran || []).reduce((s, p) => s + sanitizeNumber(p.jumlah_anggaran || 0), 0);
                // jika penjabaran sum lebih besar, tunjukkan penjabaranSum sebagai total parent
                const parentTotal = Math.max(sanitizeNumber(item.jumlah_anggaran || 0), penjabaranSum);
                
                // Get uraian - prioritaskan kode_ekonomi_id karena itu yang paling spesifik (child terakhir)
                const ekonomiInfo = kodeEkonomiMap[item.kode_ekonomi_id];
                const fungsiInfo = kodeFungsiMap[item.kode_fungsi_id];
                
                // Gunakan uraian dari kode ekonomi (level child terakhir: objek > jenis > kelompok > akun)
                // Jika tidak ada, baru gunakan fungsi (kegiatan > sub-bidang > bidang)
                const displayUraian = ekonomiInfo?.uraian || fungsiInfo?.uraian || "Tidak ada uraian";

                console.log(`🔍 Item ${item.id}:`, {
                  kode_ekonomi: ekonomiInfo?.full_code,
                  kode_fungsi: fungsiInfo?.full_code,
                  ekonomi_uraian: ekonomiInfo?.uraian,
                  fungsi_uraian: fungsiInfo?.uraian,
                  displayUraian,
                  rincian_id: item.id,
                  penjabaranCount: itemPenjabaran.length,
                  penjabaranSum,
                  parentTotal,
                });

                return (
                  <div key={item.id || idx}>
                    {/* Item Draft APBDes */}
                    <div className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition">
                      <div className="flex items-center text-sm text-gray-800 space-x-2">
                        <span>{displayUraian}</span>
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

                    {/* Item Penjabaran dengan Indentasi */}
                    {itemPenjabaran.length > 0 && (
                      <div className="ml-8 border-l-2 border-gray-200 pl-4">
                        {itemPenjabaran.map((penjabaran, pIdx) => {
                          // Get uraian for penjabaran - prioritaskan kode_ekonomi_id (child terakhir)
                          const penjabaranEkonomiInfo = kodeEkonomiMap[penjabaran.kode_ekonomi_id];
                          const penjabaranFungsiInfo = kodeFungsiMap[penjabaran.kode_fungsi_id];
                          
                          // Gunakan uraian dari kode ekonomi (level child terakhir)
                          const penjabaranUraian = penjabaranEkonomiInfo?.uraian || penjabaranFungsiInfo?.uraian || "Penjabaran";

                          return (
                            <div
                              key={penjabaran.id || pIdx}
                              className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 rounded-md transition text-gray-700"
                            >
                              <div className="flex items-center text-sm space-x-2">
                                <span>{penjabaranUraian}</span>
                                <button
                                  className="ml-1 text-blue-600 hover:text-blue-800 transition"
                                  onClick={() => router.push(`/APBDes/input-draft-penjabaran?id=${penjabaran.id}&rincian_id=${item.id}`)}
                                  title="Edit penjabaran"
                                >
                                  <Pencil width={16} height={16} />
                                </button>
                              </div>
                              <div className="text-sm font-light">
                                Rp{sanitizeNumber(penjabaran.jumlah_anggaran || 0).toLocaleString("id-ID", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
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
