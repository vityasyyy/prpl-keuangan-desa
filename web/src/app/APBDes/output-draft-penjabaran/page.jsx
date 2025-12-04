"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BreadCrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";
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
    console.log("🔄 Starting fetchData...");
    setLoading(true);
    try {
      // Fetch rincian yang masih draft (untuk halaman draft penjabaran)
      console.log("📡 Fetching draft rincian from:", `${API}/draft/rincian`);
      const rincianRes = await fetch(`${API}/draft/rincian`);
      console.log("📡 Rincian response status:", rincianRes.status);
      if (!rincianRes.ok) throw new Error("Failed to fetch rincian");
      const rincianData = await rincianRes.json();
      console.log("📊 Rincian data received:", rincianData.length, "items");
      console.log("📊 Rincian data:", rincianData);

      // Fetch penjabaran yang parent rinciannya masih draft
      console.log("📡 Fetching penjabaran from:", `${API}/draft/penjabaran`);
      const penjabaranRes = await fetch(`${API}/draft/penjabaran`);
      console.log("📡 Penjabaran response status:", penjabaranRes.status);
      if (!penjabaranRes.ok) throw new Error("Failed to fetch penjabaran");
      const penjabaranDataList = await penjabaranRes.json();
      console.log("📋 Penjabaran data received:", penjabaranDataList.length, "items");
      console.log("📋 Penjabaran data:", penjabaranDataList);

      // Filter penjabaran: hanya yang parent rinciannya masih draft
      const rincianDraftIds = rincianData.map(r => r.id);
      const filteredPenjabaran = penjabaranDataList.filter(p =>
        rincianDraftIds.includes(p.rincian_id)
      );
      console.log("🔍 Filtered penjabaran (only draft parents):", filteredPenjabaran.length, "items");

      console.log("✅ Total rincian:", rincianData.length, "items");
      console.log("✅ All rincian data:", rincianData);

      console.log("💾 Setting state - data:", rincianData.length, "items");
      console.log("💾 Setting state - penjabaranData:", filteredPenjabaran.length, "items");
      setData(rincianData);
      setPenjabaranData(filteredPenjabaran);
      console.log("✅ State updated successfully");
    } catch (error) {
      console.error("❌ Error in fetchData:", error);
      console.error("❌ Error stack:", error.stack);
      alert(`Gagal memuat data: ${error.message}`);
    } finally {
      setLoading(false);
      console.log("🏁 fetchData completed");
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

  // Posting penjabaran ke Buku APBDes (sekaligus posting parent rincian)
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
      // Get all penjabaran IDs
      const penjabaranIds = penjabaranData.map(p => p.id);

      console.log("🔍 Posting penjabaran:", penjabaranIds.length, "items");

      const confirmPost = window.confirm(
        `Apakah Anda yakin ingin memposting ${penjabaranData.length} item penjabaran ke Buku APBDes?\n\n` +
        `Parent rincian yang belum diposting akan ikut diposting.\n\n` +
        `Setelah diposting, data tidak dapat diubah lagi.`
      );

      if (!confirmPost) return;

      // Post semua penjabaran beserta parent rinciannya
      const res = await fetch(`${API}/draft/penjabaran/post-with-parent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ penjabaran_ids: penjabaranIds }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const result = await res.json();
      console.log("✅ Posting result:", result);

      alert(
        `✅ Berhasil memposting!\n\n` +
        `📝 ${result.data.penjabaran_count} penjabaran diposting\n` +
        `📋 ${result.data.posted_rincian_count} parent rincian diposting`
      );

      router.push("/APBDes/buku-apbdes");
    } catch (error) {
      console.error("❌ Error posting penjabaran:", error);
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
            className="bg-[#ff9500] hover:bg-[#e68600] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={() => alert("Fitur Unduh File belum diaktifkan")}
          >
            <span>Unduh File</span>
            <Download width={18} height={18} />
          </Button>
          <Button
            variant="solid"
            className="bg-[#0779ce] hover:bg-[#066bb8] text-white flex items-center justify-between px-4 py-2 rounded-lg w-48 shadow-sm"
            onClick={handlePostingAPB}
          >
            <span>Posting APB</span>
            <ArrowUpRight width={18} height={18} />
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
