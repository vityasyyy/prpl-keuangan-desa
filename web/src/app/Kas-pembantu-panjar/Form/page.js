"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { Calendar } from "lucide-react";
import Footer from "@/features/kas-pembantu/Footer";
import { createPanjar, getPanjarById, updatePanjar, deletePanjar } from "@/services/kas-pembantu";
import { parseCurrency } from "@/lib/format";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateInputRef = useRef(null);
  const editId = searchParams.get("id");

  // Form state
  const [tanggal, setTanggal] = useState("");
  const [uraian, setUraian] = useState("");
  const [pemberian, setPemberian] = useState("");
  const [pertanggungjawaban, setPertanggungjawaban] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buatLagi, setBuatLagi] = useState(false);

  // Fetch data if in edit mode
  useEffect(() => {
    async function fetchPanjar() {
      if (editId) {
        try {
          setLoading(true);
          const response = await getPanjarById(editId);
          const data = response.data;
          
          setTanggal(data.tanggal);
          setUraian(data.uraian);
          setPemberian(data.pemberian ? String(data.pemberian) : "");
          setPertanggungjawaban(data.pertanggungjawaban ? String(data.pertanggungjawaban) : "");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchPanjar();
  }, [editId]);

  const formatTanggal = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDelete = async () => {
    if (editId) {
      // Edit mode: delete the entry
      if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
        try {
          setLoading(true);
          setError(null);
          await deletePanjar(editId);
          // Redirect to list after successful deletion
          router.push("/Kas-pembantu-panjar");
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Create mode: clear all form inputs
      setTanggal("");
      setUraian("");
      setPemberian("");
      setPertanggungjawaban("");
      setError(null);
    }
  };

  const handleCreate = () => {
    setBuatLagi(true);
    // Reset form
    setTanggal("");
    setUraian("");
    setPemberian("");
    setPertanggungjawaban("");
    setError(null);
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

      // Parse currency values - convert to number directly
      const pemberianAmount = pemberian ? parseFloat(pemberian) : 0;
      const pertanggungjawabanAmount = pertanggungjawaban ? parseFloat(pertanggungjawaban) : 0;

      // Prepare payload
      const payload = {
        bku_id: "bku003", // Default for now
        tanggal: tanggal, // Already in YYYY-MM-DD format
        uraian: uraian,
        pemberian: pemberianAmount,
        pertanggungjawaban: pertanggungjawabanAmount,
      };

      // Submit to API - use update if editId exists, otherwise create
      if (editId) {
        await updatePanjar(editId, payload);
      } else {
        await createPanjar(payload);
      }

      // Success - check if "buat lagi" is enabled
      if (buatLagi && !editId) {
        handleCreate();
      } else {
        // Redirect to list
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Panjar"]} />

        <h1 className="mt-2 mb-6 text-[20px] font-semibold text-gray-800">
          {editId ? "Edit Data Pembantu Panjar" : "Input Data Pembantu Panjar"}
        </h1>

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
                  value="100.000.000,00"
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
      </div>
    </div>
  );
}
