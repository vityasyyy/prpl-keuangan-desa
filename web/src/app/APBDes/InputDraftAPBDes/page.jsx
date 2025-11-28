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
  const sumberDanaOptions = ["PBH", "DDS", "ADD", "DLL", "PBP"];

  // States to hold the currently displayed options for dropdowns
  const [akunOptions, setAkunOptions] = useState([]);
  const [jenisOptions, setJenisOptions] = useState([]);
  const [objekOptions, setObjekOptions] = useState([]);
  const [kelompokOptions, setKelompokOptions] = useState([]);
  const [bidangOptions, setBidangOptions] = useState([]);
  const [subBidangOptions, setSubBidangOptions] = useState([]);
  const [kegiatanOptions, setKegiatanOptions] = useState([]);

  // States to hold the FULL list of options fetched initially
  const [allAkunOptions, setAllAkunOptions] = useState([]);
  const [allJenisOptions, setAllJenisOptions] = useState([]);
  const [allObjekOptions, setAllObjekOptions] = useState([]);
  const [allKelompokOptions, setAllKelompokOptions] = useState([]);
  const [allBidangOptions, setAllBidangOptions] = useState([]);
  const [allSubBidangOptions, setAllSubBidangOptions] = useState([]);
  const [allKegiatanOptions, setAllKegiatanOptions] = useState([]);

  const [bidangData, setBidangData] = useState([]); // To store full bidang objects
  const [subBidangData, setSubBidangData] = useState([]); // To store full subBidang objects
  const [kegiatanData, setKegiatanData] = useState([]); // To store full kegiatan objects
  const [akunData, setAkunData] = useState([]);
  const [kelompokData, setKelompokData] = useState([]);
  const [jenisData, setJenisData] = useState([]);
  const [objekData, setObjekData] = useState([]);

  const [selectedBidangId, setSelectedBidangId] = useState(null);
  const [selectedSubBidangId, setSelectedSubBidangId] = useState(null);
  const [selectedAkunId, setSelectedAkunId] = useState(null);
  const [selectedKelompokId, setSelectedKelompokId] = useState(null);
  const [selectedJenisId, setSelectedJenisId] = useState(null);

  const [isLoadingEditData, setIsLoadingEditData] = useState(false);

  const [formData, setFormData] = useState({
    id: Date.now(),
    kodeRekEkonomi: "",
    pendapatanBelanja: "",
    jenis: "",
    objek: "",
    kodeRekBidang: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    anggaran: "",
    kelompok: "",
  });

  // Helper to format kode rekening with dots based on type
  const formatKodeRekening = (value, type) => {
    if (!value) return "";
  
    // Remove any non-digit characters first
    let cleanedValue = value.replace(/[^0-9]/g, "");
  
    if (type === "ekonomi") {
      if (cleanedValue.length > 5) {
        cleanedValue = cleanedValue.slice(0, 5);
      }
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
      if (cleanedValue.length > 4) {
        cleanedValue = cleanedValue.slice(0, 4);
      }
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

  // Fetch all dropdown options on component mount
  useEffect(() => {
    async function fetchAllDropdownOptions() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/all-dropdown-options`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data } = await response.json();

        // Set initial full lists
        setAllAkunOptions(data.akun.map((item) => item.uraian));
        setAllJenisOptions(data.jenis.map((item) => item.uraian));
        setAllObjekOptions(data.objek.map((item) => item.uraian));
        setAllKelompokOptions(data.kelompok.map((item) => item.uraian));
        setAllBidangOptions(data.bidang.map((item) => item.uraian));
        setAllSubBidangOptions(data.subBidang.map((item) => item.uraian));
        setAllKegiatanOptions(data.kegiatan.map((item) => item.uraian));

        // Also set the current options to the full lists initially
        setAkunOptions(data.akun.map((item) => item.uraian));
        setJenisOptions(data.jenis.map((item) => item.uraian));
        setObjekOptions(data.objek.map((item) => item.uraian));
        setKelompokOptions(data.kelompok.map((item) => item.uraian));
        setBidangOptions(data.bidang.map((item) => item.uraian));
        setSubBidangOptions(data.subBidang.map((item) => item.uraian));
        setKegiatanOptions(data.kegiatan.map((item) => item.uraian));

        setBidangData(data.bidang);
        setSubBidangData(data.subBidang);
        setKegiatanData(data.kegiatan);
        setAkunData(data.akun);
        setKelompokData(data.kelompok);
        setJenisData(data.jenis);
        setObjekData(data.objek);
      } catch (error) {
        console.error("Failed to fetch all dropdown options:", error);
      }
    }
    fetchAllDropdownOptions();
  }, []);

  // Filter Sub-Bidang options when a Bidang is selected
  useEffect(() => {
    if (selectedBidangId && subBidangData.length > 0) {
      const filtered = subBidangData.filter((item) => item.parent_id === selectedBidangId);
      setSubBidangOptions(filtered.map((item) => item.uraian));
    } else {
      setSubBidangOptions(allSubBidangOptions); // Reset if no Bidang is selected
    }
    if (!isLoadingEditData) {
      handleOnChange("subBidang", ""); // Reset sub-bidang selection
      handleOnChange("kegiatan", ""); // Reset kegiatan selection
    }
  }, [selectedBidangId, subBidangData, allSubBidangOptions]);

  // Filter Kegiatan options when a Sub-Bidang is selected
  useEffect(() => {
    if (selectedSubBidangId && kegiatanData.length > 0) {
      const filtered = kegiatanData.filter((item) => item.parent_id === selectedSubBidangId);
      setKegiatanOptions(filtered.map((item) => item.uraian));
    } else {
      setKegiatanOptions(allKegiatanOptions); // Reset if no Sub-Bidang is selected
    }
    if (!isLoadingEditData) {
      handleOnChange("kegiatan", ""); // Reset kegiatan selection
    }
  }, [selectedSubBidangId, kegiatanData, allKegiatanOptions]);

  // Filter Sumber Dana options when an Akun is selected
  useEffect(() => {
    if (selectedAkunId && kelompokData.length > 0) {
      const filtered = kelompokData.filter((item) => item.parent_id === selectedAkunId);
      setKelompokOptions(filtered.map((item) => item.uraian));
    } else {
      setKelompokOptions(allKelompokOptions);
    }
    if (!isLoadingEditData) {
      handleOnChange("kelompok", "");
      handleOnChange("jenis", "");
      handleOnChange("objek", "");
    }
  }, [selectedAkunId, kelompokData, allKelompokOptions]);
  // Filter Uraian 1 options when a Kelompok is selected
  useEffect(() => {
    if (selectedKelompokId && jenisData.length > 0) {
      const filtered = jenisData.filter((item) => item.parent_id === selectedKelompokId);
      setJenisOptions(filtered.map((item) => item.uraian));
    } else {
      setJenisOptions(allJenisOptions);
    }
    if (!isLoadingEditData) {
      handleOnChange("jenis", "");
      handleOnChange("objek", "");
    }
  }, [selectedKelompokId, jenisData, allJenisOptions]);

  // Filter Objek options when a Jenis is selected
  useEffect(() => {
    if (selectedJenisId && objekData.length > 0) {
      const filtered = objekData.filter((item) => item.parent_id === selectedJenisId);
      setObjekOptions(filtered.map((item) => item.uraian));
    } else {
      setObjekOptions(allObjekOptions);
    }
    if (!isLoadingEditData) {
      handleOnChange("objek", "");
    }
  }, [selectedJenisId, objekData, allObjekOptions]);

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
    if (id && akunData.length > 0 && bidangData.length > 0 && subBidangData.length > 0 && 
        kelompokData.length > 0 && jenisData.length > 0) {
      const allData = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const existing = allData.find((item) => item.id == id);
      if (existing) {
        setIsLoadingEditData(true);
        setFormData(existing);
        
        // Set selected IDs berdasarkan data yang dimuat
        // 1. Set Akun ID untuk filter Sumber Dana
        const selectedAkun = akunData.find((item) => item.uraian === existing.pendapatanBelanja);
        if (selectedAkun) {
          setSelectedAkunId(selectedAkun.id);
        }
        
        // 2. Set Bidang ID untuk filter Sub-Bidang
        const selectedBidang = bidangData.find((item) => item.uraian === existing.bidang);
        if (selectedBidang) {
          setSelectedBidangId(selectedBidang.id);
        }
      }
    }
  }, [id, akunData, bidangData, subBidangData, kelompokData, jenisData]);

  // Set Sub-Bidang ID setelah subBidangOptions ter-update
  useEffect(() => {
    if (isLoadingEditData && id && subBidangOptions.length > 0) {
      const allData = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const existing = allData.find((item) => item.id == id);
      if (existing && existing.subBidang) {
        const selectedSubBidang = subBidangData.find(
          (item) => item.uraian === existing.subBidang
        );
        if (selectedSubBidang) {
          setSelectedSubBidangId(selectedSubBidang.id);
        }
      }
    }
  }, [isLoadingEditData, subBidangOptions, id]);

  // Set Kelompok ID setelah kelompokOptions ter-update
  useEffect(() => {
    if (isLoadingEditData && id && kelompokOptions.length > 0) {
      const allData = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const existing = allData.find((item) => item.id == id);
      if (existing && existing.kelompok) {
        const selectedKelompok = kelompokData.find(
          (item) => item.uraian === existing.kelompok
        );
        if (selectedKelompok) {
          setSelectedKelompokId(selectedKelompok.id);
        }
      }
    }
  }, [isLoadingEditData, kelompokOptions, id]);
  // Set Jenis ID setelah jenisOptions ter-update
  useEffect(() => {
    if (isLoadingEditData && id && jenisOptions.length > 0) {
      const allData = JSON.parse(localStorage.getItem("apbdesData") || "[]");
      const existing = allData.find((item) => item.id == id);
      if (existing && existing.jenis) {
        const selectedJenis = jenisData.find(
          (item) => item.uraian === existing.jenis
        );
        if (selectedJenis) {
          setSelectedJenisId(selectedJenis.id);
        }
      }
    }
  }, [isLoadingEditData, jenisOptions, id]);
  // Selesai loading edit data setelah semua options ter-update
  useEffect(() => {
    if (isLoadingEditData && objekOptions.length > 0 && kegiatanOptions.length > 0) {
      // Beri sedikit delay untuk memastikan semua state sudah ter-update
      setTimeout(() => {
        setIsLoadingEditData(false);
      }, 100);
    }
  }, [isLoadingEditData, objekOptions, kegiatanOptions]);

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
        handleOnChange("jenis", "");
        handleOnChange("objek", "");
        setAkunOptions([]);
        setJenisOptions([]);
        setObjekOptions([]);
        setKelompokOptions([]);
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
          const { akun, kelompok, jenis, objek, allKelompok, allJenis, allObjek } = result.data;

          // Update Akun dropdown
          setAkunOptions([akun.uraian]);
          handleOnChange("pendapatanBelanja", akun.uraian);

          // Update Jenis dropdown
          setJenisOptions(allJenis.map(item => item.uraian));
          handleOnChange("jenis", jenis.uraian); // Assuming 'jenis' is the selected value for Jenis

          // Update Objek dropdown
          setObjekOptions(allObjek.map(item => item.uraian));
          handleOnChange("objek", objek.uraian); // Assuming 'objek' is the selected value for Objek
          // Update Sumber Dana dropdown
          setKelompokOptions(allKelompok.map(item => item.uraian));
          handleOnChange("kelompok", kelompok.uraian); // Assuming 'kelompok' is the selected value for Kelompok

        } else {
          handleOnChange("pendapatanBelanja", "");
          handleOnChange("jenis", "");
          handleOnChange("objek", "");
          setAkunOptions([]);
          setJenisOptions([]);
          setObjekOptions([]);
          setKelompokOptions([]);
        }
      } catch (error) {
        console.error("Failed to fetch ekonomi options:", error);
        handleOnChange("pendapatanBelanja", "");
        handleOnChange("jenis", "");
        handleOnChange("objek", "");
        setAkunOptions([]);
        setJenisOptions([]);
        setObjekOptions([]);
        setKelompokOptions([]);
      }
    }, 500),
    []
  );

  const handleKodeRekEkonomiChange = (value) => {
    const formattedValue = formatKodeRekening(value, "ekonomi");
    handleOnChange("kodeRekEkonomi", formattedValue);
    fetchEkonomiOptionsDebounced(formattedValue);
  };

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
        kelompok: "",
        jenis: "",
        objek: "",
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
        kelompok: "",
        jenis: "",
        objek: "",
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
                onChange={(val) => {
                  handleOnChange("pendapatanBelanja", val);
                  const selected = akunData.find((item) => item.uraian === val);
                  setSelectedAkunId(selected ? selected.id : null);
                }}
              />
            </div>
            <div className="w-[3%] min-w-[200px]">
              <FormDropdown
                label="Kelompok"
                options={kelompokOptions}
                value={formData.kelompok}
                onChange={(val) => {
                  handleOnChange("kelompok", val);
                  const selected = kelompokData.find((item) => item.uraian === val);
                  setSelectedKelompokId(selected ? selected.id : null);
                }}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Jenis"
                options={jenisOptions}
                value={formData.jenis}
                onChange={(val) => {
                  handleOnChange("jenis", val);
                  const selected = jenisData.find(
                    (item) => item.uraian === val && item.parent_id === selectedKelompokId
                  );
                  setSelectedJenisId(selected ? selected.id : null);
                }}
                disabled={!selectedKelompokId}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Objek"
                options={objekOptions}
                value={formData.objek}
                onChange={(val) => handleOnChange("objek", val)}
                disabled={!selectedJenisId}
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
                  const selected = subBidangData.find(
                    (item) => item.uraian === val && item.parent_id === selectedBidangId
                  );
                  setSelectedSubBidangId(selected ? selected.id : null);
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
            onChange={(val) => {
              handleOnChange("sumberDana", val);
              const selected = sumberDanaData.find(
                (item) => item.uraian === val && item.parent_id === selectedAkunId
              );
              setSelectedSumberDanaId(selected ? selected.id : null);
            }}
            disabled={!selectedAkunId}
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
