"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import Button from "@/components/Button";

export default function BukuKasUmumPage() {
  const [expandedMonths, setExpandedMonths] = useState({ bulan1: true });
  const router = useRouter();

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const breadcrumbItems = [
    { label: "Penatausahaan", icon: true, active: false },
    { label: "Buku Kas Umum", active: true },
  ];

  const tableData = [
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
    {
      no: "1",
      tanggal: "22/4/09",
      kodeRekening: "1.1.2",
      uraian: "Saldo Masuk",
      pemasukan: "4.000,00",
      pengeluaran: "5.000,00",
      noBukti: "12",
      nettoTransaksi: "9.000,00",
      saldo: "10,000",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-[61px] py-[35px]">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex max-w-[984px] flex-col items-start gap-10">
          <div className="flex min-h-[117px] items-center justify-between self-stretch py-5">
            <div className="flex max-w-[551px] flex-col items-start gap-[7px]">
              <h1 className="m-0 font-['Plus_Jakarta_Sans'] text-[31px] leading-[46.5px] font-bold text-black">
                Buku Kas Umum
              </h1>
              <p className="m-0 font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                Buku Kas Umum Pemerintah Desa BANGUNTAPAN Tahun Anggaran 2025
              </p>
            </div>
            <div className="flex flex-col items-start justify-center gap-0.5">
              <Button
                variant="orange"
                icon={
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <path
                      d="M17.5 13V16.3333C17.5 16.7754 17.3244 17.1993 17.0118 17.5118C16.6993 17.8244 16.2754 18 15.8333 18H4.16667C3.72464 18 3.30072 17.8244 2.98816 17.5118C2.67559 17.1993 2.5 16.7754 2.5 16.3333V13M5.83333 8.83333L10 13M10 13L14.1667 8.83333M10 13V3"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              >
                Unduh File
              </Button>
              <Button
                variant="green"
                icon={
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none">
                    <path
                      d="M10 4.6665V16.3332M4.16669 10.4998H15.8334"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
                onClick={() => router.push("/Kas-umum/Form")}
              >
                Input Data
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1.5 self-stretch">
            <label className="font-['Inter'] text-sm leading-5 font-medium text-[#011829]">
              Tanggal
            </label>
            <div className="flex items-center gap-2 self-stretch rounded-lg border border-[#d4d4d8] bg-white px-[14px] py-2.5 shadow-[0_1px_2px_0_rgba(16,24,40,0.05)]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M13.3333 1.6665V4.99984M6.66667 1.6665V4.99984M2.5 8.33317H17.5M4.16667 3.33317H15.8333C16.7538 3.33317 17.5 4.07936 17.5 4.99984V16.6665C17.5 17.587 16.7538 18.3332 15.8333 18.3332H4.16667C3.24619 18.3332 2.5 17.587 2.5 16.6665V4.99984C2.5 4.07936 3.24619 3.33317 4.16667 3.33317Z"
                  stroke="#71717A"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="flex-1 border-none font-['Inter'] text-base leading-6 font-normal text-[#a1a1aa] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-[14px] self-stretch">
            {/* Month Section - Collapsed */}
            <div className="flex flex-col items-start self-stretch">
              <div className="flex h-[66px] items-center justify-between self-stretch rounded-[30px] border-[0.5px] border-[#4b5565] px-[25px] py-[17px]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleMonth("bulan2")}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-transparent p-0"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="#121926"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="font-['Plus_Jakarta_Sans'] text-xl leading-[30px] font-bold text-black">
                    Bulan 2
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                    Saldo Total
                  </span>
                  <span className="font-['Poppins'] text-base leading-6 font-bold text-black">
                    Rp1.500.000.000,00
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#4b5565] bg-transparent p-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                        stroke="#364152"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="black flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#4b5565] bg-transparent p-2"
                    onClick={() => router.push("/Kas-umum/Form")}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M7.99998 3.3335V12.6668M3.33331 8.00016H12.6666"
                        stroke="#364152"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Month Section - Expanded */}
            <div className="flex flex-col items-start self-stretch">
              <div className="flex h-[66px] items-center justify-between self-stretch rounded-[30px] border-[0.5px] border-[#4b5565] px-[25px] py-[17px]">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleMonth("bulan1")}
                    className="flex h-6 w-6 cursor-pointer items-center justify-center border-none bg-transparent p-0"
                  >
                    {expandedMonths.bulan1 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="#121926"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 18L15 12L9 6"
                          stroke="#121926"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                  <span className="font-['Plus_Jakarta_Sans'] text-xl leading-[30px] font-bold text-black">
                    Bulan 1
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-['Plus_Jakarta_Sans'] text-base leading-6 font-normal text-black">
                    Saldo Total
                  </span>
                  <span className="font-['Poppins'] text-base leading-6 font-bold text-black">
                    Rp1.500.000.000,00
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#4b5565] bg-transparent p-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
                        stroke="#364152"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="black flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#4b5565] bg-transparent p-2"
                    onClick={() => router.push("/Kas-umum/Form")}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M7.99998 3.3335V12.6668M3.33331 8.00016H12.6666"
                        stroke="#364152"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {expandedMonths.bulan1 && (
                <div className="flex flex-col items-start self-stretch">
                  <div className="flex h-[47px] items-center justify-between self-stretch border-b-[0.5px] border-black px-5 py-2.5">
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      No
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Tanggal
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Kode Rekening
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Uraian
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Pemasukan
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Pengeluaran
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      No. Bukti
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Netto Transaksi
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Saldo
                    </div>
                    <div className="font-['Poppins'] text-base leading-6 font-bold text-black">
                      Edit
                    </div>
                  </div>
                  {tableData.map((row, index) => (
                    <div
                      key={index}
                      className="grid h-[47px] grid-cols-11 items-center self-stretch border-b-[0.5px] border-black px-5 py-2.5"
                    >
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.no}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.tanggal}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.kodeRekening}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.uraian}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.pemasukan}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.pengeluaran}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.noBukti}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.nettoTransaksi}
                      </div>
                      <div className="text-center font-['Plus_Jakarta_Sans'] text-base text-black">
                        {row.saldo}
                      </div>
                      <div className="flex justify-center">
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
                          <path
                            d="M8 13.8332H14M11 2.83316C11.2652 2.56794 11.6249 2.41895 12 2.41895C12.1857 2.41895 12.3696 2.45553 12.5412 2.5266C12.7128 2.59767 12.8687 2.70184 13 2.83316C13.1313 2.96448 13.2355 3.12038 13.3066 3.29196C13.3776 3.46354 13.4142 3.64744 13.4142 3.83316C13.4142 4.01888 13.3776 4.20277 13.3066 4.37436C13.2355 4.54594 13.1313 4.70184 13 4.83316L4.66667 13.1665L2 13.8332L2.66667 11.1665L11 2.83316Z"
                            stroke="#121926"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
