"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { Calendar } from "lucide-react";
import Footer from "@/features/kas-pembantu/Footer";
import { createPajak } from "@/services/kas-pembantu";
import { parseCurrency } from "@/lib/format";

export default function Page() {
  const router = useRouter();
  const dateInputRef = useRef(null);

  // Form state
  const [tanggal, setTanggal] = useState("");
  const [uraian, setUraian] = useState("");
  const [pemotongan, setPemotongan] = useState("");
  const [penyetoran, setPenyetoran] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buatLagi, setBuatLagi] = useState(false);

  const formatTanggal = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDelete = () => {
    console.log("hapus diklik");
  };

  const handleCreate = () => {
    setBuatLagi(true);
    // Reset form
    setTanggal("");
    setUraian("");
    setPemotongan("");
    setPenyetoran("");
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

      // Parse currency values
      const pemotonganAmount = parseCurrency(pemotongan);
      const penyetoranAmount = parseCurrency(penyetoran);

      // Prepare payload
      const payload = {
        bku_id: "bku003", // Default for now
        tanggal: tanggal, // Already in YYYY-MM-DD format
        uraian: uraian,
        pemotongan: pemotonganAmount,
        penyetoran: penyetoranAmount,
      };

      // Submit to API
      await createPajak(payload);

      // Success - check if "buat lagi" is enabled
      if (buatLagi) {
        handleCreate();
      } else {
        // Redirect to list
        router.push("/Kas-pembantu-pajak");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk input Rupiah (dipakai berulang kali)
  const RupiahInput = ({ label, placeholder, value, onChange }) => (
    <div className="relative">
      <label className="mb-1 block text-sm text-gray-800">{label}</label>
      <span className="absolute top-[34px] left-3 text-sm text-gray-400">Rp</span>
      <input
        type="text"
        placeholder={placeholder || "0.000.000,00"}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto p-8">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Pajak"]} />

        <h1 className="mt-2 mb-6 text-[20px] font-semibold text-gray-800">
          Input Data Pembantu Pajak
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
              {/* Pemotongan */}
              <RupiahInput
                label="Pemotongan"
                value={pemotongan}
                onChange={(e) => setPemotongan(e.target.value)}
              />

              {/* Penyetoran */}
              <RupiahInput
                label="Penyetoran"
                value={penyetoran}
                onChange={(e) => setPenyetoran(e.target.value)}
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
