"use client";
import { Circle, Book } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BreadcrumbHeader() {
  const pathname = usePathname();

  // deteksi halaman sekarang
  let pageTitle = "";
  if (pathname.includes("Kas-pembantu-pajak"))
    pageTitle = "Buku Pembantu Pajak";
  else if (pathname.includes("Kas-pembantu-panjar"))
    pageTitle = "Buku Pembantu Panjar";
  else if (pathname.includes("Kas-pembantu-kegiatan"))
    pageTitle = "Buku Pembantu Kegiatan";
  else pageTitle = "Halaman";

  return (
    <div className="flex items-center text-[15px] font-medium mb-6 mt-2">
      {/* Dua lingkaran di kiri */}
      <div className="flex items-center mr-2">
        <Circle className="w-3 h-3 text-gray-500" strokeWidth={1.5} />
        <Circle className="w-1 h-1 text-gray-500 -ml-[8px]" strokeWidth={4.5} />
      </div>

      {/* Icon Buku */}
      <Book className="w-5 h-5 text-gray-700 mr-2" strokeWidth={1.5} />

      {/* Breadcrumb */}
      <span className="text-gray-800">Penatausahaan</span>
      <span className="mx-1 text-gray-600">{">"}</span>
      <a
        href="#"
        className="text-blue-600 hover:underline underline-offset-[3px]"
      >
        {pageTitle}
      </a>
    </div>
  );
}
