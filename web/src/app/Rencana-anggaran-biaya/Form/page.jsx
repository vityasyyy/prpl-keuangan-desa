"use client";

import { useEffect, useState, useRef } from "react";
import Button from "@/components/dpa/button";
import FormDropdown from "@/components/dpa/formDropdown";
import { DateInput, TextInput } from "@/components/dpa/formInput";
import { Trash, Floppy } from "@/components/dpa/icons";

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

  const [hasSavedDetail, setHasSavedDetail] = useState(false);

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
    // Logic untuk nyimpen detail
  };

  const handleHapus = (e) => {
    e.preventDefault;
    setFormData((prev) => ({
      ...prev,
      uraian: "",
      volume: "",
      satuan: "",
      hargaSatuan: "",
      jumlah: "",
    }));
  };

  const handleSimpanRincian = (e) => {
    e.preventDefault();
    // Logic untuk nyimpen rincian
  };

  useEffect(() => {
    handleCalculateJumlah();
  }, [formData.volume, formData.hargaSatuan]);

  return (
    <main className="min-h-screen bg-white">
      <div className="mb-6">
        <h1 className="text-base font-semibold text-black">Input Data Rencana Anggaran Biaya</h1>
      </div>
      <div className="mb-8">
        <form onSubmit={handleSimpanDetail}>
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
                  </div>
                  <p className="w-9 text-center font-normal text-black">s.d.</p>
                  <div className="flex-1">
                    <DateInput
                      value={formData.waktuSelesai}
                      onChange={(value) => {
                        handleOnChange("waktuSelesai", value);
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full flex-1 rounded-md border border-[#D4D4D8] px-3 py-2"
                    placeholder="Kode Rekening"
                    onChange={(e) => handleOnChange("norek", e.target.value)}
                  ></input>
                  <div className="w-full flex-2">
                    <FormDropdown
                      label="Bidang"
                      options={dummyBidang.map((item) => item.option)}
                      value={formData.bidang}
                      onChange={(value) => handleOnChange("bidang", value)}
                    />
                  </div>
                  <div className="w-full flex-2">
                    <FormDropdown
                      label="Sub-Bidang"
                      options={dummySubBidang.map((item) => item.option)}
                      value={formData.subBidang}
                      onChange={(value) => handleOnChange("subBidang", value)}
                    />
                  </div>
                  <div className="w-full flex-2">
                    <FormDropdown
                      label="Kegiatan"
                      options={dummyKegiatan.map((item) => item.option)}
                      value={formData.kegiatan}
                      onChange={(value) => handleOnChange("kegiatan", value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" className="mt-4">
              Simpan Detail
              <Floppy width={16} height={16} />
            </Button>
          </div>
        </form>
      </div>
      {hasSavedDetail && (
        <div className="text-[#011829]">
          <form onSubmit={handleSimpanRincian}>
            <div className="space-y-5 rounded-2xl border-[0.5px] border-[#4B5565] px-5 py-8">
              <h2 className="font-normal text-black">Rincian Pendanaan</h2>
              <div className="space-y-2">
                <label className="block font-medium text-[#011829]">Uraian</label>
                <TextInput
                  placeholder="Rincian Kebutuhan dalam Kegiatan"
                  value={formData.uraian}
                  onChange={(e) => handleOnChange("uraian", e)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Volume</label>
                <TextInput
                  placeholder="Jumlah Orang / Barang"
                  prefix="Jml"
                  value={formData.volume}
                  onChange={(e) => handleOnChange("volume", e)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Satuan</label>
                <TextInput
                  placeholder="Satuan yang Digunakan"
                  value={formData.satuan}
                  onChange={(e) => handleOnChange("satuan", e)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Harga Satuan</label>
                <TextInput
                  placeholder="Harga Satuan Besaran Membayar Orang / Barang"
                  prefix="Rp"
                  value={formData.hargaSatuan}
                  onChange={(e) => handleOnChange("hargaSatuan", e)}
                />
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Jumlah (Auto)</label>
                <TextInput prefix="Rp" auto={true}>
                  {formData.jumlah}
                </TextInput>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="danger" onClick={handleHapus} type="reset" className="mt-4">
                Hapus
                <Trash width={16} height={16} />
              </Button>
              <Button variant="primary" type="submit" className="mt-4">
                Simpan Rincian
                <Floppy width={16} height={16} />
              </Button>
            </div>
          </form>
        </div>
      )}
      {dummyLogLine && (
        <div className="mt-20 rounded-2xl border border-[#D4D4D8] bg-white px-4 py-2 shadow-sm">
          <div className="border-[#D4D4D8] px-6 py-4">
            <h2 className="text-lg font-semibold text-[#011829]">Log Pengisian RAB</h2>
          </div>
          <div className="text-center text-sm text-gray-700">
            <div className="flex rounded-t-2xl border-b-1 border-gray-400 bg-gray-100 px-6 py-3 font-medium text-gray-700">
              <div className="w-1/6 text-left">No. Rek</div>
              <div className="w-3/6">Uraian</div>
              <div className="w-1/6">Volume</div>
              <div className="w-1/6">Satuan</div>
              <div className="w-1/6">Harga Satuan</div>
              <div className="w-1/6">Jumlah</div>
            </div>
            {dummyLogLine.length > 0 ? (
              dummyLogLine.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center border-b border-[#D4D4D8] bg-white px-6 py-3 transition hover:bg-gray-100`}
                >
                  <div className="w-1/6 text-left text-gray-800">{item.norek}</div>
                  <div className="w-3/6 text-gray-800">{item.uraian}</div>
                  <div className="w-1/6 text-gray-700">{item.volume}</div>
                  <div className="w-1/6 text-gray-700">{item.satuan}</div>
                  <div className="w-1/6 text-gray-800">
                    Rp {Number(item.hargaSatuan).toLocaleString("id-ID")}
                  </div>
                  <div className="w-1/6 font-medium text-[#011829]">
                    Rp {Number(item.jumlah).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-6 text-center text-gray-500 italic">
                Belum ada data yang diinput.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
