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

 const [uraianOptions, setUraianOptions] = useState([]);

useEffect(() => {
  async function fetchUraian() {
    try {
      const response = await fetch("http://localhost:8081/api/apbd/uraian");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const options =
        Array.isArray(data) && typeof data[0] === "object"
          ? data.map(item => item.uraian)
          : data;

      setUraianOptions(options);
    } catch (error) {
      console.error("Failed to fetch uraian options:", error);
    }
  }

  fetchUraian();
}, []);


  const [formData, setFormData] = useState({
    kodeRekEkonomi: "",
    pendapatanBelanja: "",
    uraian1: "",
    uraian2: "",
    kodeRekBidang: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    volumeOutput: "",
    volumeInput: "",
    satuanOutput: "",
    satuanInput: "",
    anggaran: "",
    sumberDana: "",
  });

  const [buatLagi, setBuatLagi] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 🔹 Cek apakah sedang mode edit
  useEffect(() => {
    const editIndex = localStorage.getItem("editIndex");

    if (editIndex !== null && editIndex !== "") {
      const dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const editData = dataLokal[editIndex];
      if (editData) {
        setFormData(editData);
        setIsEditMode(true);
      }
    } else {
      localStorage.removeItem("editIndex");
      setIsEditMode(false);
      setFormData({
        kodeRekEkonomi: "",
        pendapatanBelanja: "",
        uraian1: "",
        uraian2: "",
        kodeRekBidang: "",
        bidang: "",
        subBidang: "",
        kegiatan: "",
        volumeOutput: "",
        volumeInput: "",
        satuanOutput: "",
        satuanInput: "",
        anggaran: "",
        sumberDana: "",
      });
    }
  }, []);

  const handleOnChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔹 Simpan data baru atau update data lama
  const handleSimpan = (e) => {
    e.preventDefault();
    const dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");
    const editIndex = localStorage.getItem("editIndex");

    if (editIndex !== null && editIndex !== "") {
      dataLokal[editIndex] = formData;
      localStorage.setItem("apbdesData", JSON.stringify(dataLokal));
      localStorage.removeItem("editIndex");
      alert("✅ Data berhasil diperbarui!");
    } else {
      const newData = [...dataLokal, formData];
      localStorage.setItem("apbdesData", JSON.stringify(newData));
      alert("✅ Data berhasil disimpan!");
    }

    window.dispatchEvent(new Event("storage"));

    if (!buatLagi) {
      router.push("/APBDes/DraftPenjabaran");
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
        volumeOutput: "",
        volumeInput: "",
        satuanOutput: "",
        satuanInput: "",
        anggaran: "",
        sumberDana: "",
      });
      localStorage.removeItem("editIndex");
      setIsEditMode(false);
    }
  };

  // 🗑️ Hapus data + konfirmasi
  const handleHapus = () => {
    const confirmDelete = window.confirm(
      "⚠️ Apakah Anda yakin ingin menghapus data ini?"
    );

    if (!confirmDelete) return;

    const editIndex = localStorage.getItem("editIndex");
    const dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");

    if (editIndex !== null && editIndex !== "") {
      dataLokal.splice(editIndex, 1);
      localStorage.setItem("apbdesData", JSON.stringify(dataLokal));
      localStorage.removeItem("editIndex");
      alert("🗑️ Data berhasil dihapus!");
      window.dispatchEvent(new Event("storage"));
      router.push("/APBDes/DraftPenjabaran");
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
        volumeOutput: "",
        volumeInput: "",
        satuanOutput: "",
        satuanInput: "",
        anggaran: "",
        sumberDana: "",
      });
      alert("🧹 Form dikosongkan (tidak ada data yang dihapus)");
    }
  };

  return (
    <main className="min-h-screen bg-white px-16 py-8">
      <BreadCrumb category="APBDes" title="Input Draft APBDes" />
      <h1 className="mb-6 text-base font-semibold text-black">
        {isEditMode ? "Edit Data APBDes" : "Input Data APBDes"}
      </h1>

      {isEditMode && (
        <p className="text-sm text-orange-600 mb-4 font-medium">
          ✏️ Mode Edit: Anda sedang mengubah data yang sudah ada
        </p>
      )}

      {/* ===== KODE REKENING ===== */}
      <div className="mb-6 rounded-2xl border border-gray-400 px-6 py-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-[#011829] mb-4">
          Kode Rekening dan Uraian
        </h2>

        <div className="space-y-2 min-w-[900px]">
          <label className="block text-sm font-medium text-[#011829]">
            Klasifikasi Ekonomi
          </label>
          <div className="flex gap-3 w-full">
            <div className="w-[15%] min-w-[120px]">
              <TextInput
                placeholder="Kode Rek"
                value={formData.kodeRekEkonomi}
                onChange={(val) => handleOnChange("kodeRekEkonomi", val)}
              />
            </div>
            <div className="w-[35%] min-w-[200px]">
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
                options={uraianOptions}
                value={formData.uraian1}
                onChange={(val) => handleOnChange("uraian1", val)}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Uraian 2"
                options={uraianOptions}
                value={formData.uraian2}
                onChange={(val) => handleOnChange("uraian2", val)}
              />
            </div>
          </div>
        </div>

      {/* ===== KLASIFIKASI BIDANG KEGIATAN ===== */}
<div className="space-y-2 min-w-[900px] mt-5">
  <label className="block text-sm font-medium text-[#011829]">
    Klasifikasi Bidang Kegiatan
  </label>
  <div className="flex gap-3 w-full">
    {/* Kode Rek Bidang */}
    <div className="w-[15%] min-w-[120px]">
      <TextInput
        placeholder="Kode Rek"
        value={formData.kodeRekBidang}
        onChange={(val) => handleOnChange("kodeRekBidang", val)}
      />
    </div>

    {/* Bidang */}
    <div className="w-[28.3%] min-w-[180px]">
      <FormDropdown
        label="Bidang"
        options={bidangOptions}
        value={formData.bidang}
        onChange={(val) => {
          handleOnChange("bidang", val);
          const selected = bidangData.find(b => b.uraian === val);
          setSelectedBidangId(selected?.id || null);

          // reset sub-bidang & kegiatan
          setFormData(prev => ({ ...prev, subBidang: "", kegiatan: "" }));
          setSelectedSubBidangId(null);
        }}
      />
    </div>

    {/* Sub-Bidang */}
    <div className="w-[28.3%] min-w-[180px]">
      <FormDropdown
        label="Sub-Bidang"
        options={subBidangOptions}
        value={formData.subBidang}
        onChange={(val) => {
          handleOnChange("subBidang", val);
          const selected = subBidangData.find(s => s.uraian === val);
          setSelectedSubBidangId(selected?.id || null);

          // reset kegiatan
          setFormData(prev => ({ ...prev, kegiatan: "" }));
        }}
      />
    </div>

    {/* Kegiatan */}
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

      {/* ===== KELUARAN / OUTPUT ===== */}
      <div className="mb-6 rounded-2xl border border-gray-400 px-6 py-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-[#011829] mb-4">
          Keluaran / Output
        </h2>

        {/* VOLUME */}
        <div className="space-y-2 min-w-[900px]">
          <label className="block text-sm font-medium text-[#011829]">
            Volume
          </label>
          <div className="flex gap-3">
            <TextInput
              prefix="Jml"
              placeholder="Jumlah Output Kegiatan (Kolom 1.c)"
              value={formData.volumeOutput}
              onChange={(val) => handleOnChange("volumeOutput", val)}
            />
            <TextInput
              prefix="Jml"
              placeholder="Jumlah Input pada Rincian Obyek Belanja (Kolom 2.d)"
              value={formData.volumeInput}
              onChange={(val) => handleOnChange("volumeInput", val)}
            />
          </div>
        </div>

        {/* SATUAN */}
        <div className="space-y-2 min-w-[900px] mt-5">
          <label className="block text-sm font-medium text-[#011829]">
            Satuan
          </label>
          <div className="flex gap-3">
            <TextInput
              prefix="Jml"
              placeholder="Satuan Output Kegiatan (paket, unit, km, Ha)"
              value={formData.satuanOutput}
              onChange={(val) => handleOnChange("satuanOutput", val)}
            />
            <TextInput
              prefix="Jml"
              placeholder="Satuan Input Obyek Belanja (paket, unit)"
              value={formData.satuanInput}
              onChange={(val) => handleOnChange("satuanInput", val)}
            />
          </div>
        </div>
      </div>

      {/* ===== ANGGARAN ===== */}
      <div className="mb-8 space-y-5 rounded-2xl border border-gray-400 px-6 py-6">
        <h2 className="text-sm font-semibold text-[#011829]">
          Anggaran dan Sumber Dana
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">
            Anggaran
          </label>
          <TextInput
            prefix="Rp"
            placeholder="0.000.000,00"
            value={formData.anggaran}
            onChange={(val) => handleOnChange("anggaran", val)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">
            Sumber Dana
          </label>
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
              <ToggleRight width={28} height={28} className="text-blue-600" />
            ) : (
              <ToggleLeft width={28} height={28} className="text-gray-500" />
            )}
          </button>

          <Button variant="primary" onClick={handleSimpan}>
            {isEditMode ? "Perbarui" : "Simpan"}
            <Floppy width={16} height={16} />
          </Button>
        </div>
      </div>
    </main>
  );
}
