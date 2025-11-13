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
  const [akunData, setAkunData] = useState([]);
const [uraian1Options, setUraian1Options] = useState([]);
const [uraian2Options, setUraian2Options] = useState([]);
const [allUraian1Data, setAllUraian1Data] = useState([]);
const [allUraian2Data, setAllUraian2Data] = useState([]);


const [selectedAkunId, setSelectedAkunId] = useState(null);
const [selectedUraian1Id, setSelectedUraian1Id] = useState(null);


  const [selectedBidangId, setSelectedBidangId] = useState(null);
  const [selectedSubBidangId, setSelectedSubBidangId] = useState(null);

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

  // ====== Fetch Akun ======
useEffect(() => {
  async function fetchAkunOptions() {
    try {
      const response = await fetch("http://localhost:8081/api/apbd/akun");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAkunData(data); // simpan full object agar bisa ambil id-nya
      const options = data.map((item) => item.uraian);
      setAkunOptions(options);
    } catch (error) {
      console.error("Failed to fetch akun options:", error);
    }
  }
  fetchAkunOptions();
}, []);


useEffect(() => {
  if (akunData.length > 0) {
    setAkunOptions(akunData.map((a) => a.uraian));
  }
}, [akunData]);

// ======================================
// Fetch semua data uraian1
// ======================================
useEffect(() => {
  async function fetchAllUraian1() {
    try {
      const sumberIds = ["4.1", "4.2", "4.3", "5.1", "5.2", "5.3", "5.4", "6.1", "6.2"];
      let combined = [];
      for (const id of sumberIds) {
        const res = await fetch(`http://localhost:8081/api/apbd/uraian1?sumberDanaId=${id}`);
        if (res.ok) {
          const data = await res.json();
          combined = [...combined, ...data];
        }
      }
      setAllUraian1Data(combined);
    } catch (err) {
      console.error("Error fetch uraian1:", err);
    }
  }
  fetchAllUraian1();
}, []);

// ======================================
// Fetch semua data uraian2
// ======================================
useEffect(() => {
  async function fetchAllUraian2() {
    try {
      let combined = [];
      for (const uraian1 of allUraian1Data) {
        const res = await fetch(`http://localhost:8081/api/apbd/uraian2?uraian1Id=${uraian1.id}`);
        if (res.ok) {
          const data = await res.json();
          combined = [...combined, ...data];
        }
      }
      setAllUraian2Data(combined);
    } catch (err) {
      console.error("Error fetch uraian2:", err);
    }
  }
  if (allUraian1Data.length > 0) fetchAllUraian2();
}, [allUraian1Data]);


// ====== Fetch Uraian 1 berdasarkan Akun ======
useEffect(() => {
  if (!selectedAkunId) {
    setUraian1Options([]);
    return;
  }

  const filtered = allUraian1Data.filter((item) =>
    item.id.startsWith(`${selectedAkunId}.`)
  );

  setUraian1Options(filtered);
}, [selectedAkunId, allUraian1Data]);



// ====== Fetch Uraian 2 berdasarkan Uraian 1 ======
useEffect(() => {
  if (!selectedUraian1Id) {
    setUraian2Options([]);
    return;
  }

  const fetchUraian2Group = async () => {
    try {
      const prefix = selectedUraian1Id.slice(0, 3);
      const groups = {
        "4.1": ["4.1.1", "4.1.2", "4.1.3", "4.1.4"],
        "4.2": ["4.2.1", "4.2.2", "4.2.3", "4.2.4", "4.2.5"],
        "4.3": ["4.3.1", "4.3.2", "4.3.3", "4.3.4", "4.3.5", "4.3.6", "4.3.9"],
        "5.1": ["5.1.1", "5.1.2", "5.1.3", "5.1.4"],
        "5.2": ["5.2.1", "5.2.2", "5.2.3", "5.2.4", "5.2.5", "5.2.6", "5.2.7"],
        "5.3": ["5.3.1", "5.3.2", "5.3.3", "5.3.4", "5.3.5", "5.3.6", "5.3.7", "5.3.8", "5.3.9"],
        "5.4": ["5.4.1"],
        "6.1": ["6.1.1", "6.1.2", "6.1.3", "6.1.9"],
        "6.2": ["6.2.1", "6.2.2", "6.2.9"],
      };

      const relatedIds = groups[prefix] || [selectedUraian1Id];

      const results = await Promise.all(
        relatedIds.map(async (id) => {
          const res = await fetch(`http://localhost:8081/api/apbd/uraian2?uraian1Id=${id}`);
          if (!res.ok) return [];
          return await res.json();
        })
      );

      // gabung dan urutkan berdasarkan full_code
      const merged = results.flat().sort((a, b) => a.full_code.localeCompare(b.full_code));
      setUraian2Options(merged);
    } catch (err) {
      console.error("Error fetching grouped uraian2:", err);
      setUraian2Options([]);
    }
  };

  fetchUraian2Group();
}, [selectedUraian1Id]); // ✅ HANYA INI, jangan ada array/object lain




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
    onChange={(val) => {
      handleOnChange("pendapatanBelanja", val);
      const selected = akunData.find((a) => a.uraian === val);
      setSelectedAkunId(selected?.id || null);

      // reset uraian1 & uraian2
      setUraian1Options([]);
      setUraian2Options([]);
      setFormData((prev) => ({ ...prev, uraian1: "", uraian2: "" }));
    }}
  />
</div>

<div className="w-[27.5%] min-w-[180px]">
  <FormDropdown
    label="Uraian 1"
    options={uraian1Options.map((u) => u.uraian1)}
    value={formData.uraian1}
    onChange={(val) => {
      handleOnChange("uraian1", val);
      const selected = uraian1Options.find((u) => u.uraian1 === val);
      setSelectedUraian1Id(selected?.id || null);

      // reset uraian2
      setUraian2Options([]);
      setFormData((prev) => ({ ...prev, uraian2: "" }));
    }}
  />
</div>

<div className="w-[27.5%] min-w-[180px]">
  <FormDropdown
    label="Uraian 2"
    options={uraian2Options.map((u) => u.uraian2)}
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