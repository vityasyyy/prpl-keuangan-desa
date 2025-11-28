"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/dpa/button";
import Toggle from "@/components/dpa/toggle";
import { DateInput, TextInput, NumberInput, DropdownInput } from "@/components/dpa/formInput";
import ToastNotification from "@/components/dpa/toastNotification";
import { Trash, Floppy, Cross } from "@/components/dpa/icons";
import LogTable from "@/components/dpa/logTable";
import { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

function RencanaAnggaranBiayaFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    waktuMulai: "",
    waktuSelesai: "",
    kode_ekonomi: "",
    jenis: "",
    uraian1: "",
    uraian2: "",
    kode_fungsi: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    uraian: "",
    volume: "",
    satuan: "",
    harga_satuan: "",
    jumlah: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editLineId, setEditLineId] = useState(null);

  const formSchema = z.object({
    waktuMulai: z.string().nonempty("Waktu mulai harus diisi."),
    waktuSelesai: z.string().nonempty("Waktu selesai harus diisi."),
    kode_fungsi: z.string().nonempty("Kode rekening harus diisi."),
    jenis: z.string().nonempty("Jenis harus dipilih."),
    uraian1: z.string().nonempty("Uraian 1 harus dipilih."),
    uraian2: z.string().nonempty("Uraian 2 harus dipilih."),
    kode_ekonomi: z.string().nonempty("Kode rekening harus diisi."),
    bidang: z.string().nonempty("Bidang harus dipilih."),
    subBidang: z.string().nonempty("Sub-bidang harus dipilih."),
    kegiatan: z.string().nonempty("Kegiatan harus dipilih."),
    uraian: z.string().nonempty("Uraian harus diisi."),
    volume: z.string().nonempty("Volume harus diisi."),
    satuan: z.string().nonempty("Satuan harus diisi."),
    harga_satuan: z.string().nonempty("Harga satuan harus diisi."),
  });

  const [akunList, setAkunList] = useState([]);
  const [uraian1List, setUraian1List] = useState([]);
  const [uraian2List, setUraian2List] = useState([]);
  const [selectedKE, setSelectedKE] = useState({
    jenis: "",
    uraian1: "",
    uraian2: "",
  });

  const [bidangList, setBidangList] = useState([]);
  const [subBidangList, setSubBidangList] = useState([]);
  const [kegiatanList, setKegiatanList] = useState([]);
  const [selectedKF, setSelectedKF] = useState({
    bidang: "",
    subBidang: "",
    kegiatan: "",
  });

  const [hasSavedDetail, setHasSavedDetail] = useState(false);
  const [currentRabId, setCurrentRabId] = useState(null);
  const [rabLines, setRabLines] = useState([]);
  const [onToggle, setOnToggle] = useState(false);
  const [error, setError] = useState({});
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  const fetchRABLines = async (rabId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rab/${rabId}/lines`);
      const data = await response.json();
      if (data.success) {
        setRabLines(data.data || []);
        console.log("RAB Lines fetched:", data.data);
      }
    } catch (error) {
      console.error("Error fetching RAB lines:", error);
      setRabLines([]);
    }
  };

  useEffect(() => {
    if (currentRabId) {
      fetchRABLines(currentRabId);
    }
  }, [currentRabId]);

  useEffect(() => {
    const editParam = searchParams.get("edit");
    const dataParam = searchParams.get("data");

    console.log("Search params - edit:", editParam, "data:", dataParam);

    if (editParam && dataParam) {
      try {
        const editData = JSON.parse(decodeURIComponent(dataParam));
        console.log("Edit data received:", editData);
        console.log("kode_fungsi_full:", editData.kode_fungsi_id);
        console.log("kode_ekonomi_full:", editData.kode_ekonomi_id);

        if (!editData || typeof editData !== "object") {
          throw new Error("Invalid edit data");
        }

        setIsEditMode(true);
        setEditLineId(editData.lineId);
        setCurrentRabId(editData.rabId);
        setHasSavedDetail(true);

        const newFormData = {
          waktuMulai: editData.waktuMulai || "",
          waktuSelesai: editData.waktuSelesai || "",
          kode_fungsi: editData.kode_fungsi_id || "",
          kode_ekonomi: editData.kode_ekonomi_id || "",
          uraian: editData.uraian || "",
          volume: editData.volume?.toString() || "",
          satuan: editData.satuan || "",
          harga_satuan: editData.harga_satuan?.toString() || "",
          jumlah: editData.jumlah?.toString() || "",
        };

        setFormData((prev) => {
          const updated = { ...prev, ...newFormData };
          return updated;
        });

        if (editData.kode_ekonomi_id) {
          setSelectedKE((prev) => ({
            ...prev,
            uraian2: editData.kode_ekonomi_id,
          }));
        }

        if (editData.kode_fungsi_id) {
          setSelectedKF((prev) => ({
            ...prev,
            kegiatan: editData.kode_fungsi_id,
          }));
        }

        setToast({
          message: "Mode Edit: Data rincian berhasil dimuat",
          type: "info",
          visible: true,
        });
      } catch (error) {
        console.error("Error parsing edit data:", error);
        setToast({
          message: "Gagal memuat data untuk edit",
          type: "error",
          visible: true,
        });
      }
    }
  }, [searchParams]);

  console.log("Form populated for edit mode:", formData);

  useEffect(() => {
    async function fetchAkun() {
      try {
        const response = await fetch(`${API_BASE_URL}/rab/kode-ekonomi/akun`);
        const data = await response.json();
        console.log("fetchJenis response:", data);
        setAkunList(data.data || []);
      } catch (error) {
        console.error("Error fetching jenis (akun):", error);
        setAkunList([]);
      }
    }
    fetchAkun();
  }, []);

  useEffect(() => {
    const akunId = selectedKE.jenis;

    async function fetchUraian1(akunId) {
      setUraian1List([]);
      try {
        const res = await fetch(`${API_BASE_URL}/rab/kode-ekonomi/akun/${akunId}/kelompok`);
        const data = await res.json();
        data.data.map(async (item) => {
          const response = await fetch(
            `${API_BASE_URL}/rab/kode-ekonomi/kelompok/${item.id}/jenis`
          );
          const jenisData = await response.json();
          setUraian1List((prevList) => [...prevList, ...jenisData.data]);
        });
      } catch (error) {
        console.error("Error fetching uraian1:", error);
        setUraian1List([]);
      }
    }
    if (akunId) {
      fetchUraian1(akunId);
    } else {
      setUraian1List([]);
    }
  }, [selectedKE.jenis]);

  useEffect(() => {
    const jenisId = selectedKE.uraian1;

    async function fetchUraian2(jenisId) {
      setUraian2List([]);
      try {
        const response = await fetch(`${API_BASE_URL}/rab/kode-ekonomi/jenis/${jenisId}/objek`);
        const data = await response.json();
        setUraian2List(data.data || []);
      } catch (error) {
        console.error("Error fetching uraian2:", error);
        setUraian2List([]);
      }
    }
    if (jenisId) {
      fetchUraian2(jenisId);
    } else {
      setUraian2List([]);
    }
  }, [selectedKE.uraian1]);

  useEffect(() => {
    async function fetchBidang() {
      const data = await fetch(`${API_BASE_URL}/rab/kode-rekening/bidang`).then((res) =>
        res.json()
      );
      setBidangList(data.data);
    }
    fetchBidang();
  }, []);

  useEffect(() => {
    const bidangId = selectedKF.bidang;

    async function fetchSubBidang(bidangId) {
      const data = await fetch(
        `${API_BASE_URL}/rab/kode-rekening/bidang/${bidangId}/sub-bidang`
      ).then((res) => res.json());
      setSubBidangList(data.data);
    }
    if (selectedKF.bidang) {
      fetchSubBidang(bidangId);
    }
  }, [selectedKF.bidang]);

  useEffect(() => {
    const subBidangId = selectedKF.subBidang;

    async function fetchKegiatan(subBidangId) {
      const data = await fetch(
        `${API_BASE_URL}/rab/kode-rekening/sub-bidang/${subBidangId}/kegiatan`
      ).then((res) => res.json());
      setKegiatanList(data.data);
    }
    if (selectedKF.subBidang) {
      fetchKegiatan(subBidangId);
    }
  }, [selectedKF.subBidang]);

  const handleKodeChange = (field, value, lists) => {
    setError((prev) => ({ ...prev, [field]: "" }));
    setFormData((prev) => ({ ...prev, [field]: value }));

    const matchedItem = lists
      .flatMap(({ list, type }) => list.map((item) => ({ ...item, type })))
      .find((item) => item.id === value.trim());

    if (matchedItem) handleOnChange(matchedItem.type, matchedItem.label);
  };

  const handleOnChange = (field, value) => {
    setError((prev) => ({ ...prev, [field]: "" }));

    const ekonomiConfig = {
      jenis: {
        list: akunList,
        kodeField: "kode_ekonomi",
        setState: setSelectedKE,
        reset: { jenis: "", uraian1: "", uraian2: "" },
      },
      uraian1: {
        list: uraian1List,
        kodeField: "kode_ekonomi",
        setState: setSelectedKE,
        reset: { uraian1: "", uraian2: "" },
      },
      uraian2: {
        list: uraian2List,
        kodeField: "kode_ekonomi",
        setState: setSelectedKE,
        reset: { uraian2: "" },
      },
    };

    const fungsiConfig = {
      bidang: {
        list: bidangList,
        kodeField: "kode_fungsi",
        setState: setSelectedKF,
        reset: { bidang: "", subBidang: "", kegiatan: "" },
      },
      subBidang: {
        list: subBidangList,
        kodeField: "kode_fungsi",
        setState: setSelectedKF,
        reset: { subBidang: "", kegiatan: "" },
      },
      kegiatan: {
        list: kegiatanList,
        kodeField: "kode_fungsi",
        setState: setSelectedKF,
        reset: { kegiatan: "" },
      },
    };

    const config = { ...ekonomiConfig, ...fungsiConfig }[field];
    if (config) {
      const selectedItem = config.list.find((item) => item.label === value);
      if (selectedItem) {
        const newKode = selectedItem.id;

        setError((prev) => ({ ...prev, [config.kodeField]: "" }));
        config.setState((prev) => ({ ...prev, ...config.reset, [field]: selectedItem.id }));
        setFormData((prev) => ({
          ...prev,
          ...config.reset,
          [field]: value,
          [config.kodeField]: newKode,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getErrorMessage = (field) => {
    if (!error[field]) return null;
    return typeof error[field] === "string" ? error[field] : String(error[field]);
  };

  const handleCalculateJumlah = () => {
    const vol = parseFloat(formData.volume) || 0;
    const harga = parseFloat(formData.harga_satuan) || 0;
    setFormData((prev) => ({ ...prev, jumlah: vol * harga }));
  };

  const handleSimpanDetail = async (e) => {
    e.preventDefault();
    if (isSavingDetail) return;

    setIsSavingDetail(true);
    try {
      formSchema
        .pick({
          waktuMulai: true,
          waktuSelesai: true,
          kode_fungsi: true,
          kode_ekonomi: true,
          bidang: true,
          subBidang: true,
          kegiatan: true,
          jenis: true,
          uraian1: true,
          uraian2: true,
        })
        .parse(formData);

      const rabData = {
        mulai: formData.waktuMulai,
        selesai: formData.waktuSelesai,
        kode_fungsi_id: selectedKF.kegiatan,
        kode_ekonomi_id: selectedKE.uraian2,
      };

      const response = await fetch(`${API_BASE_URL}/rab`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rabData),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentRabId(data.data.id);
        setHasSavedDetail(true);
        setToast({
          message: "Detail RAB berhasil disimpan!",
          type: "success",
          visible: true,
        });
      } else {
        throw new Error(data.error || "Gagal menyimpan detail RAB");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setError(fieldErrors);
      }
      setIsSavingDetail(false);
    }
  };

  const handleHapus = (e) => {
    e.preventDefault;
    setFormData((prev) => ({
      ...prev,
      uraian: "",
      volume: "",
      satuan: "",
      harga_satuan: "",
      jumlah: 0,
    }));
  };

  const handleSimpanRincian = async (e) => {
    e.preventDefault();
    try {
      formSchema
        .pick({ uraian: true, volume: true, satuan: true, harga_satuan: true })
        .parse(formData);

      if (!currentRabId) {
        throw new Error("Detail RAB belum disimpan. Simpan detail terlebih dahulu.");
      }

      const lineData = {
        uraian: formData.uraian.trim(),
        volume: formData.volume,
        satuan: formData.satuan.trim(),
        harga_satuan: formData.harga_satuan,
      };

      console.log("Submitting line data:", lineData);

      const url =
        isEditMode && editLineId
          ? `${API_BASE_URL}/rab/lines/${editLineId}`
          : `${API_BASE_URL}/rab/${currentRabId}/lines`;

      const method = isEditMode && editLineId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lineData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setToast({
          message: isEditMode ? "Rincian berhasil diupdate!" : "Rincian berhasil disimpan!",
          type: "success",
          visible: true,
        });

        setError({});
        await fetchRABLines(currentRabId);

        if (onToggle) {
          setFormData((prev) => ({
            ...prev,
            uraian: "",
            volume: "",
            satuan: "",
            harga_satuan: "",
            jumlah: "",
          }));

          if (isEditMode) {
            setIsEditMode(false);
            setEditLineId(null);
          }
        } else {
          router.push("/Rencana-anggaran-biaya");
          if (isEditMode) {
            setIsEditMode(false);
            setEditLineId(null);
          }
        }
      }
    } catch (err) {}
  };

  const handleToggle = (e) => {
    e.preventDefault();
    setOnToggle(!onToggle);

    setToast({
      message: `Mode buat lagi ${!onToggle ? "aktif" : "nonaktif"}`,
      type: "info",
      visible: true,
    });
  };

  useEffect(() => {
    handleCalculateJumlah();
  }, [formData.volume, formData.harga_satuan]);

  useEffect(() => {
    console.log("FormData changed:", formData);
  }, [formData]);

  console.log("RAB Lines:", rabLines);

  return (
    <main className="min-h-screen bg-white">
      {toast.visible && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <div className="mb-6">
        <h1 className="text-base font-semibold text-black">Input Data Rencana Anggaran Biaya</h1>
      </div>
      <div className="mb-8">
        <form>
          <div className="text-[#011829]">
            <div className="space-y-5 rounded-2xl border-[0.5px] border-[#4B5565] px-5 py-8">
              <h2 className="font-normal text-black">Detail</h2>
              <div className="w-full space-y-2">
                <label className="block font-medium text-[#011829]">Waktu Pelaksanaan</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DateInput
                      value={formData.waktuMulai}
                      onChange={(value) => {
                        handleOnChange("waktuMulai", value);
                      }}
                    />
                    {error.waktuMulai && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("waktuMulai")}
                      </p>
                    )}
                  </div>
                  <p className="w-9 text-center font-normal text-black">s.d.</p>
                  <div className="relative flex-1">
                    <DateInput
                      value={formData.waktuSelesai}
                      onChange={(value) => {
                        handleOnChange("waktuSelesai", value);
                      }}
                    />
                    {error.waktuSelesai && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("waktuSelesai")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">Klasifikasi Ekonomi</label>
                <div className="flex gap-2">
                  <div className="relative w-full flex-1">
                    <TextInput
                      placeholder="Kode Rekening"
                      value={formData.kode_ekonomi}
                      onChange={(value) =>
                        handleKodeChange("kode_ekonomi", value, [
                          { list: akunList, type: "jenis" },
                          { list: uraian1List, type: "uraian1" },
                          { list: uraian2List, type: "uraian2" },
                        ])
                      }
                    />
                    {error.kode_fungsi && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("kode_ekonomi")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Jenis"
                      options={akunList.map((item) => item.label)}
                      value={formData.jenis}
                      onChange={(value) => handleOnChange("jenis", value)}
                    />
                    {error.jenis && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("jenis")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Uraian 1"
                      options={uraian1List.map((item) => item.label)}
                      value={formData.uraian1}
                      onChange={(value) => handleOnChange("uraian1", value)}
                    />
                    {error.uraian1 && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("uraian1")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Uraian 2"
                      options={uraian2List.map((item) => item.label)}
                      value={formData.uraian2}
                      onChange={(value) => handleOnChange("uraian2", value)}
                    />
                    {error.uraian2 && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("uraian2")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="flex gap-2">
                  <div className="relative w-full flex-1">
                    <TextInput
                      placeholder="Kode Rekening"
                      value={formData.kode_fungsi}
                      onChange={(value) =>
                        handleKodeChange("kode_fungsi", value, [
                          { list: bidangList, type: "bidang" },
                          { list: subBidangList, type: "subBidang" },
                          { list: kegiatanList, type: "kegiatan" },
                        ])
                      }
                    />
                    {error.kode_fungsi && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("kode_fungsi")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Bidang"
                      options={bidangList.map((item) => item.label)}
                      value={formData.bidang}
                      onChange={(value) => handleOnChange("bidang", value)}
                    />
                    {error.bidang && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("bidang")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Sub-Bidang"
                      options={subBidangList.map((item) => item.label)}
                      value={formData.subBidang}
                      onChange={(value) => handleOnChange("subBidang", value)}
                    />
                    {error.subBidang && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("subBidang")}
                      </p>
                    )}
                  </div>
                  <div className="relative w-full flex-2">
                    <DropdownInput
                      label="Kegiatan"
                      options={kegiatanList.map((item) => item.label)}
                      value={formData.kegiatan}
                      onChange={(value) => handleOnChange("kegiatan", value)}
                    />
                    {error.kegiatan && (
                      <p className="absolute mt-1 text-sm text-red-600">
                        {getErrorMessage("kegiatan")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              type="submit"
              className="mt-4"
              onClick={handleSimpanDetail}
              disabled={isSavingDetail || isEditMode}
            >
              Tambah Rincian
              <Cross width={16} height={16} />
            </Button>
          </div>
        </form>
      </div>
      {hasSavedDetail && (
        <div className="text-[#011829]">
          <form>
            <div className="space-y-5 rounded-2xl border-[0.5px] border-[#4B5565] px-5 py-8">
              <h2 className="font-normal text-black">
                {isEditMode ? "Edit Rincian Pendanaan" : "Rincian Pendanaan"}
              </h2>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">Uraian</label>
                <TextInput
                  placeholder="Rincian Kebutuhan dalam Kegiatan"
                  value={formData.uraian}
                  onChange={(e) => handleOnChange("uraian", e)}
                />
                {error.uraian && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage("uraian")}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Volume</label>
                <TextInput
                  placeholder="Jumlah Orang / Barang"
                  prefix="Jml"
                  value={formData.volume}
                  onChange={(e) => handleOnChange("volume", e)}
                />
                {error.volume && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage("volume")}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Satuan</label>
                <TextInput
                  placeholder="Satuan yang Digunakan"
                  value={formData.satuan}
                  onChange={(e) => handleOnChange("satuan", e)}
                />
                {error.satuan && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage("satuan")}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Harga Satuan</label>
                <NumberInput
                  placeholder="Harga Satuan Besaran Membayar Orang / Barang"
                  value={formData.harga_satuan}
                  onChange={(e) => handleOnChange("harga_satuan", e)}
                />
                {error.harga_satuan && (
                  <p className="mt-1 text-sm text-red-600">{getErrorMessage("harga_satuan")}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Jumlah (Auto)</label>
                <NumberInput auto={true}>{formData.jumlah}</NumberInput>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="danger" onClick={handleHapus} type="reset" className="mt-4">
                Bersihkan
                <Trash width={16} height={16} />
              </Button>
              <div className="flex items-center gap-x-4">
                <div className="mt-4 flex h-full items-center px-3 py-2">
                  <span className="mr-2 text-gray-700">Buat lagi</span>
                  <Toggle enabled={onToggle} onToggle={(e) => handleToggle(e)} />
                </div>
                <Button
                  variant="primary"
                  type="submit"
                  className="mt-4"
                  onClick={handleSimpanRincian}
                >
                  {isEditMode ? "Update" : "Simpan"}
                  <Floppy width={16} height={16} />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      {rabLines.length > 0 && <LogTable logData={rabLines} />}
    </main>
  );
}

export default function RencanaAnggaranBiayaForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-8">Loading...</div>}>
      <RencanaAnggaranBiayaFormContent />
    </Suspense>
  );
}
