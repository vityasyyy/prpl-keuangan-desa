"use client";
import { useRef, useState } from "react";
import Sidebar from "@/features/kas-pembantu/Sidebar";
import BreadcrumbHeader from "@/features/kas-pembantu/BreadcrumbHeader";
import { Calendar } from "lucide-react";
import Footer from "@/features/kas-pembantu/Footer";

export default function Page() {
  const dateInputRef = useRef(null);
  const [tanggal, setTanggal] = useState("");

  const formatTanggal = (value) => {
    if (!value) return "";
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleDelete = () => {
    console.log("hapus diklik");
  };

  const handleCreate = () => {
    console.log("buat lagi diklik");
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("simpan diklik");
  };

  // Helper untuk input Rupiah (dipakai berulang kali)
  const RupiahInput = ({ label, placeholder }) => (
    <div className="relative">
      <label className="block text-sm text-gray-800 mb-1">{label}</label>
      <span className="absolute left-3 top-[34px] text-gray-400 text-sm">
        Rp
      </span>
      <input
        type="text"
        placeholder={placeholder || "0.000.000,00"}
        className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <BreadcrumbHeader items={["Penatausahaan", "Buku Pembantu Kegiatan"]} />

        <h1 className="text-[20px] font-semibold text-gray-800 mb-6 mt-2">
          Input Data Pembantu Kegiatan
        </h1>

        <form className="space-y-5" onSubmit={handleSave}>
          {/* Detail */}
          <div className="border border-gray-300 rounded-2xl bg-white p-5">
            <h2 className="text-gray-800 font-semibold mb-4">Detail</h2>

            <div className="flex flex-col space-y-4">
              {/* Tanggal */}
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Tanggal
                </label>
                <div
                  className="relative w-[180px] border border-gray-300 rounded-md pl-9 pr-3 py-2 
                                   bg-white cursor-pointer hover:bg-gray-50 transition-colors
                                   focus-within:ring-1 focus-within:ring-gray-400"
                  onClick={() => dateInputRef.current?.showPicker()}
                >
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-600 pointer-events-none" />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer
                                       [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0"
                  />
                  <span className="text-sm text-gray-800 select-none pointer-events-none uppercase">
                    {tanggal ? formatTanggal(tanggal) : "DD/MM/YYYY"}
                  </span>
                </div>
              </div>

              {/* Klasifikasi Bidang Kegiatan */}
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    <option value="">Kode Rek</option>
                  </select>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    <option value="">Bidang</option>
                  </select>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    <option value="">Sub-Bidang</option>
                  </select>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400">
                    <option value="">Kegiatan</option>
                  </select>
                </div>
              </div>

              {/* Uraian */}
              <div>
                <label className="block text-sm text-gray-800 mb-1">
                  Uraian
                </label>
                <input
                  type="text"
                  placeholder="Uraian Pajak / Retribusi / Penerimaan Lainnya"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm placeholder-gray-600 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Penerimaan */}
          <div className="border border-gray-300 rounded-2xl bg-white p-5">
            <h2 className="text-gray-800 font-semibold mb-4">Penerimaan</h2>
            <div className="flex flex-col space-y-4">
              <RupiahInput label="Dari Bendahara" />
              <RupiahInput label="Swadaya Masyarakat" />
            </div>
          </div>

          {/* Pengeluaran */}
          <div className="border border-gray-300 rounded-2xl bg-white p-5">
            <h2 className="text-gray-800 font-semibold mb-4">Pengeluaran</h2>
            <div className="flex flex-col space-y-4">
              <RupiahInput label="Belanja Barang dan Jasa" />
              <RupiahInput label="Belanja Modal" />
            </div>
          </div>

          {/* Bukti dan Kumulatif */}
          <div className="border border-gray-300 rounded-2xl bg-white p-5">
            <h2 className="text-gray-800 font-semibold mb-4">
              Bukti dan Kumulatif
            </h2>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <label className="block text-sm text-gray-800 mb-1">
                  Nomor Bukti
                </label>
                <span className="absolute left-3 top-[34px] text-gray-400 text-sm">
                  No
                </span>
                <input
                  type="text"
                  placeholder="12345"
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
              <RupiahInput label="Jumlah Pengembalian ke Bendahara" />
            </div>
          </div>

          {/* Saldo Kas */}
          <div>
            <h2 className="text-gray-800 font-semibold mb-2">Saldo Kas</h2>
            <div className="border border-gray-300 rounded-md bg-white px-3 py-2">
              <div className="relative flex items-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  value="100.000.000,00"
                  readOnly
                  className="w-full pl-9 pr-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer (Tombol Aksi) */}
          <Footer
            onDelete={handleDelete}
            onCreate={handleCreate}
            onSave={handleSave}
          />
        </form>
      </div>
    </div>
  );
}