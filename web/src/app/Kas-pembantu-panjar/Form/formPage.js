"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { Calendar } from "lucide-react";
import Footer from "@/features/kas-pembantu/Footer";
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

// Convert any date format to YYYY-MM-DD
function toYYYYMMDD(dateValue) {
  if (!dateValue) return "";

  try {
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }

    // Parse ISO string or other formats
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

// Format YYYY-MM-DD to DD/MM/YYYY for display
function formatTanggalDisplay(dateValue) {
  if (!dateValue) return "";

  try {
    // Extract YYYY-MM-DD format
    const yyyymmdd = toYYYYMMDD(dateValue);
    if (!yyyymmdd) return "";

    const [year, month, day] = yyyymmdd.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

export default function FormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef(null);
  const editId = searchParams.get("id");

  const { token } = useAuth() || {};


  // Form state
  const [tanggal, setTanggal] = useState("");
  const [uraian, setUraian] = useState("");
  const [pemberian, setPemberian] = useState("");
  const [pertanggungjawaban, setPertanggungjawaban] = useState("");
  const [noBukti, setNoBukti] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buatLagi, setBuatLagi] = useState(false);
  const [calculatedSaldo, setCalculatedSaldo] = useState(0);

  // Fetch data if in edit mode
  useEffect(() => {
    async function fetchPanjar() {
      if (!editId) return;

      try {
        setLoading(true);
        setError(null);

        const headers = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/kas-pembantu/panjar/${editId}`, {
          method: "GET",
          headers: headers,
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const result = await response.json();
        const data = result.data;

        // Convert tanggal to YYYY-MM-DD format for input
        setTanggal(toYYYYMMDD(data.tanggal));
        setUraian(data.uraian);
        setPemberian(data.pemberian ? String(data.pemberian) : "");
        setPertanggungjawaban(data.pertanggungjawaban ? String(data.pertanggungjawaban) : "");
        setNoBukti(data.no_bukti || "");
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPanjar();
  }, [editId, token]);

  // Calculate saldo automatically when input values change
  useEffect(() => {
    const pemberianAmount = parseFloat(pemberian || 0);
    const pertanggungjawabanAmount = parseFloat(pertanggungjawaban || 0);
    const saldo = pemberianAmount - pertanggungjawabanAmount;
    setCalculatedSaldo(saldo);
  }, [pemberian, pertanggungjawaban]);

  const handleDelete = async () => {
    if (editId) {
      if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        try {
          setLoading(true);
          setError(null);

          const headers = {
            "Content-Type": "application/json",
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await fetch(`${API_BASE_URL}/kas-pembantu/panjar/${editId}`, {
            method: "DELETE",
            headers: headers,
            credentials: "include",
          });

          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          router.push("/Kas-pembantu-panjar");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    } else {
      setTanggal("");
      setUraian("");
      setPemberian("");
      setPertanggungjawaban("");
      setNoBukti("");
      setError(null);
      setCalculatedSaldo(0);
    }
  };

  const handleCreate = () => {
    setBuatLagi(true);
    // Reset form
    setTanggal("");
    setUraian("");
    setPemberian("");
    setPertanggungjawaban("");
    setNoBukti("");
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
      const pemberianAmount = pemberian ? parseFloat(pemberian) : 0;
      const pertanggungjawabanAmount = pertanggungjawaban ? parseFloat(pertanggungjawaban) : 0;

      // Ensure tanggal is in YYYY-MM-DD format
      const formattedTanggal = toYYYYMMDD(tanggal);

      if (!formattedTanggal) {
        throw new Error("Format tanggal tidak valid");
      }

      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare payload
      const payload = {
        tanggal: formattedTanggal, // YYYY-MM-DD format
        uraian: uraian,
        no_bukti: noBukti || null,
        pemberian: pemberianAmount,
        pertanggungjawaban: pertanggungjawabanAmount,
      };

      // Submit to API
      if (editId) {
        const response = await fetch(`${API_BASE_URL}/kas-pembantu/panjar/${editId}`, {
          method: "PUT",
          headers: headers,
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message || 'Unknown error'}`);
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/kas-pembantu/panjar`, {
          method: "POST",
          headers: headers,
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`HTTP ${response.status}: ${errorData.error || errorData.message || 'Unknown error'}`);
        }
      }

      // Success
      if (buatLagi && !editId) {
        handleCreate();
      } else {
        router.push("/Kas-pembantu-panjar");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const memoizedSetPemberian = useCallback((value) => {
    setPemberian(value);
  }, []);

  const memoizedSetPertanggungjawaban = useCallback((value) => {
    setPertanggungjawaban(value);
  }, []);

  // Helper untuk input Rupiah (dipakai berulang kali)
  const RupiahInput = useCallback(({ label, placeholder, value, onChange }) => {
    return (
      <div className="relative">
        <label className="mb-1 block text-sm text-gray-800">{label}</label>
        <span className="absolute top-[34px] left-3 text-sm text-gray-400">Rp</span>
        <input
          type="number"
          placeholder={placeholder || "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
        />
      </div>
    );
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 w-full">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Panjar"]} />

        <h1 className="mt-2 mb-6 text-[20px] font-semibold text-gray-800">
          {editId ? "Edit Data Pembantu Panjar" : "Input Data Pembantu Panjar"}
        </h1>

        {/* Show loading state when fetching data in edit mode */}
        {editId && loading ? (
          <div className="rounded-md border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-5">
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
                      {tanggal ? formatTanggalDisplay(tanggal) : "DD/MM/YYYY"}
                    </span>
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

            {/* Arus Dana */}
            <div className="rounded-2xl border border-gray-300 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-800">Arus Dana</h2>

              <div className="flex flex-col space-y-4">
                {/* Pemberian */}
                <RupiahInput
                  label="Pemberian"
                  value={pemberian}
                  onChange={memoizedSetPemberian}
                />

                {/* Pertanggungjawaban */}
                <RupiahInput
                  label="Pertanggungjawaban"
                  value={pertanggungjawaban}
                  onChange={memoizedSetPertanggungjawaban}
                />
              </div>
            </div>

            {/* Bukti dan Kumulatif */}
            <div className="rounded-2xl border border-gray-300 bg-white p-5">
              <h2 className="mb-4 font-semibold text-gray-800">Bukti dan Kumulatif</h2>

              <div className="relative">
                <label className="mb-1 block text-sm text-gray-800">Nomor Bukti</label>
                <span className="absolute top-[34px] left-3 text-sm text-gray-400">No</span>
                <input
                  type="text"
                  placeholder="12345"
                  value={noBukti}
                  onChange={(e) => setNoBukti(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Saldo (Automated) */}
            <div>
              <h2 className="mb-2 font-semibold text-gray-800">Saldo (Automated)</h2>
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
          </div>
        )}
      </div>
    </div>
  );
}
