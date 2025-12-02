"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BreadCrumb from "@/components/breadCrumb";
import Button from "@/components/button";
import FormDropdown from "@/components/formDropdown";
import { TextInput } from "@/components/formInput";
import { Trash, Floppy, ToggleLeft, ToggleRight } from "@/components/icons";

export default function InputDraftPenjabaran() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get id from query if editing
  const rincian_id = searchParams.get("rincian_id"); // Get rincian_id jika menambah penjabaran
  const [parentItem, setParentItem] = useState(null);
  const [parentItemUraian, setParentItemUraian] = useState("");
  const [kodeEkonomiMap, setKodeEkonomiMap] = useState({});
  const [kodeFungsiMap, setKodeFungsiMap] = useState({});
  const [loading, setLoading] = useState(false);
  const sumberDanaOptions = ["PBH", "DDS", "ADD", "DLL", "PBP"];
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

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
    rincian_id: rincian_id || null,
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
    volumeOutput: "",
    volumeInput: "",
    satuanOutput: "",
    satuanInput: "",
  });

  // Load parent item info jika ada rincian_id
  useEffect(() => {
    if (rincian_id) {
      // Fetch parent item from API
      const fetchParentItem = async () => {
        try {
          const res = await fetch(`${API}/draft/rincian/${rincian_id}`);
          if (!res.ok) throw new Error("Failed to fetch parent item");
          const result = await res.json();
          if (result.success && result.data) {
            setParentItem(result.data);
            
            // Fetch kode ekonomi dan fungsi untuk mendapatkan uraian
            const [kodeEkonomiRes, kodeFungsiRes] = await Promise.all([
              fetch(`${API}/kode-ekonomi`),
              fetch(`${API}/kode-fungsi`)
            ]);
            
            if (kodeEkonomiRes.ok && kodeFungsiRes.ok) {
              const kodeEkonomiData = await kodeEkonomiRes.json();
              const kodeFungsiData = await kodeFungsiRes.json();
              
              // Create maps
              const ekoMap = {};
              kodeEkonomiData.forEach((item) => {
                ekoMap[item.id] = item;
              });
              setKodeEkonomiMap(ekoMap);
              
              const fungsiMap = {};
              kodeFungsiData.forEach((item) => {
                fungsiMap[item.id] = item;
              });
              setKodeFungsiMap(fungsiMap);
              
              // Find uraian - prioritaskan ekonomi (child terakhir)
              const ekonomiInfo = ekoMap[result.data.kode_ekonomi_id];
              const fungsiInfo = fungsiMap[result.data.kode_fungsi_id];
              const uraian = ekonomiInfo?.uraian || fungsiInfo?.uraian || "Tidak ada uraian";
              
              setParentItemUraian(uraian);
            }
          }
        } catch (error) {
          console.error("Error fetching parent item:", error);
        }
      };
      fetchParentItem();
    }
  }, [rincian_id, API]);

  // ====== PARSING & FORMATTING UTILITIES (dari InputDraftAPBDes) ======
  
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
          return "Range objek harus format DD-DD (contoh: 90-99)";
        }
      } else if (p[3].length > 2) {
        return "Objek (DD) max 2 digit";
      }
    }
    return "";
  };

  // Format dari full_code API (bisa bertitik) → spasi
  const formatEkoFromFullCode = (full) => ekoFormat(ekoParse(full));

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
          return "Range kegiatan harus format xx-xx (contoh: 90-99)";
        }
      } else if (parts[2].length > 2) {
        return "Kode kegiatan max 2 digit";
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
          return part;
        }
        return part.padStart(2, "0");
      }
      return parseInt(part);
    });
    return formattedParts.join(" ");
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
        kelompokData.length > 0 && jenisData.length > 0 && objekData.length > 0) {
      // Fetch existing penjabaran data from API
      const fetchExistingData = async () => {
        try {
          setIsLoadingEditData(true);
          
          const res = await fetch(`${API}/draft/penjabaran/${id}`);
          if (!res.ok) throw new Error("Failed to fetch penjabaran data");
          const existing = await res.json();
          
          console.log("📝 Loading penjabaran edit data:", existing);
          
          if (existing) {
            // Find hierarchy items for ekonomi
            let akunItem = null, kelompokItem = null, jenisItem = null, objekItem = null;
            
            if (existing.kode_ekonomi_id) {
              // Try to find the exact item in all ekonomi levels
              const exactEkonomiItem = akunData.find(a => a.id === existing.kode_ekonomi_id)
                || kelompokData.find(k => k.id === existing.kode_ekonomi_id)
                || jenisData.find(j => j.id === existing.kode_ekonomi_id)
                || objekData.find(o => o.id === existing.kode_ekonomi_id);
              
              console.log("🔍 Exact ekonomi item:", exactEkonomiItem);
              
              if (exactEkonomiItem) {
                // Determine which level it is and build hierarchy
                if (objekData.some(o => o.id === exactEkonomiItem.id)) {
                  // It's an objek (level 4)
                  objekItem = exactEkonomiItem;
                  const jenis = jenisData.find(j => String(j.id) === String(objekItem.parent_id));
                  if (jenis) {
                    jenisItem = jenis;
                    const kelompok = kelompokData.find(k => String(k.id) === String(jenis.parent_id));
                    if (kelompok) {
                      kelompokItem = kelompok;
                      akunItem = akunData.find(a => String(a.id) === String(kelompok.parent_id));
                    }
                  }
                } else if (jenisData.some(j => j.id === exactEkonomiItem.id)) {
                  // It's a jenis (level 3)
                  jenisItem = exactEkonomiItem;
                  const kelompok = kelompokData.find(k => String(k.id) === String(jenisItem.parent_id));
                  if (kelompok) {
                    kelompokItem = kelompok;
                    akunItem = akunData.find(a => String(a.id) === String(kelompok.parent_id));
                  }
                } else if (kelompokData.some(k => k.id === exactEkonomiItem.id)) {
                  // It's a kelompok (level 2)
                  kelompokItem = exactEkonomiItem;
                  akunItem = akunData.find(a => String(a.id) === String(kelompokItem.parent_id));
                } else {
                  // It's an akun (level 1)
                  akunItem = exactEkonomiItem;
                }
              }
            }
            
            // Find hierarchy items for fungsi
            let bidangItem = null, subBidangItem = null, kegiatanItem = null;
            
            if (existing.kode_fungsi_id) {
              const exactFungsiItem = bidangData.find(b => b.id === existing.kode_fungsi_id)
                || subBidangData.find(s => s.id === existing.kode_fungsi_id)
                || kegiatanData.find(k => k.id === existing.kode_fungsi_id);
              
              console.log("🔍 Exact fungsi item:", exactFungsiItem);
              
              if (exactFungsiItem) {
                if (kegiatanData.some(k => k.id === exactFungsiItem.id)) {
                  // It's a kegiatan (level 3)
                  kegiatanItem = exactFungsiItem;
                  const subBidang = subBidangData.find(s => String(s.id) === String(kegiatanItem.parent_id));
                  if (subBidang) {
                    subBidangItem = subBidang;
                    bidangItem = bidangData.find(b => String(b.id) === String(subBidang.parent_id));
                  }
                } else if (subBidangData.some(s => s.id === exactFungsiItem.id)) {
                  // It's a sub-bidang (level 2)
                  subBidangItem = exactFungsiItem;
                  bidangItem = bidangData.find(b => String(b.id) === String(subBidangItem.parent_id));
                } else {
                  // It's a bidang (level 1)
                  bidangItem = exactFungsiItem;
                }
              }
            }
            
            console.log("📊 Found hierarchy:", { 
              akun: akunItem?.uraian, 
              kelompok: kelompokItem?.uraian,
              jenis: jenisItem?.uraian,
              objek: objekItem?.uraian,
              bidang: bidangItem?.uraian,
              subBidang: subBidangItem?.uraian,
              kegiatan: kegiatanItem?.uraian
            });
            
            // Set all IDs first (this triggers filtering in useEffects)
            if (akunItem) setSelectedAkunId(akunItem.id);
            if (kelompokItem) setSelectedKelompokId(kelompokItem.id);
            if (jenisItem) setSelectedJenisId(jenisItem.id);
            if (bidangItem) setSelectedBidangId(bidangItem.id);
            if (subBidangItem) setSelectedSubBidangId(subBidangItem.id);
            
            // Build kode rek strings
            const kodeRekEkonomi = objekItem?.full_code || jenisItem?.full_code || kelompokItem?.full_code || akunItem?.full_code || "";
            const kodeRekBidang = kegiatanItem?.full_code || subBidangItem?.full_code || bidangItem?.full_code || "";
            
            // Format anggaran - ensure integer display
            const anggaranValue = existing.jumlah_anggaran && existing.jumlah_anggaran > 0 
              ? String(Math.floor(existing.jumlah_anggaran))
              : "";
            
            console.log("💰 Setting anggaran:", existing.jumlah_anggaran, "→", anggaranValue);
            
            // Set form data with all values
            setFormData({
              id: existing.id,
              rincian_id: existing.rincian_id,
              kodeRekEkonomi: kodeRekEkonomi.replace(/\./g, " "),
              pendapatanBelanja: akunItem?.uraian || "",
              kelompok: kelompokItem?.uraian || "",
              jenis: jenisItem?.uraian || "",
              objek: objekItem?.uraian || "",
              kodeRekBidang: kodeRekBidang.replace(/\./g, " "),
              bidang: bidangItem?.uraian || "",
              subBidang: subBidangItem?.uraian || "",
              kegiatan: kegiatanItem?.uraian || "",
              anggaran: anggaranValue,
              sumberDana: existing.sumber_dana || "",
              volumeOutput: existing.volume || "",
              volumeInput: existing.volume || "",
              satuanOutput: existing.satuan || "",
              satuanInput: existing.satuan || "",
            });
            
            // Give time for filtering to complete, then disable loading flag
            setTimeout(() => {
              setIsLoadingEditData(false);
            }, 100);
          }
        } catch (error) {
          console.error("Error fetching existing data:", error);
          alert(`Gagal memuat data: ${error.message}`);
          setIsLoadingEditData(false);
        }
      };
      fetchExistingData();
    }
  }, [id, akunData, bidangData, subBidangData, kelompokData, jenisData, objekData, kegiatanData, API]);

  const handleOnChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle Kode Rek Ekonomi change dengan parsing logic (dari InputDraftAPBDes)
  const handleKodeRekEkonomiChange = (value) => {
    if (value === formData.kodeRekEkonomi) return;
    
    const err = validateKodeEko(value);
    setKodeEkoError(err);
    handleOnChange("kodeRekEkonomi", value);

    // Jika user menghapus seluruh input kode → reset total dropdown & state
    if (!value || value.trim() === "") {
      handleOnChange("pendapatanBelanja", "");
      handleOnChange("kelompok", "");
      handleOnChange("jenis", "");
      handleOnChange("objek", "");
      setAkunOptions(allAkunOptions);
      setKelompokOptions(allKelompokOptions);
      setJenisOptions(allJenisOptions);
      setObjekOptions(allObjekOptions);
      setSelectedAkunId(null);
      setSelectedKelompokId(null);
      setSelectedJenisId(null);
      return; // Tidak lanjut parsing
    }

    if (!err) {
      const parts = ekoParse(value); // ["A","B","C","DD"]

      // 1) AKUN = token[0]
      if (parts[0] && akunData.length > 0) {
        const matchedAkun = akunData.find((x) => {
          const xParts = ekoParse(x.full_code);
          return xParts[0] === parts[0];
        });
        if (matchedAkun) {
          setAkunOptions([matchedAkun.uraian]);
          handleOnChange("pendapatanBelanja", matchedAkun.uraian);
          setSelectedAkunId(matchedAkun.id);
        }
      }

      // 2) KELOMPOK = token[0..1]
      if (parts.length >= 2 && kelompokData.length > 0) {
        const matchedKelompok = kelompokData.find((x) => {
          const xParts = ekoParse(x.full_code);
          return xParts[0] === parts[0] && xParts[1] === parts[1];
        });
        if (matchedKelompok) {
          setKelompokOptions([matchedKelompok.uraian]);
          handleOnChange("kelompok", matchedKelompok.uraian);
          setSelectedKelompokId(matchedKelompok.id);
        }
      }

      // 3) JENIS = token[0..2]
      if (parts.length >= 3 && jenisData.length > 0) {
        const matchedJenis = jenisData.find((x) => {
          const xParts = ekoParse(x.full_code);
          return xParts[0] === parts[0] && xParts[1] === parts[1] && xParts[2] === parts[2];
        });
        if (matchedJenis) {
          setJenisOptions([matchedJenis.uraian]);
          handleOnChange("jenis", matchedJenis.uraian);
          setSelectedJenisId(matchedJenis.id);
        }
      }

      // 4) OBJEK = token[0..3] (termasuk range seperti 90-99)
      if (parts.length >= 4 && objekData.length > 0) {
        const matchedObjek = objekData.find((x) => {
          const xParts = ekoParse(x.full_code);
          return xParts[0] === parts[0] && xParts[1] === parts[1] && 
                 xParts[2] === parts[2] && xParts[3] === parts[3];
        });
        if (matchedObjek) {
          setObjekOptions([matchedObjek.uraian]);
          handleOnChange("objek", matchedObjek.uraian);
        }
      }

      // Jika kosong total → kosongkan dropdown
      if (parts.length === 0) {
        setAkunOptions(allAkunOptions);
        setKelompokOptions(allKelompokOptions);
        setJenisOptions(allJenisOptions);
        setObjekOptions(allObjekOptions);
      }
    }
  };

  // Handle Kode Rek Bidang change dengan parsing logic (dari InputDraftAPBDes)
  const handleKodeRekBidangChange = (value) => {
    // Hanya proses jika ada perubahan
    if (value === formData.kodeRekBidang) return;
    
    const error = validateKodeRek(value);
    setKodeRekError(error);
    // Update form dengan kode yang diinput
    handleOnChange("kodeRekBidang", value);
    
    // Jika user menghapus seluruh input kode bidang → reset dropdown & state
    if (!value || value.trim() === "") {
      handleOnChange("bidang", "");
      handleOnChange("subBidang", "");
      handleOnChange("kegiatan", "");
      setBidangOptions(allBidangOptions);
      setSubBidangOptions(allSubBidangOptions);
      setKegiatanOptions(allKegiatanOptions);
      setSelectedBidangId(null);
      setSelectedSubBidangId(null);
      return; // Stop lanjut parsing
    }
    
    if (!error) {
      // Format: ubah titik jadi spasi dan trim
      const cleanKode = value.replace(/\./g, " ").trim();
      const parts = cleanKode.split(/\s+/).filter(Boolean);
      
      // Jika kosong total → kosongkan semua dropdown dan selected IDs
      if (parts.length === 0 || !value.trim()) {
        setBidangOptions(allBidangOptions);
        setSubBidangOptions(allSubBidangOptions);
        setKegiatanOptions(allKegiatanOptions);
        setSelectedBidangId(null);
        setSelectedSubBidangId(null);
        return;
      }
      
      if (parts[0]) {
        // 1) BIDANG = token[0]
        const matchedBidang = bidangData.find((b) => {
          const bParts = b.full_code.replace(/\./g, " ").trim().split(/\s+/);
          return bParts[0] === parts[0];
        });
        if (matchedBidang) {
          setBidangOptions([matchedBidang.uraian]);
          handleOnChange("bidang", matchedBidang.uraian);
          setSelectedBidangId(matchedBidang.id);
        }

        // 2) SUB-BIDANG = token[0..1]
        if (parts.length >= 2) {
          const matchedSubBidang = subBidangData.find((s) => {
            const sParts = s.full_code.replace(/\./g, " ").trim().split(/\s+/);
            return sParts[0] === parts[0] && sParts[1] === parts[1];
          });
          if (matchedSubBidang) {
            setSubBidangOptions([matchedSubBidang.uraian]);
            handleOnChange("subBidang", matchedSubBidang.uraian);
            setSelectedSubBidangId(matchedSubBidang.id);
          }
        }

        // 3) KEGIATAN = token[0..2] (termasuk range seperti 90-99)
        if (parts.length >= 3) {
          const matchedKegiatan = kegiatanData.find((k) => {
            const kParts = k.full_code.replace(/\./g, " ").trim().split(/\s+/);
            return kParts[0] === parts[0] && kParts[1] === parts[1] && kParts[2] === parts[2];
          });
          if (matchedKegiatan) {
            setKegiatanOptions([matchedKegiatan.uraian]);
            handleOnChange("kegiatan", matchedKegiatan.uraian);
          }
        }
      }
    }
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Jika ada rincian_id, simpan penjabaran
      if (rincian_id) {
        // Prepare payload untuk API
        const payload = {
          kode_ekonomi_id: formData.kodeRekEkonomi, // API will handle full_code conversion
          kode_fungsi_id: formData.kodeRekBidang, // API will handle full_code conversion
          jumlah_anggaran: sanitizeNumber(formData.anggaran),
          volume_output: formData.volumeOutput,
          volume_input: formData.volumeInput,
          satuan_output: formData.satuanOutput,
          satuan_input: formData.satuanInput,
          sumber_dana: formData.sumberDana || null,
        };

        let res;
        if (id) {
          // mode edit penjabaran
          res = await fetch(`${API}/draft/penjabaran/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          // mode tambah baru penjabaran - POST dengan rincian_id sebagai path param
          res = await fetch(`${API}/draft/penjabaran/${rincian_id}/penjabaran`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Gagal menyimpan penjabaran");
        }

        const result = await res.json();
        alert(id ? "✅ Data penjabaran berhasil diperbarui!" : "✅ Data penjabaran berhasil disimpan!");

        if (!buatLagi) {
          router.push("/APBDes/output-draft-penjabaran");
        } else {
          setFormData({
            id: Date.now(),
            rincian_id: rincian_id,
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
            volumeOutput: "",
            volumeInput: "",
            satuanOutput: "",
            satuanInput: "",
          });
        }
      } else {
        // Jika tidak ada rincian_id, simpan ke draft rincian (not penjabaran)
        alert("⚠️ Fitur ini untuk penjabaran item. Silakan gunakan Input Draft APBDes untuk rincian baru.");
      }
    } catch (error) {
      console.error("Error saving penjabaran:", error);
      alert(`❌ Gagal menyimpan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Hapus data + konfirmasi
  const handleHapus = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Apakah Anda yakin ingin menghapus data ini?"
    );

    if (!confirmDelete) return;

    if (id) {
      setLoading(true);
      try {
        const res = await fetch(`${API}/draft/penjabaran/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Gagal menghapus data");
        }

        alert("🗑️ Data penjabaran berhasil dihapus!");
        router.push("/APBDes/output-draft-penjabaran");
      } catch (error) {
        console.error("Error deleting penjabaran:", error);
        alert(`❌ Gagal menghapus: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Reset form jika tidak ada id (mode tambah)
      setFormData({
        id: Date.now(),
        rincian_id: rincian_id || null,
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
        volumeOutput: "",
        volumeInput: "",
        satuanOutput: "",
        satuanInput: "",
      });
      alert("🧹 Form dikosongkan");
    }
  };

  return (
    <main className="min-h-screen bg-white px-16 py-8">
      <BreadCrumb category="APBDes" title="Input Draft Penjabaran" />

      <h1 className="mb-6 text-base font-semibold text-black">
        {id ? "Edit Data Penjabaran" : rincian_id ? "Tambah Penjabaran Item" : "Input Data Penjabaran"}
      </h1>

      {/* Tampilkan info parent item jika menambah penjabaran */}
      {parentItem && (
        <div className="mb-6 rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">
            📋 Menambahkan penjabaran untuk:
          </p>
          <p className="text-sm text-blue-800 mt-1">
            <span className="font-semibold">{parentItemUraian || "Loading..."}</span>
            {" - "}
            <span>Rp{Number(parentItem.jumlah_anggaran || 0).toLocaleString("id-ID", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      )}

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
                    // Reset semua jika kosong
                    handleOnChange("pendapatanBelanja", "");
                    handleOnChange("kelompok", "");
                    handleOnChange("jenis", "");
                    handleOnChange("objek", "");
                    handleOnChange("kodeRekEkonomi", "");
                    setSelectedAkunId(null);
                    setSelectedKelompokId(null);
                    setSelectedJenisId(null);
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
                    setSelectedKelompokId(null);
                    setSelectedJenisId(null);
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
                    setSelectedKelompokId(null);
                    setSelectedJenisId(null);
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
                    setSelectedJenisId(null);
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
                    setSelectedJenisId(null);
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
                    setSelectedBidangId(null);
                    setSelectedSubBidangId(null);
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
                    setSelectedSubBidangId(null);
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
                    setSelectedSubBidangId(null);
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
                    setSelectedSubBidangId(selectedSubBidang.id);
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

      {/* ===== KELUARAN / OUTPUT ===== */}
      {formData.pendapatanBelanja.toLowerCase().includes("belanja") && (
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
      )}

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

        {!formData.pendapatanBelanja.toLowerCase().includes("pendapatan") && 
         !formData.pendapatanBelanja.toLowerCase().includes("pembiayaan") && (
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
        )}
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

          <Button variant="primary" onClick={handleSimpan} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
            <Floppy width={16} height={16} />
          </Button>
        </div>
      </div>
    </main>
  );
}