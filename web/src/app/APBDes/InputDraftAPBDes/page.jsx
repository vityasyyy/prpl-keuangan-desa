"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import FormDropdown from "@/components/formDropdown";
import { TextInput } from "@/components/formInput";
import { Trash, Floppy, ToggleLeft, ToggleRight } from "@/components/icons";

export default function InputDraftAPBDes() {
  const router = useRouter();

  const [akunOptions, setAkunOptions] = useState([]);
  const [bidangOptions, setBidangOptions] = useState([]);
  const [subBidangOptions, setSubBidangOptions] = useState([]);
  const [kegiatanOptions, setKegiatanOptions] = useState([]);

  const [bidangData, setBidangData] = useState([]); // To store full bidang objects
  const [subBidangData, setSubBidangData] = useState([]); // To store full subBidang objects
  const [kegiatanData, setKegiatanData] = useState([]); // To store full kegiatan objects

  const [selectedBidangId, setSelectedBidangId] = useState(null);
  const [selectedSubBidangId, setSelectedSubBidangId] = useState(null);

  useEffect(() => {
    async function fetchAkunOptions() {
      try {
        const response = await fetch("http://localhost:8081/api/apbd/akun");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const options = data.map((item) => item.uraian);
        setAkunOptions(options);
      } catch (error) {
        console.error("Failed to fetch akun options:", error);
      }
    }
    fetchAkunOptions();
  }, []);

  useEffect(() => {
    async function fetchBidangOptions() {
      try {
        const response = await fetch("http://localhost:8081/api/apbd/bidang");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBidangData(data); // Store full data
        const options = data.map((item) => item.uraian);
        setBidangOptions(options);
      } catch (error) {
        console.error("Failed to fetch bidang options:", error);
      }
    }
    fetchBidangOptions();
  }, []);

  useEffect(() => {
    async function fetchSubBidangOptions() {
      if (!selectedBidangId) {
        setSubBidangOptions([]);
        setSubBidangData([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8081/api/apbd/sub-bidang?bidangId=${selectedBidangId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSubBidangData(data); // Store full data
        const options = data.map((item) => item.uraian);
        setSubBidangOptions(options);
      } catch (error) {
        console.error("Failed to fetch sub bidang options:", error);
      }
    }
    fetchSubBidangOptions();
  }, [selectedBidangId]);

  useEffect(() => {
    async function fetchKegiatanOptions() {
      if (!selectedSubBidangId) {
        setKegiatanOptions([]);
        setKegiatanData([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8081/api/apbd/kegiatan?subBidangId=${selectedSubBidangId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setKegiatanData(data); // Store full data
        const options = data.map((item) => item.uraian);
        setKegiatanOptions(options);
      } catch (error) {
        console.error("Failed to fetch kegiatan options:", error);
      }
    }
    fetchKegiatanOptions();
  }, [selectedSubBidangId]);

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

    if (field === "bidang") {
      const selectedBidang = bidangData.find((item) => item.uraian === value);
      setSelectedBidangId(selectedBidang ? selectedBidang.id : null);
      setFormData((prev) => ({
        ...prev,
        subBidang: "", // Clear subBidang when bidang changes
        kegiatan: "", // Clear kegiatan when bidang changes
      }));
    }

    if (field === "subBidang") {
      const selectedSubBidang = subBidangData.find((item) => item.uraian === value);
      setSelectedSubBidangId(selectedSubBidang ? selectedSubBidang.id : null);
      setFormData((prev) => ({
        ...prev,
        kegiatan: "", // Clear kegiatan when subBidang changes
      }));
    }
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
      <BreadCrumb category="APBDes" title="Input Draft APBDes" />

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
                  options={akunOptions}
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
                  options={bidangOptions}
                  value={formData.bidang}
                  onChange={(val) => handleOnChange("bidang", val)}
                />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
                <FormDropdown
                  label="Sub-Bidang"
                  options={subBidangOptions}
                  value={formData.subBidang}
                  onChange={(val) => handleOnChange("subBidang", val)}
                />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Kegiatan"
                options={kegiatanOptions}
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
