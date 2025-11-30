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
  const [kodeEkoError, setKodeEkoError] = useState("");
  const [kodeRekError, setKodeRekError] = useState("");

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

  // ====== PARSING & FORMATTING UTILITIES (dari Kas-umum form) ======
  
  // Parse "4.1.1.01" atau "4.1.1.90-99" → ["4","1","1","01"] atau ["4","1","1","90-99"]
  const ekoParse = (s) =>
    (s || "")
      .toString()
      .replace(/\./g, " ")
      .replace(/[^\d \-]+/g, "") // Allow dash for ranges like 90-99
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  // Format ke "A B C DD" (Objek/token ke-4 dipad 2 digit atau range seperti 90-99)
  const ekoFormat = (parts) => {
    const [a = "", b = "", c = "", d = ""] = parts;
    const out = [];
    if (a) out.push(String(parseInt(a, 10)));
    if (b) out.push(String(parseInt(b, 10)));
    if (c) out.push(String(parseInt(c, 10)));
    if (d) {
      // Handle ranges like '90-99' or regular numbers
      if (d.includes('-')) {
        out.push(d); // Keep range as-is
      } else {
        out.push(String(d).padStart(2, "0")); // Pad single numbers
      }
    }
    return out.join(" ");
  };

  // Validator sederhana untuk A B C DD (termasuk range seperti 90-99)
  const validateKodeEko = (kode) => {
    if (!kode) return "";
    const clean = kode.replace(/\./g, " ").trim();
    // Allow ranges like '90-99' in the DD position
    const pattern = /^\d+(\s+\d+(\s+\d+(\s+(\d{1,2}|\d{1,2}-\d{1,2}))?)?)?$/; // A [B [C [DD or DD-DD]]]
    if (!pattern.test(clean)) return "Format harus 'A B C DD' (contoh: 4 1 1 01 atau 4 1 1 90-99)";
    const p = clean.split(/\s+/);
    if (p[0] && p[0].length > 1) return "Akun (A) 1 digit";
    if (p[1] && p[1].length > 1) return "Kelompok (B) 1 digit";
    if (p[2] && p[2].length > 1) return "Jenis (C) 1 digit";
    if (p[3]) {
      // Validate DD: either 1-2 digits or a range like DD-DD
      if (p[3].includes('-')) {
        const rangeParts = p[3].split('-');
        if (rangeParts.length !== 2 || 
            rangeParts[0].length > 2 || rangeParts[1].length > 2 ||
            !/^\d+$/.test(rangeParts[0]) || !/^\d+$/.test(rangeParts[1])) {
          return "Objek (DD) harus 1-2 digit atau range (contoh: 90-99)";
        }
      } else if (p[3].length > 2) {
        return "Objek (DD) maksimal 2 digit";
      }
    }
    return "";
  };

  // Format dari full_code API (bisa bertitik) → spasi
  const formatEkoFromFullCode = (full) => ekoFormat(ekoParse(full));

  // Fungsi validasi format kode bidang (x x xx)
  // Validator untuk x x xx (termasuk range seperti 1 1 90-99)
  const validateKodeRek = (kode) => {
    if (!kode) return "";
    const cleanKode = kode.replace(/\./g, " ").trim();
    // Allow ranges like '90-99' in the xx position
    const pattern = /^\d+(\s+\d+(\s+(\d{1,2}|\d{1,2}-\d{1,2}))?)?$/; // x [x [xx or xx-xx]]
    if (!pattern.test(cleanKode)) {
      return "Format kode harus 'x x xx' (contoh: 1 2 03 atau 1 1 90-99)";
    }
    const parts = cleanKode.split(/\s+/);
    if (parts[0] && parts[0].length > 1) return "Kode bidang harus 1 digit";
    if (parts[1] && parts[1].length > 1) return "Kode sub-bidang harus 1 digit";
    if (parts[2]) {
      // Validate xx: either 1-2 digits or a range like xx-xx
      if (parts[2].includes('-')) {
        const rangeParts = parts[2].split('-');
        if (rangeParts.length !== 2 || 
            rangeParts[0].length > 2 || rangeParts[1].length > 2 ||
            !/^\d+$/.test(rangeParts[0]) || !/^\d+$/.test(rangeParts[1])) {
          return "Kode kegiatan harus 1-2 digit atau range (contoh: 90-99)";
        }
      } else if (parts[2].length > 2) {
        return "Kode kegiatan maksimal 2 digit";
      }
    }
    return "";
  };

  // Format kode bidang ke format yang benar (x x xx atau x x xx-xx)
  const formatKodeRek = (kode) => {
    const cleanKode = kode.replace(/\./g, " ");
    const parts = cleanKode.split(/\s+/);
    const formattedParts = parts.map((part, index) => {
      if (index === 2) {
        // Handle ranges like '90-99' or regular numbers
        if (part.includes('-')) {
          return part; // Keep range as-is
        }
        return part.padStart(2, "0");
      }
      return parseInt(part);
    });
    return formattedParts.join(" ");
  };

  // Removed debounce - using direct parsing logic instead

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

  // Handle Kode Rek Ekonomi change dengan parsing logic (dari Kas-umum form)
  const handleKodeRekEkonomiChange = (value) => {
    if (value === formData.kodeRekEkonomi) return;
    
    const err = validateKodeEko(value);
    setKodeEkoError(err);
    handleOnChange("kodeRekEkonomi", value);

    if (!err) {
      const parts = ekoParse(value); // ["A","B","C","DD"]

      // 1) AKUN = token[0]
      if (parts[0] && akunData.length > 0) {
        const mAkun = akunData.find((a) => ekoParse(a.full_code)[0] === parts[0]);
        if (mAkun) {
          handleOnChange("pendapatanBelanja", mAkun.uraian);
          setSelectedAkunId(mAkun.id);
          // reset turunannya
          handleOnChange("kelompok", "");
          handleOnChange("jenis", "");
          handleOnChange("objek", "");
        }
      }

      // 2) KELOMPOK = token[0..1]
      if (parts.length >= 2 && kelompokData.length > 0) {
        const mKelompok = kelompokData.find((k) => {
          const tok = ekoParse(k.full_code);
          return tok[0] === parts[0] && tok[1] === parts[1];
        });
        if (mKelompok) {
          handleOnChange("kelompok", mKelompok.uraian);
          setSelectedKelompokId(mKelompok.id);
          // reset turunannya
          handleOnChange("jenis", "");
          handleOnChange("objek", "");
        }
      }

      // 3) JENIS = token[0..2]
      if (parts.length >= 3 && jenisData.length > 0) {
        const mJenis = jenisData.find((j) => {
          const tok = ekoParse(j.full_code);
          return tok[0] === parts[0] && tok[1] === parts[1] && tok[2] === parts[2];
        });
        if (mJenis) {
          handleOnChange("jenis", mJenis.uraian);
          setSelectedJenisId(mJenis.id);
          // reset objek
          handleOnChange("objek", "");
        }
      }

      // 4) OBJEK = token[0..3] (termasuk range seperti 90-99)
      if (parts.length >= 4 && objekData.length > 0) {
        // Handle both regular numbers and ranges
        const dd = parts[3].includes('-') ? parts[3] : parts[3].padStart(2, "0");
        const mObj = objekData.find((o) => {
          const tok = ekoParse(o.full_code);
          return (
            tok[0] === parts[0] && tok[1] === parts[1] && tok[2] === parts[2] && tok[3] === dd
          );
        });
        if (mObj) {
          handleOnChange("objek", mObj.uraian);
        }
      }

      // Jika kosong total → kosongkan dropdown
      if (parts.length === 0) {
        handleOnChange("pendapatanBelanja", "");
        handleOnChange("kelompok", "");
        handleOnChange("jenis", "");
        handleOnChange("objek", "");
      }
    }
  };

  // Handle Kode Rek Bidang change dengan parsing logic (dari Kas-umum form)
  const handleKodeRekBidangChange = (value) => {
    // Hanya proses jika ada perubahan
    if (value === formData.kodeRekBidang) return;
    
    const error = validateKodeRek(value);
    setKodeRekError(error);
    // Update form dengan kode yang diinput
    handleOnChange("kodeRekBidang", value);
    
    if (!error) {
      // Format: ubah titik jadi spasi dan trim
      const cleanKode = value.replace(/\./g, " ").trim();
      const parts = cleanKode.split(/\s+/).filter(Boolean);
      
      // Jika kosong total → kosongkan semua dropdown dan selected IDs
      if (parts.length === 0 || !value.trim()) {
        handleOnChange("bidang", "");
        handleOnChange("subBidang", "");
        handleOnChange("kegiatan", "");
        setSelectedBidangId(null);
        setSelectedSubBidangId(null);
        return;
      }
      
      if (parts[0]) {
        const matchingBidang = bidangData.find((b) => {
          const bidangParts = b.full_code.replace(/\./g, " ").trim().split(/\s+/);
          return parseInt(bidangParts[0]) === parseInt(parts[0]);
        });
        
        if (matchingBidang) {
          handleOnChange("bidang", matchingBidang.uraian);
          setSelectedBidangId(matchingBidang.id);
          handleOnChange("subBidang", "");
          handleOnChange("kegiatan", "");
          
          if (parts[1] && subBidangData.length > 0) {
            const matchingSubBidang = subBidangData.find((s) => {
              const subParts = s.full_code.replace(/\./g, " ").trim().split(/\s+/);
              return (
                parseInt(subParts[0]) === parseInt(parts[0]) &&
                parseInt(subParts[1]) === parseInt(parts[1])
              );
            });
            
            if (matchingSubBidang) {
              handleOnChange("subBidang", matchingSubBidang.uraian);
              setSelectedSubBidangId(matchingSubBidang.id);
              handleOnChange("kegiatan", "");
              
              if (parts[2] && kegiatanData.length > 0) {
                const matchingKegiatan = kegiatanData.find((k) => {
                  // Handle both regular numbers and ranges
                  const kegiatanCode = parts[2].includes('-') ? parts[2] : parts[2].padStart(2, "0");
                  const targetKode = `${parseInt(parts[0])} ${parseInt(parts[1])} ${kegiatanCode}`;
                  return k.full_code.replace(/\./g, " ").trim() === targetKode;
                });
                
                if (matchingKegiatan) {
                  handleOnChange("kegiatan", matchingKegiatan.uraian);
                }
              }
            }
          }
        }
      }
    }
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
      router.push("/APBDes/output-draft-apbdes");
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
      router.push("/APBDes/output-draft-apbdes");
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
                  if (!val) {
                    handleOnChange("pendapatanBelanja", "");
                    handleOnChange("kelompok", "");
                    handleOnChange("jenis", "");
                    handleOnChange("objek", "");
                    handleOnChange("kodeRekEkonomi", "");
                    setKodeEkoError("");
                    return;
                  }
                  const a = akunData.find((x) => x.uraian === val);
                  if (a) {
                    const kodeAkun = ekoFormat(ekoParse(a.full_code).slice(0, 1));
                    handleOnChange("pendapatanBelanja", val);
                    handleOnChange("kelompok", "");
                    handleOnChange("jenis", "");
                    handleOnChange("objek", "");
                    handleOnChange("kodeRekEkonomi", kodeAkun);
                    setSelectedAkunId(a.id);
                    setKodeEkoError("");
                  }
                }}
              />
            </div>
            <div className="w-[3%] min-w-[200px]">
              <FormDropdown
                label="Kelompok"
                options={kelompokOptions}
                value={formData.kelompok}
                onChange={(val) => {
                  if (!val) {
                    if (formData.pendapatanBelanja) {
                      const a = akunData.find((x) => x.uraian === formData.pendapatanBelanja);
                      const kodeAkun = a ? ekoFormat(ekoParse(a.full_code).slice(0, 1)) : "";
                      handleOnChange("kelompok", "");
                      handleOnChange("jenis", "");
                      handleOnChange("objek", "");
                      handleOnChange("kodeRekEkonomi", kodeAkun);
                    } else {
                      handleOnChange("kelompok", "");
                      handleOnChange("jenis", "");
                      handleOnChange("objek", "");
                      handleOnChange("kodeRekEkonomi", "");
                    }
                    setKodeEkoError("");
                    return;
                  }
                  const k = kelompokData.find((x) => x.uraian === val);
                  if (k) {
                    const kodeKelompok = ekoFormat(ekoParse(k.full_code).slice(0, 2));
                    handleOnChange("kelompok", val);
                    handleOnChange("jenis", "");
                    handleOnChange("objek", "");
                    handleOnChange("kodeRekEkonomi", kodeKelompok);
                    setSelectedKelompokId(k.id);
                    setKodeEkoError("");
                  }
                }}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Jenis"
                options={jenisOptions}
                value={formData.jenis}
                onChange={(val) => {
                  if (!val) {
                    if (formData.kelompok) {
                      const k = kelompokData.find((x) => x.uraian === formData.kelompok);
                      const kodeKelompok = k ? ekoFormat(ekoParse(k.full_code).slice(0, 2)) : "";
                      handleOnChange("jenis", "");
                      handleOnChange("objek", "");
                      handleOnChange("kodeRekEkonomi", kodeKelompok);
                    } else {
                      handleOnChange("jenis", "");
                      handleOnChange("objek", "");
                      handleOnChange("kodeRekEkonomi", "");
                    }
                    setKodeEkoError("");
                    return;
                  }
                  const j = jenisData.find((x) => x.uraian === val);
                  if (j) {
                    const kodeJenis = ekoFormat(ekoParse(j.full_code).slice(0, 3));
                    handleOnChange("jenis", val);
                    handleOnChange("objek", "");
                    handleOnChange("kodeRekEkonomi", kodeJenis);
                    setSelectedJenisId(j.id);
                    setKodeEkoError("");
                  }
                }}
                disabled={!selectedKelompokId}
              />
            </div>
            <div className="w-[27.5%] min-w-[180px]">
              <FormDropdown
                label="Objek"
                options={objekOptions}
                value={formData.objek}
                onChange={(val) => {
                  if (!val) {
                    if (formData.jenis) {
                      const j = jenisData.find((x) => x.uraian === formData.jenis);
                      const kodeJenis = j ? ekoFormat(ekoParse(j.full_code).slice(0, 3)) : "";
                      handleOnChange("objek", "");
                      handleOnChange("kodeRekEkonomi", kodeJenis);
                    } else {
                      handleOnChange("objek", "");
                    }
                    setKodeEkoError("");
                    return;
                  }
                  const o = objekData.find((x) => x.uraian === val);
                  if (o) {
                    handleOnChange("objek", val);
                    handleOnChange("kodeRekEkonomi", formatEkoFromFullCode(o.full_code));
                    setKodeEkoError("");
                  }
                }}
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
                  if (!val) {
                    handleOnChange("bidang", "");
                    handleOnChange("subBidang", "");
                    handleOnChange("kegiatan", "");
                    handleOnChange("kodeRekBidang", "");
                    setKodeRekError("");
                    return;
                  }
                  const selectedBidang = bidangData.find((b) => b.uraian === val);
                  if (selectedBidang) {
                    const parts = selectedBidang.full_code.replace(/\./g, " ").trim().split(/\s+/);
                    const formattedCode = `${parseInt(parts[0])}`;
                    handleOnChange("bidang", val);
                    handleOnChange("subBidang", "");
                    handleOnChange("kegiatan", "");
                    handleOnChange("kodeRekBidang", formattedCode);
                    setSelectedBidangId(selectedBidang.id);
                    setKodeRekError("");
                  }
                }}
              />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Sub-Bidang"
                options={subBidangOptions}
                value={formData.subBidang}
                onChange={(val) => {
                  if (!val) {
                    if (formData.bidang) {
                      const selectedBidang = bidangData.find((b) => b.uraian === formData.bidang);
                      if (selectedBidang) {
                        const parts = selectedBidang.full_code.replace(/\./g, " ").trim().split(/\s+/);
                        const formattedCode = `${parseInt(parts[0])}`;
                        handleOnChange("subBidang", "");
                        handleOnChange("kegiatan", "");
                        handleOnChange("kodeRekBidang", formattedCode);
                      }
                    } else {
                      handleOnChange("subBidang", "");
                      handleOnChange("kegiatan", "");
                      handleOnChange("kodeRekBidang", "");
                    }
                    setKodeRekError("");
                    return;
                  }
                  const selectedSubBidang = subBidangData.find((s) => s.uraian === val);
                  if (selectedSubBidang) {
                    const parts = selectedSubBidang.full_code.replace(/\./g, " ").trim().split(/\s+/);
                    const formattedCode = `${parseInt(parts[0])} ${parseInt(parts[1])}`;
                    handleOnChange("subBidang", val);
                    handleOnChange("kegiatan", "");
                    handleOnChange("kodeRekBidang", formattedCode);
                    const selected = subBidangData.find(
                      (item) => item.uraian === val && item.parent_id === selectedBidangId
                    );
                    setSelectedSubBidangId(selected ? selected.id : null);
                    setKodeRekError("");
                  }
                }}
              />
            </div>
            <div className="w-[28.3%] min-w-[180px]">
              <FormDropdown
                label="Kegiatan"
                options={kegiatanOptions}
                value={formData.kegiatan}
                onChange={(val) => {
                  if (!val) {
                    if (formData.subBidang) {
                      const selectedSubBidang = subBidangData.find((s) => s.uraian === formData.subBidang);
                      if (selectedSubBidang) {
                        const parts = selectedSubBidang.full_code.replace(/\./g, " ").trim().split(/\s+/);
                        const formattedCode = `${parseInt(parts[0])} ${parseInt(parts[1])}`;
                        handleOnChange("kegiatan", "");
                        handleOnChange("kodeRekBidang", formattedCode);
                      }
                    } else {
                      handleOnChange("kegiatan", "");
                      handleOnChange("kodeRekBidang", "");
                    }
                    setKodeRekError("");
                    return;
                  }
                  const selectedKegiatan = kegiatanData.find((k) => k.uraian === val);
                  if (selectedKegiatan) {
                    const parts = selectedKegiatan.full_code.replace(/\./g, " ").trim().split(/\s+/);
                    // Handle ranges like '90-99' or regular numbers
                    const kegiatanCode = parts[2].includes('-') ? parts[2] : parts[2].padStart(2, "0");
                    const formattedCode = `${parseInt(parts[0])} ${parseInt(parts[1])} ${kegiatanCode}`;
                    handleOnChange("kegiatan", val);
                    handleOnChange("kodeRekBidang", formattedCode);
                    setKodeRekError("");
                  }
                }}
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
            }}
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
