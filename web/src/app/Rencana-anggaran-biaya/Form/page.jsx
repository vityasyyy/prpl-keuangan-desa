"use client";

import { useEffect, useState } from "react";
import Button from "@/components/dpa/button";
import Toggle from "@/components/dpa/toggle";
import { DateInput, TextInput, NumberInput, DropdownInput } from "@/components/dpa/formInput";
import ToastNotification from "@/components/dpa/toastNotification";
import { Trash, Floppy, Cross } from "@/components/dpa/icons";
import LogTable from "@/components/dpa/logTable";
import { z } from "zod";

export default function RencanaAnggaranBiayaForm() {
  const [formData, setFormData] = useState({
    waktuMulai: "",
    waktuSelesai: "",
    norek: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    uraian: "",
    volume: "",
    satuan: "",
    hargaSatuan: "",
    jumlah: "",
  });

  const formSchema = z.object({
    waktuMulai: z.string().nonempty("Waktu mulai harus diisi."),
    waktuSelesai: z.string().nonempty("Waktu selesai harus diisi."),
    norek: z.string().nonempty("Kode rekening harus diisi."),
    bidang: z.string().nonempty("Bidang harus dipilih."),
    subBidang: z.string().nonempty("Sub-bidang harus dipilih."),
    kegiatan: z.string().nonempty("Kegiatan harus dipilih."),
    uraian: z.string().nonempty("Uraian harus diisi."),
    volume: z.string().nonempty("Volume harus diisi."),
    satuan: z.string().nonempty("Satuan harus diisi."),
    hargaSatuan: z.string().nonempty("Harga satuan harus diisi."),
  });

  const [hasSavedDetail, setHasSavedDetail] = useState(false);
  const [onToggle, setOnToggle] = useState(false);
  const [error, setError] = useState({});
  const [toast, setToast] = useState({ message: "", type: "", visible: false });

  const dummyBidang = [
    { option: "Bidang 1", value: "bidang_1" },
    { option: "Bidang 2", value: "bidang_2" },
  ];
  const dummySubBidang = [
    { option: "Sub-Bidang 1", value: "sub_bidang_1" },
    { option: "Sub-Bidang 2", value: "sub_bidang_2" },
  ];
  const dummyKegiatan = [
    { option: "Kegiatan 1", value: "kegiatan_1" },
    { option: "Kegiatan 2", value: "kegiatan_2" },
  ];

  const dummyLogLine = [
    {
      norek: "111111",
      uraian: "item 1",
      volume: "5",
      satuan: "pcs",
      hargaSatuan: "50000",
      jumlah: "25000",
    },
    {
      norek: "222222",
      uraian: "item 2",
      volume: "3",
      satuan: "pcs",
      hargaSatuan: "75000",
      jumlah: "225000",
    },
  ];

  const handleOnChange = (field, value) => {
    setError((prev) => ({ ...prev, [field]: "" }));
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCalculateJumlah = () => {
    const vol = parseFloat(formData.volume) || 0;
    const harga = parseFloat(formData.hargaSatuan) || 0;
    setFormData((prev) => ({ ...prev, jumlah: vol * harga }));
  };

  const handleSimpanDetail = (e) => {
    e.preventDefault();
    setHasSavedDetail(true);
    try {
      formSchema
        .pick({
          waktuMulai: true,
          waktuSelesai: true,
          norek: true,
          bidang: true,
          subBidang: true,
          kegiatan: true,
        })
        .parse(formData);
      // Logic untuk nyimpen detail
      //{fungsi simpan detail}
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setError(fieldErrors);
      }
    }
  };

  const handleHapus = (e) => {
    e.preventDefault;
    setFormData((prev) => ({
      ...prev,
      uraian: "",
      volume: "",
      satuan: "",
      hargaSatuan: "",
      jumlah: 0,
    }));
  };

  const handleSimpanRincian = (e) => {
    e.preventDefault();
    try {
      formSchema.parse(formData);
      //Handle Simpan Rincian di sini
      //{fngsi simpan rincian}
      setToast({ message: "Rincian berhasil disimpan!", type: "success", visible: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.issues.forEach((error) => {
          fieldErrors[error.path[0]] = error.message;
        });
        setError(fieldErrors);
      }
    }
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
  }, [formData.volume, formData.hargaSatuan]);

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
                  <div className="flex-1">
                    <DateInput
                      value={formData.waktuMulai}
                      onChange={(value) => {
                        handleOnChange("waktuMulai", value);
                      }}
                    />
                    {error.waktuMulai && (
                      <p className="mt-1 text-sm text-red-600">{error.waktuMulai}</p>
                    )}
                  </div>
                  <p className="w-9 text-center font-normal text-black">s.d.</p>
                  <div className="flex-1">
                    <DateInput
                      value={formData.waktuSelesai}
                      onChange={(value) => {
                        handleOnChange("waktuSelesai", value);
                      }}
                    />
                    {error.waktuSelesai && (
                      <p className="mt-1 text-sm text-red-600">{error.waktuSelesai}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="flex gap-2">
                  <div className="w-full flex-1">
                    <TextInput
                      placeholder="Kode Rekening"
                      value={formData.norek}
                      onChange={(value) => handleOnChange("norek", value)}
                    />
                    {error.norek && <p className="mt-1 text-sm text-red-600">{error.norek}</p>}
                  </div>
                  <div className="w-full flex-2">
                    <DropdownInput
                      label="Bidang"
                      options={dummyBidang.map((item) => item.option)}
                      value={formData.bidang}
                      onChange={(value) => handleOnChange("bidang", value)}
                    />
                    {error.bidang && <p className="mt-1 text-sm text-red-600">{error.bidang}</p>}
                  </div>
                  <div className="w-full flex-2">
                    <DropdownInput
                      label="Sub-Bidang"
                      options={dummySubBidang.map((item) => item.option)}
                      value={formData.subBidang}
                      onChange={(value) => handleOnChange("subBidang", value)}
                    />
                    {error.subBidang && (
                      <p className="mt-1 text-sm text-red-600">{error.subBidang}</p>
                    )}
                  </div>
                  <div className="w-full flex-2">
                    <DropdownInput
                      label="Kegiatan"
                      options={dummyKegiatan.map((item) => item.option)}
                      value={formData.kegiatan}
                      onChange={(value) => handleOnChange("kegiatan", value)}
                    />
                    {error.kegiatan && (
                      <p className="mt-1 text-sm text-red-600">{error.kegiatan}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" className="mt-4" onClick={handleSimpanDetail}>
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
              <h2 className="font-normal text-black">Rincian Pendanaan</h2>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">Uraian</label>
                <TextInput
                  placeholder="Rincian Kebutuhan dalam Kegiatan"
                  value={formData.uraian}
                  onChange={(e) => handleOnChange("uraian", e)}
                />
                {error.uraian && <p className="mt-1 text-sm text-red-600">{error.uraian}</p>}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Volume</label>
                <TextInput
                  placeholder="Jumlah Orang / Barang"
                  prefix="Jml"
                  value={formData.volume}
                  onChange={(e) => handleOnChange("volume", e)}
                />
                {error.volume && <p className="mt-1 text-sm text-red-600">{error.volume}</p>}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Satuan</label>
                <TextInput
                  placeholder="Satuan yang Digunakan"
                  value={formData.satuan}
                  onChange={(e) => handleOnChange("satuan", e)}
                />
                {error.satuan && <p className="mt-1 text-sm text-red-600">{error.satuan}</p>}
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Harga Satuan</label>
                <NumberInput
                  placeholder="Harga Satuan Besaran Membayar Orang / Barang"
                  value={formData.hargaSatuan}
                  onChange={(e) => handleOnChange("hargaSatuan", e)}
                />
                {error.hargaSatuan && (
                  <p className="mt-1 text-sm text-red-600">{error.hargaSatuan}</p>
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
                  Simpan
                  <Floppy width={16} height={16} />
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      {dummyLogLine && <LogTable logData={dummyLogLine} />}
    </main>
  );
}
