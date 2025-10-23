"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FormInputKasUmum() {
  const [formData, setFormData] = useState({
    tanggal: "",
    kodeRek: "",
    bidang: "",
    subBidang: "",
    kegiatan: "",
    uraian: "",
    pemasukan: "",
    pengeluaran: "",
    nomorBukti: "",
    nettoTransaksi: "",
    buatLagi: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, buatLagi: !prev.buatLagi }));
  };

  const breadcrumbItems = [
    { label: "Penatausahaan", icon: true, active: false },
    { label: "Buku Kas Umum", active: true },
  ];

  const [bidangList, setBidangList] = useState([]);
  const [subBidangList, setSubBidangList] = useState([]);
  const [kegiatanList, setKegiatanList] = useState([]);

  // Ambil daftar bidang
  useEffect(() => {
    async function fetchBidang() {
      try {
        const res = await fetch(`${API_BASE_URL}/kas-umum/bidang`);
        if (!res.ok) throw new Error("Gagal ambil data bidang");
        const data = await res.json();
        setBidangList(data);
      } catch (err) {
        console.error("[fetchBidang]", err);
      }
    }
    fetchBidang();
  }, [API_BASE_URL]);

  // Ambil sub-bidang kalau bidang berubah
  useEffect(() => {
    if (!formData.bidang) return;
    async function fetchSubBidang() {
      try {
        const res = await fetch(`${API_BASE_URL}/kas-umum/sub-bidang?bidangId=${formData.bidang}`);
        const data = await res.json();
        setSubBidangList(data);
      } catch (err) {
        console.error("[fetchSubBidang]", err);
      }
    }
    fetchSubBidang();
  }, [formData.bidang, API_BASE_URL]);

  // Ambil kegiatan kalau sub-bidang berubah
  // Reset kegiatan kalau bidang berubah
  useEffect(() => {
    setKegiatanList([]);
    setFormData((prev) => ({ ...prev, kegiatan: "" }));
  }, [formData.bidang]);

  // Fetch kegiatan kalau sub-bidang berubah
  useEffect(() => {
    if (!formData.subBidang) {
      setKegiatanList([]);
      setFormData((prev) => ({ ...prev, kegiatan: "" }));
      return;
    }

    const fetchKegiatan = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/kas-umum/kegiatan?subBidangId=${formData.subBidang}`
        );
        const data = await res.json();
        setKegiatanList(data);
      } catch (err) {
        console.error("Gagal ambil kegiatan:", err);
      }
    };
    fetchKegiatan();
  }, [formData.subBidang]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-[61px] py-[35px]">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex w-[977px] flex-col items-start gap-5">
          <h1 className="m-0 self-stretch font-['Poppins'] text-base leading-6 font-bold text-black">
            Input Data Kas Umum
          </h1>

          <div className="flex flex-col items-start gap-[29px] self-stretch">
            {/* Detail Section */}
            <div className="flex flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565] px-5 py-[30px]">
              <h2 className="m-0 font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                Detail
              </h2>

              <div className="flex w-[320px] flex-col items-start gap-1.5">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Tanggal
                </label>
                <div className="flex items-center gap-2 self-stretch rounded-lg border border-[#d4d4d8] bg-white px-[14px] py-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M13.3333 1.6665V4.99984M6.66667 1.6665V4.99984M2.5 8.33317H17.5M4.16667 3.33317H15.8333C16.7538 3.33317 17.5 4.07936 17.5 4.99984V16.6665C17.5 17.587 16.7538 18.3332 15.8333 18.3332H4.16667C3.24619 18.3332 2.5 17.587 2.5 16.6665V4.99984C2.5 4.07936 3.24619 3.33317 4.16667 3.33317Z"
                      stroke="#71717A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="text"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YYYY"
                    className="flex-1 border-none bg-transparent font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="flex items-start gap-1.5 self-stretch">
                  <input
                    type="text"
                    name="kodeRek"
                    value={formData.kodeRek}
                    onChange={handleInputChange}
                    placeholder="Kode Rek"
                    className="w-[159px] rounded-lg border border-[#d4d4d8] bg-white px-[14px] py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] outline-none placeholder:text-[#a1a1aa]"
                  />
                  <div className="relative flex flex-1 items-center gap-2 rounded-lg border border-[#d4d4d8] bg-white px-2.5 py-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                    <select
                      name="bidang"
                      value={formData.bidang}
                      onChange={handleInputChange}
                      className="w-[250] cursor-pointer appearance-none border-none bg-transparent pr-6 font-['Inter'] text-base leading-6 font-normal text-[#71717a] outline-none"
                    >
                      <option value="">Bidang</option>
                      {bidangList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.full_code} — {b.uraian}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 h-4 w-4 flex-shrink-0"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                    >
                      <path
                        d="M4.33333 6L8.33333 10L12.3333 6"
                        stroke="#A1A1AA"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="relative flex flex-1 items-center gap-2 rounded-lg border border-[#d4d4d8] bg-white px-2.5 py-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                    <select
                      name="subBidang"
                      value={formData.subBidang}
                      onChange={handleInputChange}
                      className="w-[220] cursor-pointer appearance-none border-none bg-transparent pr-6 font-['Inter'] text-base leading-6 font-normal text-[#71717a] outline-none"
                    >
                      <option value="">Sub-bidang</option>
                      {subBidangList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.full_code} — {b.uraian}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 h-4 w-4 flex-shrink-0"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                    >
                      <path
                        d="M4.66666 6L8.66666 10L12.6667 6"
                        stroke="#A1A1AA"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="relative flex flex-1 items-center gap-2 rounded-lg border border-[#d4d4d8] bg-white px-2.5 py-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                    <select
                      name="kegiatan"
                      value={formData.kegiatan}
                      onChange={handleInputChange}
                      className="w-[215] cursor-pointer appearance-none border-none bg-transparent pr-6 font-['Inter'] text-base leading-6 font-normal text-[#71717a] outline-none"
                    >
                      <option value="">Kegiatan</option>
                      {kegiatanList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.full_code} — {k.uraian}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 h-4 w-4 flex-shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#A1A1AA"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <input
                  type="text"
                  name="uraian"
                  value={formData.uraian}
                  onChange={handleInputChange}
                  placeholder="Uraian (Opsional)"
                  className="flex-1 self-stretch rounded-lg border border-[#d4d4d8] bg-white px-[14px] py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] outline-none placeholder:text-[#a1a1aa]"
                />
              </div>
            </div>

            {/* Arus Dana Section */}
            <div className="flex flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565] px-5 py-[30px]">
              <h2 className="m-0 font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                Arus Dana
              </h2>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Pemasukan
                </label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex items-center justify-between px-3 py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#71717a]">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="pemasukan"
                    value={formData.pemasukan}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex flex-1 items-center gap-2 border-none px-0 py-2.5 pr-[14px] font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Pengeluaran
                </label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex items-center justify-between px-3 py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#71717a]">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="pengeluaran"
                    value={formData.pengeluaran}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex flex-1 items-center gap-2 border-none px-0 py-2.5 pr-[14px] font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>

            {/* Bukti dan Kumulatif Section */}
            <div className="flex flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565] px-5 py-[30px]">
              <h2 className="m-0 font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                Bukti dan Kumulatif
              </h2>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Nomor Bukti
                </label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex items-center justify-between px-3 py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#71717a]">
                    No
                  </div>
                  <input
                    type="text"
                    name="nomorBukti"
                    value={formData.nomorBukti}
                    onChange={handleInputChange}
                    placeholder="12345"
                    className="flex flex-1 items-center gap-2 border-none px-0 py-2.5 pr-[14px] font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
                  Netto Transaksi
                </label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex items-center justify-between px-3 py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#71717a]">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="nettoTransaksi"
                    value={formData.nettoTransaksi}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex flex-1 items-center gap-2 border-none px-0 py-2.5 pr-[14px] font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Saldo Field */}
          <div className="flex flex-col items-start gap-1.5 self-stretch">
            <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
              Saldo (Automated)
            </label>
            <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
              <div className="flex items-center justify-between px-3 py-2.5 font-['Inter'] text-base leading-6 font-normal text-[#71717a]">
                Rp
              </div>
              <input
                type="text"
                value="100.000.000,00"
                readOnly
                className="flex flex-1 items-center gap-2 border-none px-0 py-2.5 pr-[14px] font-['Inter'] text-base leading-6 font-normal text-[#011829] outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between self-stretch">
            <Button
              variant="danger"
              className="px-[18px] py-2.5"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2.5 5.00033H4.16667M4.16667 5.00033H17.5M4.16667 5.00033V16.667C4.16667 17.109 4.34226 17.5329 4.65482 17.8455C4.96738 18.1581 5.39131 18.3337 5.83333 18.3337H14.1667C14.6087 18.3337 15.0326 18.1581 15.3452 17.8455C15.6577 17.5329 15.8333 17.109 15.8333 16.667V5.00033H4.16667ZM6.66667 5.00033V3.33366C6.66667 2.89163 6.84226 2.46771 7.15482 2.15515C7.46738 1.84259 7.89131 1.66699 8.33333 1.66699H11.6667C12.1087 1.66699 12.5326 1.84259 12.8452 2.15515C13.1577 2.46771 13.3333 2.89163 13.3333 3.33366V5.00033M8.33333 9.16699V14.167M11.6667 9.16699V14.167"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              Hapus
            </Button>

            <div className="flex w-[304px] items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                  Buat lagi
                </span>
                <button
                  onClick={handleToggle}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0"
                >
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M21.3333 6.66699H10.6667C5.51202 6.66699 1.33334 10.8457 1.33334 16.0003C1.33334 21.155 5.51202 25.3337 10.6667 25.3337H21.3333C26.488 25.3337 30.6667 21.155 30.6667 16.0003C30.6667 10.8457 26.488 6.66699 21.3333 6.66699Z"
                      stroke="#1E1E1E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6667 20.0003C12.8758 20.0003 14.6667 18.2095 14.6667 16.0003C14.6667 13.7912 12.8758 12.0003 10.6667 12.0003C8.45754 12.0003 6.66668 13.7912 6.66668 16.0003C6.66668 18.2095 8.45754 20.0003 10.6667 20.0003Z"
                      stroke="#1E1E1E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <Button
                variant="primary"
                className="w-[170px] px-[18px] py-2.5"
                icon={
                  <svg width="21" height="20" viewBox="0 0 21 20" fill="none">
                    <path
                      d="M14.6667 17.5V10.8333H6.33333V17.5M6.33333 2.5V6.66667H13M16.3333 17.5H4.66667C4.22464 17.5 3.80072 17.3244 3.48816 17.0118C3.17559 16.6993 3 16.2754 3 15.8333V4.16667C3 3.72464 3.17559 3.30072 3.48816 2.98816C3.80072 2.67559 4.22464 2.5 4.66667 2.5H13.8333L18 6.66667V15.8333C18 16.2754 17.8244 16.6993 17.5118 17.0118C17.1993 17.3244 16.7754 17.5 16.3333 17.5Z"
                      stroke="white"
                      strokeWidth="0.833333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
