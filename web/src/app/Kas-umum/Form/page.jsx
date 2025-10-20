'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';

export default function FormInputKasUmum() {
  const [formData, setFormData] = useState({
    tanggal: '',
    kodeRek: '',
    bidang: '',
    subBidang: '',
    kegiatan: '',
    uraian: '',
    pemasukan: '',
    pengeluaran: '',
    nomorBukti: '',
    nettoTransaksi: '',
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
    { label: 'Penatausahaan', icon: true, active: false },
    { label: 'Buku Kas Umum', active: true },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-[61px] py-[35px] overflow-y-auto">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex w-[977px] flex-col items-start gap-5">
          <h1 className="self-stretch text-black font-['Poppins'] text-base font-bold leading-6 m-0">
            Input Data Kas Umum
          </h1>

          <div className="flex flex-col items-start gap-[29px] self-stretch">
            {/* Detail Section */}
            <div className="flex px-5 py-[30px] flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565]">
              <h2 className="text-black font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 m-0">
                Detail
              </h2>

              <div className="flex flex-col items-start gap-1.5 w-[320px]">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Tanggal</label>
                <div className="flex px-[14px] py-2.5 items-center gap-2 self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
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
                    className="flex-1 text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 border-none outline-none bg-transparent placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">
                  Klasifikasi Bidang Kegiatan
                </label>
                <div className="flex items-start gap-1.5 self-stretch">
                  <input
                    type="text"
                    name="kodeRek"
                    value={formData.kodeRek}
                    onChange={handleInputChange}
                    placeholder="Kode Rek"
                    className="w-[159px] px-[14px] py-2.5 rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 outline-none placeholder:text-[#a1a1aa]"
                  />
                  <div className="flex px-2.5 py-2.5 items-center gap-2 flex-1 rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] relative">
                    <select
                      name="bidang"
                      value={formData.bidang}
                      onChange={handleInputChange}
                      className="flex-1 text-[#71717a] font-['Inter'] text-base font-normal leading-6 border-none outline-none bg-transparent appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Bidang</option>
                    </select>
                    <svg className="w-4 h-4 flex-shrink-0 pointer-events-none absolute right-3" width="17" height="16" viewBox="0 0 17 16" fill="none">
                      <path
                        d="M4.33333 6L8.33333 10L12.3333 6"
                        stroke="#A1A1AA"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex px-2.5 py-2.5 items-center gap-2 flex-1 rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] relative">
                    <select
                      name="subBidang"
                      value={formData.subBidang}
                      onChange={handleInputChange}
                      className="flex-1 text-[#71717a] font-['Inter'] text-base font-normal leading-6 border-none outline-none bg-transparent appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Sub-Bidang</option>
                    </select>
                    <svg className="w-4 h-4 flex-shrink-0 pointer-events-none absolute right-3" width="17" height="16" viewBox="0 0 17 16" fill="none">
                      <path
                        d="M4.66666 6L8.66666 10L12.6667 6"
                        stroke="#A1A1AA"
                        strokeWidth="1.33"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex px-2.5 py-2.5 items-center gap-2 flex-1 rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] relative">
                    <select
                      name="kegiatan"
                      value={formData.kegiatan}
                      onChange={handleInputChange}
                      className="flex-1 text-[#71717a] font-['Inter'] text-base font-normal leading-6 border-none outline-none bg-transparent appearance-none cursor-pointer pr-6"
                    >
                      <option value="">Kegiatan</option>
                    </select>
                    <svg className="w-4 h-4 flex-shrink-0 pointer-events-none absolute right-3" width="16" height="16" viewBox="0 0 16 16" fill="none">
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
                  className="flex-1 self-stretch px-[14px] py-2.5 rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)] text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 outline-none placeholder:text-[#a1a1aa]"
                />
              </div>
            </div>

            {/* Arus Dana Section */}
            <div className="flex px-5 py-[30px] flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565]">
              <h2 className="text-black font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 m-0">
                Arus Dana
              </h2>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Pemasukan</label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex px-3 py-2.5 justify-between items-center text-[#71717a] font-['Inter'] text-base font-normal leading-6">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="pemasukan"
                    value={formData.pemasukan}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex px-0 py-2.5 pr-[14px] items-center gap-2 flex-1 text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 border-none outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Pengeluaran</label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex px-3 py-2.5 justify-between items-center text-[#71717a] font-['Inter'] text-base font-normal leading-6">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="pengeluaran"
                    value={formData.pengeluaran}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex px-0 py-2.5 pr-[14px] items-center gap-2 flex-1 text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 border-none outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>

            {/* Bukti dan Kumulatif Section */}
            <div className="flex px-5 py-[30px] flex-col items-start gap-5 self-stretch rounded-[30px] border-[0.5px] border-[#4b5565]">
              <h2 className="text-black font-['Plus_Jakarta_Sans'] text-base font-normal leading-6 m-0">
                Bukti dan Kumulatif
              </h2>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Nomor Bukti</label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex px-3 py-2.5 justify-between items-center text-[#71717a] font-['Inter'] text-base font-normal leading-6">
                    No
                  </div>
                  <input
                    type="text"
                    name="nomorBukti"
                    value={formData.nomorBukti}
                    onChange={handleInputChange}
                    placeholder="12345"
                    className="flex px-0 py-2.5 pr-[14px] items-center gap-2 flex-1 text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 border-none outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5 self-stretch">
                <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Netto Transaksi</label>
                <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
                  <div className="flex px-3 py-2.5 justify-between items-center text-[#71717a] font-['Inter'] text-base font-normal leading-6">
                    Rp
                  </div>
                  <input
                    type="text"
                    name="nettoTransaksi"
                    value={formData.nettoTransaksi}
                    onChange={handleInputChange}
                    placeholder="0.000.000,00"
                    className="flex px-0 py-2.5 pr-[14px] items-center gap-2 flex-1 text-[#a1a1aa] font-['Inter'] text-base font-normal leading-6 border-none outline-none placeholder:text-[#a1a1aa]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Saldo Field */}
          <div className="flex flex-col items-start gap-1.5 self-stretch">
            <label className="text-[#011829] font-['Inter'] text-sm font-medium leading-5">Saldo (Automated)</label>
            <div className="flex items-start self-stretch rounded-lg border border-[#d4d4d8] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
              <div className="flex px-3 py-2.5 justify-between items-center text-[#71717a] font-['Inter'] text-base font-normal leading-6">
                Rp
              </div>
              <input
                type="text"
                value="100.000.000,00"
                readOnly
                className="flex px-0 py-2.5 pr-[14px] items-center gap-2 flex-1 text-[#011829] font-['Inter'] text-base font-normal leading-6 border-none outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center self-stretch">
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

            <div className="flex w-[304px] justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-black font-['Plus_Jakarta_Sans'] text-base font-normal leading-6">
                  Buat lagi
                </span>
                <button
                  onClick={handleToggle}
                  className="w-8 h-8 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
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
