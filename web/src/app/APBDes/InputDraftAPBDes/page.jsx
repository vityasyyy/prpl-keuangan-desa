"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import FormDropdown from "@/components/formDropdown";
import { TextInput } from "@/components/formInput";
import { Trash, Floppy, ToggleLeft, ToggleRight } from "@/components/icons";

export default function InputDraftAPBDes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get id from query if editing

  const [akunOptions, setAkunOptions] = useState([]);
  const [uraian1Options, setUraian1Options] = useState([]); // New state for Uraian 1 options
  const [uraian2Options, setUraian2Options] = useState([]); // New state for Uraian 2 options
  const [sumberDanaOptions, setSumberDanaOptions] = useState([]); // New state for Sumber Dana options
  const [bidangOptions, setBidangOptions] = useState([]);
  const [subBidangOptions, setSubBidangOptions] = useState([]);
  const [kegiatanOptions, setKegiatanOptions] = useState([]);

  const [bidangData, setBidangData] = useState([]); // To store full bidang objects
  const [subBidangData, setSubBidangData] = useState([]); // To store full subBidang objects
  const [kegiatanData, setKegiatanData] = useState([]); // To store full kegiatan objects

  const [selectedBidangId, setSelectedBidangId] = useState(null);
  const [selectedSubBidangId, setSelectedSubBidangId] = useState(null);

  const [formData, setFormData] = useState({
    id: Date.now(),
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

  // Helper to format kode rekening with dots based on type
  const formatKodeRekening = (value, type) => {
    if (!value) return "";

    // Remove any non-digit characters first
    let cleanedValue = value.replace(/[^0-9]/g, "");

    if (type === "ekonomi") {
      // Format for Kode Ekonomi: X.X.X.XX (e.g., 4.2.1.01)
      if (cleanedValue.length > 1) {
        cleanedValue = cleanedValue.slice(0, 1) + "." + cleanedValue.slice(1);
      }
      if (cleanedValue.length > 3) {
        cleanedValue = cleanedValue.slice(0, 3) + "." + cleanedValue.slice(3);
      }
      if (cleanedValue.length > 5) {
        cleanedValue = cleanedValue.slice(0, 5) + "." + cleanedValue.slice(5);
      }
    } else if (type === "bidang") {
      // Format for Kode Fungsi (Bidang Kegiatan): X.X.XX (e.g., 1.1.01)
      if (cleanedValue.length > 1) {
        cleanedValue = cleanedValue.slice(0, 1) + "." + cleanedValue.slice(1);
      }
      if (cleanedValue.length > 3) {
        cleanedValue = cleanedValue.slice(0, 3) + "." + cleanedValue.slice(3);
      }
    }
    return cleanedValue;
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // Fetch dropdown options for Akun
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

  // Fetch dropdown options for Bidang
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

  // Fetch dropdown options for Sub-Bidang based on selectedBidangId
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

  // Fetch dropdown options for Kegiatan based on selectedSubBidangId
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

  // Helpers: sanitize number and normalize kategori
  const sanitizeNumber = (val) => {
    if (val === null || val === undefined) return 0;
    const s = String(val).replace(/\s/g, "").replace(/[^0-9.,-]/g, "");
    // If contains both '.' and ',' assume '.' thousands and ',' decimal
    if (s.indexOf(",") > -1 && s.indexOf(".") > -1) {
      return Number(s.replace(/\./g, "").replace(",", ".")) || 0;
    }
    // If contains only '.' and multiple dots, remove them (thousands separators)
    if (s.indexOf(".") > -1 && s.indexOf(",") === -1) {
      if ((s.match(/\./g) || []).length > 1) {
        return Number(s.replace(/\./g, "")) || 0;
      }
      return Number(s) || 0;
    }
    if (s.indexOf(",") > -1) return Number(s.replace(",", ".")) || 0;
    return Number(s) || 0;
  };

  // Helper to format anggaran input with dots for thousands
  const formatAnggaranInput = (value) => {
    if (value === null || value === undefined || value === "") return "";
    // Remove all non-digit characters
    let cleanedValue = String(value).replace(/[^0-9]/g, "");

    // Add thousands separator
    return cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const normalizeKategori = (label) => {
    if (!label) return "";
    const v = label.toString().toLowerCase();
    if (v.includes("pendapatan")) return "Pendapatan";
    if (v.includes("belanja")) return "Belanja";
    if (v.includes("pembiayaan")) return "Pembiayaan";
    return label;
  };

  const [buatLagi, setBuatLagi] = useState(false);

  // Load data kalau sedang edit
  useEffect(() => {
    if (id) {
      const allData = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const existing = allData.find((item) => item.id == id);
      if (existing) setFormData(existing);
    }
  }, [id]);

  const handleOnChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Debounced API call for Kode Rek Ekonomi
  const fetchEkonomiOptionsDebounced = useCallback(
    debounce(async (kodeRekening) => {
      if (!kodeRekening) {
        handleOnChange("pendapatanBelanja", "");
        handleOnChange("uraian1", "");
        handleOnChange("uraian2", "");
        setAkunOptions([]);
        setUraian1Options([]);
        setUraian2Options([]);
        setSumberDanaOptions([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8081/api/apbd/dropdown-options?kodeRekening=${kodeRekening}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data.type === "kode_ekonomi") {
          const { akun, kelompok, jenis, objek, sumberDana, uraian1, uraian2 } = result.data;

          // Update Akun dropdown
          setAkunOptions([akun.uraian]);
          handleOnChange("pendapatanBelanja", akun.uraian);

          // Update Uraian 1 dropdown
          setUraian1Options(uraian1.map(item => item.uraian));
          handleOnChange("uraian1", jenis.uraian); // Assuming 'kelompok' is the selected value for Uraian 1

          // Update Uraian 2 dropdown
          setUraian2Options(uraian2.map(item => item.uraian));
          handleOnChange("uraian2", objek.uraian); // Assuming 'jenis' is the selected value for Uraian 2

          // Update Sumber Dana dropdown
          setSumberDanaOptions(sumberDana.map(item => item.uraian));
          handleOnChange("sumberDana", kelompok.uraian); // Assuming 'kelompok' is the selected value for Sumber Dana

        } else {
          handleOnChange("pendapatanBelanja", "");
          handleOnChange("uraian1", "");
          handleOnChange("uraian2", "");
          setAkunOptions([]);
          setUraian1Options([]);
          setUraian2Options([]);
          setSumberDanaOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch ekonomi options:", error);
        handleOnChange("pendapatanBelanja", "");
        handleOnChange("uraian1", "");
        handleOnChange("uraian2", "");
        setAkunOptions([]);
        setUraian1Options([]);
        setUraian2Options([]);
        setSumberDanaOptions([]);
      }
    }, 500),
    []
  );

  // Debounced API call for Kode Rek Bidang
  const fetchBidangOptionsDebounced = useCallback(
    debounce(async (kodeRekening) => {
      if (!kodeRekening) {
        handleOnChange("bidang", "");
        handleOnChange("subBidang", "");
        handleOnChange("kegiatan", "");
        setBidangOptions([]);
        setSubBidangOptions([]);
        setKegiatanOptions([]);
        setSelectedBidangId(null);
        setSelectedSubBidangId(null);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8081/api/apbd/dropdown-options?kodeRekening=${kodeRekening}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data.type === "kode_fungsi") {
          const { bidang, subBidang, kegiatan } = result.data;

          // Update Bidang dropdown
          setBidangOptions([bidang.uraian]);
          handleOnChange("bidang", bidang.uraian);
          setSelectedBidangId(bidang.id);

          // Update Sub-Bidang dropdown
          if (subBidang) {
            const subBidangResponse = await fetch(
              `http://localhost:8081/api/apbd/sub-bidang?bidangId=${bidang.id}`
            );
            const subBidangData = await subBidangResponse.json();
            setSubBidangOptions(subBidangData.map(item => item.uraian));
            handleOnChange("subBidang", subBidang.uraian);
            setSelectedSubBidangId(subBidang.id);
          } else {
            setSubBidangOptions([]);
            handleOnChange("subBidang", "");
            setSelectedSubBidangId(null);
          }

          // Update Kegiatan dropdown
          if (kegiatan) {
            const kegiatanResponse = await fetch(
              `http://localhost:8081/api/apbd/kegiatan?subBidangId=${subBidang.id}`
            );
            const kegiatanData = await kegiatanResponse.json();
            setKegiatanOptions(kegiatanData.map(item => item.uraian));
            handleOnChange("kegiatan", kegiatan.uraian);
          } else {
            setKegiatanOptions([]);
            handleOnChange("kegiatan", "");
          }
        } else {
          handleOnChange("bidang", "");
          handleOnChange("subBidang", "");
          handleOnChange("kegiatan", "");
          setBidangOptions([]);
          setSubBidangOptions([]);
          setKegiatanOptions([]);
          setSelectedBidangId(null);
          setSelectedSubBidangId(null);
        }
      } catch (error) {
        console.error("Failed to fetch bidang options:", error);
        handleOnChange("bidang", "");
        handleOnChange("subBidang", "");
        handleOnChange("kegiatan", "");
        setBidangOptions([]);
        setSubBidangOptions([]);
        setKegiatanOptions([]);
        setSelectedBidangId(null);
        setSelectedSubBidangId(null);
      }
    }, 500),
    []
  );

  const handleKodeRekEkonomiChange = (value) => {
    const formattedValue = formatKodeRekening(value, "ekonomi");
    handleOnChange("kodeRekEkonomi", formattedValue);
    fetchEkonomiOptionsDebounced(formattedValue);
  };

  const handleKodeRekBidangChange = (value) => {
    const formattedValue = formatKodeRekening(value, "bidang");
    handleOnChange("kodeRekBidang", formattedValue);
    fetchBidangOptionsDebounced(formattedValue);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    let dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");

    if (id) {
      // mode edit
      dataLokal = dataLokal.map((item) =>
        item.id == id
          ? {
              ...item,
              ...formData,
              anggaran: sanitizeNumber(formData.anggaran),
              kategori: normalizeKategori(formData.pendapatanBelanja),
            }
          : item
      );
      alert("✅ Data berhasil diperbarui!");
    } else {
      // mode tambah baru
      const newItem = {
        ...formData,
        id: Date.now(),
        anggaran: sanitizeNumber(formData.anggaran),
        kategori: normalizeKategori(formData.pendapatanBelanja),
      };
      dataLokal.push(newItem);
      alert("✅ Data berhasil disimpan!");
    }

    localStorage.setItem("apbdesData", JSON.stringify(dataLokal));
    // Dispatch events so other parts of the app can react immediately
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("apbdes:update"));

    if (!buatLagi) {
      router.push("/APBDes/OutputDraftAPBDes");
    } else {
      setFormData({
        id: Date.now(),
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

  // 🗑️ Hapus data + konfirmasi (seperti di kode kedua)
  const handleHapus = () => {
    const confirmDelete = window.confirm(
      "⚠️ Apakah Anda yakin ingin menghapus data ini?"
    );

    if (!confirmDelete) return;

    if (id) {
      let dataLokal = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      dataLokal = dataLokal.filter((item) => item.id != id);
      localStorage.setItem("apbdesData", JSON.stringify(dataLokal));
      alert("🗑️ Data berhasil dihapus!");
      window.dispatchEvent(new Event("storage"));
      router.push("/APBDes/OutputDraftAPBDes");
    } else {
      setFormData({
        id: Date.now(),
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
      alert("🧹 Form dikosongkan (tidak ada data yang dihapus)");
    }
  };

  return (
    <main className="min-h-screen bg-white px-16 py-8">
      <BreadCrumb category="APBDes" title="Input Draft APBDes" />

      <h1 className="mb-6 text-base font-semibold text-black">
        {id ? "Edit Data APBDes" : "Input Data APBDes"}
      </h1>

      {/* ===== KODE REKENING DAN URAIAN ===== */}
      <div className="mb-6 rounded-2xl border border-gray-400 px-6 py-6 overflow-x-auto">
        <h2 className="text-sm font-semibold text-[#011829] mb-4">
          Kode Rekening dan Uraian
        </h2>

        {/* Klasifikasi Ekonomi */}
        <div className="space-y-2 min-w-[900px]">
          <label className="block text-sm font-medium text-[#011829]">
            Klasifikasi Ekonomi
          </label>
          <div className="flex gap-3 w-full">
            <div className="w-[15%] min-w-[120px]">
              <TextInput
                placeholder="Kode Rek"
                value={formData.kodeRekEkonomi}
                onChange={handleKodeRekEkonomiChange}
              />
            </div>
            <div className="w-[3%] min-w-[200px]">
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
                options={uraian1Options}
                value={formData.uraian1}
                onChange={(val) => handleOnChange("uraian1", val)}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Uraian 2"
                options={uraian2Options}
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
                onChange={handleKodeRekBidangChange}
              />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Bidang"
                options={bidangOptions}
                value={formData.bidang}
                onChange={(val) => {
                  handleOnChange("bidang", val);
                  const selected = bidangData.find((item) => item.uraian === val);
                  setSelectedBidangId(selected ? selected.id : null);
                  // reset sub-bidang & kegiatan saat bidang berubah
                  setSelectedSubBidangId(null);
                  handleOnChange("subBidang", "");
                  handleOnChange("kegiatan", "");
                }}
              />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Sub-Bidang"
                options={subBidangOptions}
                value={formData.subBidang}
                onChange={(val) => {
                  handleOnChange("subBidang", val);
                  const selected = subBidangData.find((item) => item.uraian === val);
                  setSelectedSubBidangId(selected ? selected.id : null);
                  handleOnChange("kegiatan", "");
                }}
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
        <h2 className="text-sm font-semibold text-[#011829]">
          Anggaran dan Sumber Dana
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">
            Anggaran
          </label>
          <TextInput
            prefix="Rp"
            placeholder="0.000.000"
            value={formatAnggaranInput(formData.anggaran)}
            onChange={(val) => handleOnChange("anggaran", String(val).replace(/[^0-9]/g, ""))}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#011829]">
            Sumber Dana
          </label>
          <FormDropdown
            label="PBH / DDS / ADD / DLL / PBP"
            options={sumberDanaOptions}
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
              <ToggleRight
                width={28}
                height={28}
                className="text-blue-600 transition-colors duration-200"
              />
            ) : (
              <ToggleLeft
                width={28}
                height={28}
                className="text-gray-500 transition-colors duration-200"
              />
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
