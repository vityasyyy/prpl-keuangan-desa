"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { Calendar } from "lucide-react";
import Footer from "@/features/kas-pembantu/Footer";

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

function parseCurrency(value) {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9,-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef(null);
  const editId = searchParams.get("id");

  // Form state
  const [tanggal, setTanggal] = useState("");
  const [kodeRek, setKodeRek] = useState("");
  const [bidang, setBidang] = useState("");
  const [subBidang, setSubBidang] = useState("");
  const [kegiatan, setKegiatan] = useState("");
  const [uraian, setUraian] = useState("");
  const [dariBendahara, setDariBendahara] = useState("");
  const [swadaya, setSwadaya] = useState("");
  const [belanjaBarang, setBelanjaBarang] = useState("");
  const [belanjaModal, setBelanjaModal] = useState("");
  const [nomorBukti, setNomorBukti] = useState("");
  const [jumlahPengembalian, setJumlahPengembalian] = useState(""); // New state for Jumlah Pengembalian

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buatLagi, setBuatLagi] = useState(false);
  const [calculatedSaldo, setCalculatedSaldo] = useState(0);

  // Category dropdown data
  const [bidangOptions, setBidangOptions] = useState([]);
  const [subBidangOptions, setSubBidangOptions] = useState([]);
  const [kegiatanOptions, setKegiatanOptions] = useState([]);

  // Fetch data if in edit mode
  useEffect(() => {
    async function fetchKegiatanData() {
      if (editId) {
        try {
          setLoading(true);
          // GET http://localhost:8081/api/kas-pembantu/kegiatan/{id}
          const response = await fetch(`${API_BASE_URL}/api/kas-pembantu/kegiatan/${editId}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const result = await response.json();
          const data = result.data;
          
          // Basic fields that are directly stored
          setTanggal(data.tanggal || "");
          setUraian(data.uraian || "");
          
          // Map stored data back to form fields
          setDariBendahara(String(data.penerimaan || 0));
          setSwadaya("0");
          setBelanjaBarang(String(data.pengeluaran || 0));  
          setBelanjaModal("0");
          
          // Set type_enum to kegiatan dropdown if available
          setKegiatan(data.type_enum || "");
          
          // Set default values for fields that aren't stored in DB
          setKodeRek("");
          setBidang("");
          setSubBidang("");
          setNomorBukti("");
          setJumlahPengembalian("0");
          
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchKegiatanData();
  }, [editId]);

  // Fetch initial bidang options
  useEffect(() => {
    async function fetchBidang() {
      try {
        // Placeholder: fetch bidang options from API if endpoint exists
        setBidangOptions([]);
      } catch (err) {
        console.error("Failed to fetch bidang:", err);
      }
    }
    fetchBidang();
  }, []);

  // Fetch sub-bidang when bidang changes
  useEffect(() => {
    if (bidang) {
      async function fetchSubBidang() {
        try {
          // Placeholder: fetch sub-bidang options from API if endpoint exists
          setSubBidangOptions([]);
          setSubBidang("");
          setKegiatanOptions([]);
        } catch (err) {
          console.error("Failed to fetch sub-bidang:", err);
        }
      }
      fetchSubBidang();
    } else {
      setSubBidangOptions([]);
      setKegiatanOptions([]);
    }
  }, [bidang]);

  // Fetch kegiatan when sub-bidang changes
  useEffect(() => {
    if (subBidang) {
      async function fetchKegiatan() {
        try {
          // Placeholder: fetch kegiatan options from API if endpoint exists
          setKegiatanOptions([]);
          setKegiatan("");
        } catch (err) {
          console.error("Failed to fetch kegiatan:", err);
        }
      }
      fetchKegiatan();
    } else {
      setKegiatanOptions([]);
    }
  }, [subBidang]);

  // Calculate saldo automatically when input values change
  useEffect(() => {
    const penerimaan = parseFloat(dariBendahara || 0) + parseFloat(swadaya || 0);
    const pengeluaran = parseFloat(belanjaBarang || 0) + parseFloat(belanjaModal || 0);
    const saldo = penerimaan - pengeluaran;
    setCalculatedSaldo(saldo);
  }, [dariBendahara, swadaya, belanjaBarang, belanjaModal]);

  const formatTanggal = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async () => {
    if (editId) {
      if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        try {
          setLoading(true);
          setError(null);
          // DELETE http://localhost:8081/api/kas-pembantu/kegiatan/{id}
          const response = await fetch(`${API_BASE_URL}/api/kas-pembantu/kegiatan/${editId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          router.push("/Kas-pembantu-kegiatan");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setTanggal("");
      setKodeRek("");
      setBidang("");
      setSubBidang("");
      setKegiatan("");
      setUraian("");
      setDariBendahara("");
      setSwadaya("");
      setBelanjaBarang("");
      setBelanjaModal("");
      setNomorBukti("");
      setJumlahPengembalian("");
      setError(null);
      setCalculatedSaldo(0);
    }
  };

  const handleCreate = () => {
    setBuatLagi(true);
    // Reset form
    setTanggal("");
    setKodeRek("");
    setBidang("");
    setSubBidang("");
    setKegiatan("");
    setUraian("");
    setDariBendahara("");
    setSwadaya("");
    setBelanjaBarang("");
    setBelanjaModal("");
    setNomorBukti("");
    setJumlahPengembalian(""); // Reset Jumlah Pengembalian
    setError(null);
    setCalculatedSaldo(0);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validation
    if (!tanggal || !uraian) {
      setError("Tanggal dan Uraian harus diisi");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse currency values
      const penerimaan = parseCurrency(dariBendahara) + parseCurrency(swadaya);
      const pengeluaran = parseCurrency(belanjaBarang) + parseCurrency(belanjaModal);

      // Map classification to type_enum
      const type_enum = kegiatan || "kegiatan";

      // Prepare payload
      const payload = {
        bku_id: "bku003", // Default for now
        type_enum: type_enum,
        tanggal: tanggal, // Already in YYYY-MM-DD format
        uraian: uraian,
        penerimaan: penerimaan,
        pengeluaran: pengeluaran,
      };

      // Submit to API - use update if editId exists, otherwise create
      if (editId) {
        // PUT http://localhost:8081/api/kas-pembantu/kegiatan/{id}
        const response = await fetch(`${API_BASE_URL}/api/kas-pembantu/kegiatan/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      } else {
        // POST http://localhost:8081/api/kas-pembantu/kegiatan
        const response = await fetch(`${API_BASE_URL}/api/kas-pembantu/kegiatan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      }

      // Success - check if "buat lagi" is enabled
      if (buatLagi && !editId) {
        handleCreate();
      } else {
        // Redirect to list
        router.push("/Kas-pembantu-kegiatan");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const memoizedSetDariBendahara = useCallback((value) => {
    setDariBendahara(value);
  }, []);

  const memoizedSetSwadaya = useCallback((value) => {
    setSwadaya(value);
  }, []);

  const memoizedSetBelanjaBarang = useCallback((value) => {
    setBelanjaBarang(value);
  }, []);

  const memoizedSetBelanjaModal = useCallback((value) => {
    setBelanjaModal(value);
  }, []);

  const memoizedSetJumlahPengembalian = useCallback((value) => {
    setJumlahPengembalian(value);
  }, []);

  // Helper untuk input Rupiah (dipakai berulang kali)
  const RupiahInput = useCallback(
    ({ label, placeholder, value, onChange }) => {
      return (
        <div className="relative">
          <label className="mb-1 block text-sm text-gray-800">{label}</label>
          <span className="absolute top-[34px] left-3 text-sm text-gray-400">
            Rp
          </span>
          <input
            type="number"
            placeholder={placeholder || "0"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
          />
        </div>
      );
    },
    []
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Kegiatan"]} />

        <h1 className="mt-2 mb-6 text-[20px] font-semibold text-gray-800">
          {editId ? "Edit Data Pembantu Kegiatan" : "Input Data Pembantu Kegiatan"}
        </h1>

        {/* Show loading state when fetching data in edit mode */}
        {editId && loading ? (
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSave}>
          {/* Error Alert */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Detail */}
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-800">Detail</h2>

            <div className="flex flex-col space-y-4">
              {/* Tanggal */}
              <div>
                <label className="mb-1 block text-sm text-gray-800">Tanggal</label>
                <div
                  className="relative w-[180px] cursor-pointer rounded-md border border-gray-300 bg-white py-2 pr-3 pl-9 transition-colors focus-within:ring-1 focus-within:ring-gray-400 hover:bg-gray-50"
                  onClick={() => dateInputRef.current?.showPicker()}
                >
                  <Calendar className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-gray-600" />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer [appearance:none] opacity-0 [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <span className="pointer-events-none text-sm text-gray-800 uppercase select-none">
                    {tanggal ? formatTanggal(tanggal) : "DD/MM/YYYY"}
                  </span>
                </div>
              </div>

              {/* Klasifikasi Bidang Kegiatan */}
              <div>
                <label className="mb-1 block text-sm text-gray-800">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <input
                    type="text"
                    placeholder="Kode Rek"
                    value={kodeRek}
                    onChange={(e) => setKodeRek(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  />
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                  >
                    <option value="">Bidang</option>
                    {bidangOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.uraian}
                      </option>
                    ))}
                  </select>
                  <select
                    value={subBidang}
                    onChange={(e) => setSubBidang(e.target.value)}
                    disabled={!bidang}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-gray-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Sub-Bidang</option>
                    {subBidangOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.uraian}
                      </option>
                    ))}
                  </select>
                  <select
                    value={kegiatan}
                    onChange={(e) => setKegiatan(e.target.value)}
                    disabled={!subBidang}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:ring-1 focus:ring-gray-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Kegiatan</option>
                    {kegiatanOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.uraian}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Uraian */}
              <div>
                <label className="mb-1 block text-sm text-gray-800">Uraian</label>
                <input
                  type="text"
                  placeholder="Uraian Pajak / Retribusi / Penerimaan Lainnya"
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-600 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Penerimaan */}
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-800">Penerimaan</h2>
            <div className="flex flex-col space-y-4">
              <RupiahInput
                label="Dari Bendahara"
                value={dariBendahara}
                onChange={memoizedSetDariBendahara}
              />
              <RupiahInput
                label="Swadaya Masyarakat"
                value={swadaya}
                onChange={memoizedSetSwadaya}
              />
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-800">Pengeluaran</h2>
            <div className="flex flex-col space-y-4">
              <RupiahInput
                label="Belanja Barang dan Jasa"
                value={belanjaBarang}
                onChange={memoizedSetBelanjaBarang}
              />
              <RupiahInput
                label="Belanja Modal"
                value={belanjaModal}
                onChange={memoizedSetBelanjaModal}
              />
            </div>
          </div>

          {/* Bukti dan Kumulatif */}
          <div className="rounded-2xl border border-gray-300 bg-white p-5">
            <h2 className="mb-4 font-semibold text-gray-800">Bukti dan Kumulatif</h2>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <label className="mb-1 block text-sm text-gray-800">Nomor Bukti</label>
                <span className="absolute top-[34px] left-3 text-sm text-gray-400">No</span>
                <input
                  type="text"
                  placeholder="12345"
                  value={nomorBukti}
                  onChange={(e) => setNomorBukti(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                />
              </div>
              <RupiahInput
                label="Jumlah Pengembalian ke Bendahara"
                value={jumlahPengembalian}
                onChange={memoizedSetJumlahPengembalian}
              />
            </div>
          </div>

          {/* Saldo Kas (Automated) */}
          <div>
            <h2 className="mb-2 font-semibold text-gray-800">Saldo Kas (Automated)</h2>
            <div className="rounded-md border border-gray-300 bg-white px-3 py-2">
              <div className="relative flex items-center">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={formatCurrency(calculatedSaldo)}
                  readOnly
                  className="w-full bg-white py-1.5 pr-3 pl-9 text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer (Tombol Aksi) */}
          <Footer
            onDelete={handleDelete}
            onCreate={handleCreate}
            onSave={handleSave}
            isLoading={loading}
          />
        </form>
        )}
      </div>
    </div>
  );
}
