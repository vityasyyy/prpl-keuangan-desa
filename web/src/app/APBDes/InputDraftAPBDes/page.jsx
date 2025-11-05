"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import FormDropdown from "@/components/formDropdown";
import { TextInput } from "@/components/formInput";
import { Trash, Floppy, ToggleLeft, ToggleRight } from "@/components/icons";

export default function InputDraftAPBDes() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    kodeRekEkonomi: "",
    pendapatanBelanja: "",
    uraian1: "",
    uraian2: "",
    kodeRekBidang: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    anggaran: "",
    sumberDana: "",
  });

  const handleOnChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [buatLagi, setBuatLagi] = useState(false);

  const handleSimpan = (e) => {
    e.preventDefault();
    const dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");
    const newData = [...dataLokal, formData];
    localStorage.setItem("apbdesData", JSON.stringify(newData));

    if (!buatLagi) {
      router.push("/APBDes/OutputDraftAPBDes");
    } else {
      setFormData({
        kodeRekEkonomi: "",
        pendapatanBelanja: "",
        uraian1: "",
        uraian2: "",
        kodeRekBidang: "",
        bidang: "",
        subBidang: "",
        kegiatan: "",
        anggaran: "",
        sumberDana: "",
      });
    }
  };

  const handleHapus = () => {
    setFormData({
      kodeRekEkonomi: "",
      pendapatanBelanja: "",
      uraian1: "",
      uraian2: "",
      kodeRekBidang: "",
      bidang: "",
      subBidang: "",
      kegiatan: "",
      anggaran: "",
      sumberDana: "",
    });
  };

  return (
    <main className="min-h-screen bg-white px-16 py-8">
      <BreadCrumb category="APBDes" title="Draft APBDes" />

      <h1 className="mb-6 text-base font-semibold text-black">Input Data APBDes</h1>

      {/* ===== KODE REKENING DAN URAIAN ===== */}
      <div className="mb-6 rounded-2xl border border-gray-400 px-6 py-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-[#011829] mb-4">Kode Rekening dan Uraian</h2>

        {/* Klasifikasi Ekonomi */}
        <div className="space-y-2 min-w-[900px]">
          <label className="block text-sm font-medium text-[#011829]">Klasifikasi Ekonomi</label>
          <div className="flex gap-3 w-full">
            <div className="w-[15%] min-w-[120px]">
                <TextInput
                  placeholder="Kode Rek"
                  value={formData.kodeRekEkonomi}
                  onChange={(val) => handleOnChange("kodeRekEkonomi", val)}
                />
            </div>
            <div className="w-[30%] min-w-[200px]">
                <FormDropdown
                  label="Pendapatan / Belanja / Pembiayaan"
                  options={["Pendapatan", "Belanja", "Pembiayaan"]}
                  value={formData.pendapatanBelanja}
                  onChange={(val) => handleOnChange("pendapatanBelanja", val)}
                />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
                <FormDropdown
                  label="Uraian 1"
                  options={["Uraian 1A", "Uraian 1B"]}
                  value={formData.uraian1}
                  onChange={(val) => handleOnChange("uraian1", val)}
                />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
                <FormDropdown
                  label="Uraian 2"
                  options={["Uraian 2A", "Uraian 2B"]}
                  value={formData.uraian2}
                  onChange={(val) => handleOnChange("uraian2", val)}
                />
            </div>
        </div>
        </div>

        {/* Klasifikasi Bidang Kegiatan */}
        <div className="space-y-2 min-w-[900px] mt-5">
          <label className="block text-sm font-medium text-[#011829]">
            Klasifikasi Bidang Kegiatan
          </label>
          <div className="flex gap-3 w-full">
            <div className="w-[15%] min-w-[120px]">
                <TextInput
                  placeholder="Kode Rek"
                  value={formData.kodeRekBidang}
                  onChange={(val) => handleOnChange("kodeRekBidang", val)}
                />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
                <FormDropdown
                  label="Bidang"
                  options={["Bidang 1", "Bidang 2"]}
                  value={formData.bidang}
                  onChange={(val) => handleOnChange("bidang", val)}
                />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
                <FormDropdown
                  label="Sub-Bidang"
                  options={["Sub-Bidang 1", "Sub-Bidang 2"]}
                  value={formData.subBidang}
                  onChange={(val) => handleOnChange("subBidang", val)}
                />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Kegiatan"
                options={["Kegiatan 1", "Kegiatan 2"]}
                value={formData.kegiatan}
                onChange={(val) => handleOnChange("kegiatan", val)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== ANGGARAN DAN SUMBER DANA ===== */}
      <div className="mb-8 space-y-5 rounded-2xl border border-gray-400 px-6 py-6">
        <h2 className="text-sm font-semibold text-[#011829]">Anggaran dan Sumber Dana</h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">Anggaran</label>
          <TextInput
            prefix="Rp"
            placeholder="0.000.000,00"
            value={formData.anggaran}
            onChange={(val) => handleOnChange("anggaran", val)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">Sumber Dana</label>
          <FormDropdown
            label="PBH / DDS / ADD / DLL / PBP"
            options={["PBH", "DDS", "ADD", "DLL", "PBP"]}
            value={formData.sumberDana}
            onChange={(val) => handleOnChange("sumberDana", val)}
          />
        </div>
      </div>

      {/* ===== BUTTONS ===== */}
      <div className="flex justify-between">
        <Button variant="danger" onClick={handleHapus}>
          Hapus
          <Trash width={16} height={16} />
        </Button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setBuatLagi((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="text-sm text-gray-700">Buat lagi</span>
            {buatLagi ? (
                <ToggleRight width={28} height={28} className="text-blue-600 transition-colors duration-200" />
            ) : (
                <ToggleLeft width={28} height={28} className="text-gray-500 transition-colors duration-200" />
            )}
          </button>

          <Button variant="primary" onClick={handleSimpan}>
            Simpan
            <Floppy width={16} height={16} />
          </Button>
        </div>
      </div>
    </main>
  );
}