"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/dpa/button";
import { DropdownInput } from "@/components/dpa/formInput";
import {
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash,
  DotsVertical,
  Send,
  Check,
} from "@/components/dpa/icons";

// --- DATA DUMMY ---
const dummyKegiatanList = [
  {
    id: "keg1",
    nama: "Kegiatan 1: Pembangunan Balai Desa",
    total: 500000000,
    status: "belum_diajukan",
    rincian: [
      {
        id: "r1a",
        uraian: "Semen",
        volume: 100,
        satuan: "sak",
        hargaSatuan: 50000,
        jumlah: 5000000,
      },
      {
        id: "r1b",
        uraian: "Tukang",
        volume: 10,
        satuan: "orang",
        hargaSatuan: 1500000,
        jumlah: 15000000,
      },
      {
        id: "r1c",
        uraian: "Pasir",
        volume: 5,
        satuan: "truk",
        hargaSatuan: 1500000,
        jumlah: 7500000,
      },
    ],
  },
  {
    id: "keg2",
    nama: "Kegiatan 2: Pelatihan PKK",
    total: 75000000,
    status: "diajukan",
    rincian: [
      {
        id: "r2a",
        uraian: "Sewa Aula",
        volume: 1,
        satuan: "hari",
        hargaSatuan: 2000000,
        jumlah: 2000000,
      },
      {
        id: "r2b",
        uraian: "Honor Narasumber",
        volume: 1,
        satuan: "jam",
        hargaSatuan: 5000000,
        jumlah: 5000000,
      },
    ],
  },
  {
    id: "keg3",
    nama: "Kegiatan 3: Fogging Demam Berdarah",
    total: 25000000,
    status: "terverifikasi",
    rincian: [
      {
        id: "r3a",
        uraian: "Obat Fogging",
        volume: 10,
        satuan: "botol",
        hargaSatuan: 1000000,
        jumlah: 10000000,
      },
    ],
  },
  {
    id: "keg4",
    nama: "Kegiatan 4: Perbaikan Saluran Irigasi",
    total: 120000000,
    status: "disetujui",
    rincian: [
      {
        id: "r4a",
        uraian: "Material Pipa",
        volume: 800,
        satuan: "buah",
        hargaSatuan: 100000,
        jumlah: 8000000,
      },
    ],
  },
  {
    id: "keg5",
    nama: "Kegiatan 5: Lomba 17 Agustus",
    total: 15000000,
    status: "tidak_diverifikasi",
    rincian: [
      {
        id: "r5a",
        uraian: "Hadiah Lomba",
        volume: 10,
        satuan: "set",
        hargaSatuan: 1000000,
        jumlah: 10000000,
      },
    ],
  },
];

// --- FUNGSI HELPER ---
function formatRupiah(angka) {
  if (angka === null || isNaN(angka)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
}

function getStatusBadge(status) {
  const styles = {
    belum_diajukan: "bg-gray-200 text-gray-800",
    diajukan: "bg-blue-100 text-blue-800",
    terverifikasi: "bg-yellow-100 text-yellow-800",
    tidak_diverifikasi: "bg-red-100 text-red-800",
    verifikasi_ditolak: "bg-green-100 text-green-800",
    tidak_disetujui: "bg-red-100 text-red-800",
  };
  const text = {
    belum_diajukan: "Belum Diajukan",
    diajukan: "Diajukan",
    terverifikasi: "Terverifikasi",
    tidak_diverifikasi: "Tidak Diverifikasi",
    disetujui: "Disetujui",
    tidak_disetujui: "Tidak Disetujui",
  };
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-medium ${styles[status] || styles.belum_diajukan}`}
    >
      {text[status] || "Unknown"}
    </span>
  );
}

function getActionButton(status) {
  switch (status) {
    case "belum_diajukan":
      return (
        <Button variant="primary-outline" size="sm">
          Ajukan <Send width={14} />
        </Button>
      );
    case "diajukan":
      return (
        <Button variant="warning" size="sm">
          Verifikasi <Check width={14} />
        </Button>
      );
    case "terverifikasi":
      return (
        <Button variant="success" size="sm">
          Setujui <Check width={14} />
        </Button>
      );
    default:
      return null;
  }
}

// --- KOMPONEN ACCORDION ITEM ---
function AccordionRABItem({ kegiatan, isOpen, onToggle }) {
  const { id, nama, status, rincian } = kegiatan;

  const calculatedTotal = rincian.reduce(
    (accumulator, currentItem) => accumulator + (currentItem.jumlah || 0),
    0
  );

  const handleActionClick = (e) => {
    e.stopPropagation();
    console.log(`Aksi pada kegiatan ${id}`);
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
      {/* Bagian Head Accordion */}
      <div className="flex cursor-pointer items-center justify-between p-4" onClick={onToggle}>
        {/* Kiri: Toggle & Nama Kegiatan */}
        <div className="flex flex-1 items-center gap-3">
          <button className="text-gray-500">{isOpen ? <ChevronDown /> : <ChevronRight />}</button>
          <span className="font-semibold text-gray-900">{nama}</span>
        </div>

        {/* Kanan: Info & Tombol Aksi */}
        <div className="flex items-center gap-3" onClick={handleActionClick}>
          <span className="hidden text-sm text-gray-700 md:block">
            Total: {/* Gunakan 'calculatedTotal' yang sudah dihitung */}
            <span className="font-bold text-black">{formatRupiah(calculatedTotal)}</span>
          </span>
          {getStatusBadge(status)}
          <div className="hidden md:block">{getActionButton(status)}</div>
          <Button variant="icon" title="Unduh Rincian">
            <Download height={16} width={16} />
          </Button>
          <Button variant="icon" title="Opsi Lain">
            <DotsVertical />
          </Button>
        </div>
      </div>

      {/* Bagian Body Accordion (Rincian) */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-800">Rincian RAB</h3>
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-4/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Uraian
                  </th>
                  <th className="w-1/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Volume
                  </th>
                  <th className="w-1/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Satuan
                  </th>
                  <th className="w-2/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Harga Satuan
                  </th>
                  <th className="w-2/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Jumlah
                  </th>
                  <th className="w-1/12 px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rincian.length > 0 ? (
                  rincian.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.uraian}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.volume}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.satuan}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {formatRupiah(item.hargaSatuan)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                        {formatRupiah(item.jumlah)}
                      </td>
                      <td className="flex gap-1 px-4 py-3">
                        <Button variant="icon-sm" title="Edit">
                          <Edit width={14} />
                        </Button>
                        <Button variant="icon-sm" title="Hapus">
                          <Trash width={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-center text-sm text-gray-500 italic">
                      Belum ada rincian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- KOMPONEN UTAMA HALAMAN ---
export default function RencanaAnggaranBiayaPage() {
  const [tahun, setTahun] = useState("2025");
  const [openAccordionId, setOpenAccordionId] = useState(null); // Hanya 1 yang bisa terbuka

  const handleTampilkan = (e) => {
    e.preventDefault();
    console.log(`Menampilkan data untuk tahun: ${tahun}`);
  };

  const handleToggleAccordion = (id) => {
    setOpenAccordionId((prevId) => (prevId === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {/* Area Konten Utama Putih */}
      <div className="mx-auto max-w-7xl rounded-lg bg-white p-6 shadow-md">
        {/* Komponen 1 & 2: Filter Tahun & Tombol Tampilkan */}
        <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-4">
          <div className="w-48">
            <DropdownInput
              label="Pilih Tahun"
              options={["2023", "2024", "2025"]}
              value={tahun}
              onChange={(value) => setTahun(value)}
            />
          </div>
          <Button variant="primary" onClick={handleTampilkan} className="self-end">
            Tampilkan
          </Button>
        </div>

        {/* Komponen 3: Header Halaman */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black">Rencana Anggaran Biaya</h1>
            <p className="text-sm text-gray-500">
              Buku Rencana Anggaran Biaya Sesuai Kewenangan Jabatan | TAHUN ANGGARAN {tahun}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Download height={16} width={16} />
              Unduh File
            </Button>
            <Link href="/Rencana-anggaran-biaya/Form">
              <Button variant="primary">
                <Upload />
                Input Data
              </Button>
            </Link>
          </div>
        </div>

        {/* Komponen 4: Daftar Accordion Kegiatan */}
        <div className="space-y-4">
          {dummyKegiatanList.map((kegiatan) => (
            <AccordionRABItem
              key={kegiatan.id}
              kegiatan={kegiatan}
              isOpen={openAccordionId === kegiatan.id}
              onToggle={() => handleToggleAccordion(kegiatan.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
