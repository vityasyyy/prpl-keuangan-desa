"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dpa/header";
import { useRouter } from "next/navigation";
import Button from "@/components/dpa/button";
import { DropdownInput } from "@/components/dpa/formInput";
import {
  Download,
  ChevronDown,
  Edit,
  Trash,
  DotsVertical,
  Send,
  Check,
} from "@/components/dpa/icons";
import { useAuth } from "@/lib/auth";
import ToastNotification from "@/components/dpa/toastNotification";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

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
    "belum diajukan": "bg-gray-200 text-gray-800",
    diajukan: "bg-blue-100 text-blue-800",
    terverifikasi: "bg-yellow-100 text-yellow-800",
    tidak_diverifikasi: "bg-red-100 text-red-800",
    verifikasi_ditolak: "bg-green-100 text-green-800",
    disetujui: "bg-green-100 text-green-800",
    tidak_disetujui: "bg-red-100 text-red-800",
  };
  const text = {
    "belum diajukan": "Belum Diajukan",
    diajukan: "Diajukan",
    terverifikasi: "Terverifikasi",
    tidak_diverifikasi: "Tidak Diverifikasi",
    disetujui: "Disetujui",
    tidak_disetujui: "Tidak Disetujui",
  };
  return (
    <span
      className={`rounded px-2 py-1 text-center text-xs font-medium ${
        styles[status] || styles["belum diajukan"]
      }`}
    >
      {text[status] || "Unknown"}
    </span>
  );
}

function getActionButton(status, role, onAction) {
  if ((role.startsWith("kaur") || role.startsWith("kasi")) && status === "belum diajukan") {
    return (
      <Button variant="primary" size="xs" onClick={onAction}>
        Ajukan <Send width={14} />
      </Button>
    );
  }

  if (role.startsWith("sekretaris") && status === "diajukan") {
    return (
      <Button variant="primary" size="xs" onClick={onAction}>
        Verifikasi <Check width={14} />
      </Button>
    );
  }

  if (role.startsWith("kepala_desa") && status === "terverifikasi") {
    return (
      <Button variant="primary" size="xs" onClick={onAction}>
        Setujui <Check width={14} />
      </Button>
    );
  }

  return null;
}

// --- KOMPONEN ACCORDION ITEM ---
const cleanName = (str) => {
  if (!str) return "";

  const step1 = str.replace(/\(.*?\)/g, "").trim();
  const parts = step1
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  const lastSegment = parts[parts.length - 1];
  return lastSegment.replace(/\*\*/g, "").trim();
};

function AccordionRABItem({ kegiatan, isOpen, onToggle, userRole, setToast }) {
  const router = useRouter();
  const {
    id,
    kode_fungsi_uraian,
    kode_fungsi_id,
    kode_fungsi_full,
    kode_ekonomi_id,
    kode_ekonomi_full,
    mulai,
    selesai,
    status_rab,
    lines = [],
  } = kegiatan;

  const nama = cleanName(kode_fungsi_uraian);
  const calculatedTotal = lines.reduce((acc, item) => acc + (item.jumlah || 0), 0);

  const handleActionClick = async (e) => {
    e.stopPropagation();
  };

  const handleEdit = (lineItem) => (e) => {
    e.stopPropagation();

    if (!userRole || (!userRole.startsWith("kaur") && !userRole.startsWith("kasi"))) {
      setToast({
        message:
          "Anda tidak memiliki akses untuk mengedit data. Hanya Kaur dan Kasi yang dapat mengedit data.",
        type: "error",
        visible: true,
      });
      return;
    }

    const editData = {
      rabId: id,
      lineId: lineItem.id,
      waktuMulai: mulai,
      waktuSelesai: selesai,
      kode_fungsi_id: kode_fungsi_id,
      kode_ekonomi_id: kode_ekonomi_id,
      kode_fungsi_full: kode_fungsi_full || "",
      kode_ekonomi_full: kode_ekonomi_full || "",
      uraian: lineItem.uraian,
      volume: lineItem.volume,
      satuan: lineItem.satuan,
      harga_satuan: lineItem.harga_satuan,
      jumlah: lineItem.jumlah,
    };

    router.push(
      `/Rencana-anggaran-biaya/Form?edit=${lineItem.id}&data=${encodeURIComponent(JSON.stringify(editData))}`
    );
  };

  const handleDelete = (lineItem) => async (e) => {
    e.stopPropagation();

    if (!userRole || (!userRole.startsWith("kaur") && !userRole.startsWith("kasi"))) {
      setToast({
        message:
          "Anda tidak memiliki akses untuk menghapus data. Hanya Kaur dan Kasi yang dapat menghapus data.",
        type: "error",
        visible: true,
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rab/lines/${lineItem.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setToast({
          message: "Rincian RAB berhasil dihapus.",
          type: "success",
          visible: true,
        });
      }
    } catch (error) {
      console.error("Error deleting RAB line:", error);
    }
  };

  return (
    <div className="overflow-hidden transition-all duration-300">
      <div
        className="flex cursor-pointer items-center justify-between rounded-full border border-gray-300 bg-white p-4"
        onClick={onToggle}
      >
        <div className="flex flex-2 items-center gap-3">
          <button
            className="text-gray-500 transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          >
            <ChevronDown />
          </button>
          <span className={`pr-4 font-semibold text-gray-900 ${isOpen ? "" : "line-clamp-1"}`}>
            {nama}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-start">
          <span className="text-sm text-gray-700">
            Total: <span className="font-bold text-black">{formatRupiah(calculatedTotal)}</span>
          </span>
        </div>

        <div className="flex flex-1 basis-24 items-center justify-end gap-3">
          <div className="flex w-32 justify-center">{getStatusBadge(status_rab)}</div>
          <div className="hidden w-20 md:flex md:justify-center">
            {getActionButton(status_rab, userRole, handleActionClick)}
          </div>
          <Button variant="icon" title="Unduh Rincian">
            <Download height={16} width={16} />
          </Button>
          <Button variant="icon" title="Opsi Lain">
            <DotsVertical />
          </Button>
        </div>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? "1000px" : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-3">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200 bg-white">
              {lines.length > 0 ? (
                lines.map((item) => (
                  <tr key={item.id}>
                    <td className="w-[30%] py-3 pl-4 text-sm text-gray-700">{item.uraian}</td>
                    <td className="w-[10%] py-3 text-sm">{item.volume}</td>
                    <td className="w-[15%] py-3 text-sm">{item.satuan}</td>
                    <td className="w-[15%] py-3 text-sm">{formatRupiah(item.harga_satuan)}</td>
                    <td className="w-[20%] py-3 text-sm font-semibold">
                      {formatRupiah(item.jumlah)}
                    </td>
                    <td className="flex w-[10%] justify-around gap-1 py-3 pr-8">
                      <Button variant="icon-sm" title="Edit" onClick={handleEdit(item)}>
                        <Edit width={14} />
                      </Button>
                      <Button variant="icon-sm" title="Hapus" onClick={handleDelete(item)}>
                        <Trash width={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-center text-sm text-gray-500 italic">
                    Belum ada rincian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function RencanaAnggaranBiaya() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const handleDownload = () => {};

  const handleInputData = (e) => {
    e.preventDefault();

    if (!user?.role || (!user.role.startsWith("kaur") && !user.role.startsWith("kasi"))) {
      setToast({
        message:
          "Anda tidak memiliki akses untuk menginput data. Hanya Kaur dan Kasi yang dapat menginput data.",
        type: "error",
        visible: true,
      });
      return;
    }
    router.push("/Rencana-anggaran-biaya/Form");
  };

  const [listTahun, setListTahun] = useState([]);
  const [tahun, setTahun] = useState();
  const [listRAB, setListRAB] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`${API_BASE_URL}/rab/years`);
      const json = await res.json();

      const tahunArr = json.data.map((i) => i.tahun);
      const currYear = new Date().getFullYear();

      setListTahun(tahunArr);
      setTahun(tahunArr.includes(currYear) ? currYear : tahunArr[0]);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (!tahun) return;

    async function fetchRAB(year) {
      try {
        const res = await fetch(`${API_BASE_URL}/rab/year/${year}`);
        const data = await res.json();

        const rabList = data.data;

        const rabWithLines = await Promise.all(
          rabList.map(async (rab) => {
            const lineRes = await fetch(`${API_BASE_URL}/rab/${rab.id}/lines`);
            const lineData = await lineRes.json();

            return {
              ...rab,
              lines: lineData.data || [],
            };
          })
        );

        setListRAB(rabWithLines);
      } catch (error) {
        console.error("Error fetching RAB:", error);
      }
    }

    fetchRAB(tahun);
  }, [tahun]);

  const [openAccordionId, setOpenAccordionId] = useState(null);

  const handleToggleAccordion = (id) => {
    setOpenAccordionId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="p-8">
      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Header
        judul="Rencana Anggaran Biaya"
        desa="Contoh Desa"
        tahun="2024"
        downloadHandler={handleDownload}
        inputHandler={handleInputData}
      />

      <div className="mb-6 flex items-center gap-4">
        <div className="w-28">
          <DropdownInput
            label="Pilih Tahun"
            options={listTahun}
            value={tahun}
            onChange={(value) => setTahun(value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {listRAB.map((kegiatan) => (
          <AccordionRABItem
            key={kegiatan.id}
            kegiatan={kegiatan}
            isOpen={openAccordionId === kegiatan.id}
            onToggle={() => handleToggleAccordion(kegiatan.id)}
            userRole={user.role}
            setToast={setToast}
          />
        ))}
      </div>
    </div>
  );
}
