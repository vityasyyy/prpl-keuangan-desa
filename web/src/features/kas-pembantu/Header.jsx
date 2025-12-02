"use client";
import { useRouter, usePathname } from "next/navigation";
import { Download, Plus } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export default function Header({ title }) {
  const router = useRouter();
  const pathname = usePathname();

  // path otomatis ke Form di halaman saat ini
  const formPath = `${pathname}/Form`;

  const handleDownloadFile = () => {
    // Ambil segment terakhir dari pathname
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1]?.toLowerCase();

    let exportUrl = '';

    // Map pathname ke endpoint export
    if(lastSegment === "kas-pembantu-pajak") {
      exportUrl = `${API_BASE_URL}/kas-pembantu/pajak/export`;
    } else if (lastSegment === "kas-pembantu-panjar") {
      exportUrl = `${API_BASE_URL}/kas-pembantu/panjar/export`;
    } else if (lastSegment === "kas-pembantu-kegiatan") {
      exportUrl = `${API_BASE_URL}/kas-pembantu/kegiatan/export`;
    }

    // Trigger download
    window.location.href = exportUrl;
  };

  return (
    <div className="flex justify-between items-start mb-6">
      {/* Judul Halaman */}
      <h1 className="text-2xl font-semibold text-black mt-8">{title}</h1>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-2">
        {/* Tombol Unduh File */}
        <button 
        onClick={handleDownloadFile}
        className="flex items-center justify-between bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-all">
          <span>Unduh File</span>
          <Download size={18} className="ml-2" />
        </button>

        {/* Tombol Input Data */}
        <button
          onClick={() => router.push(formPath)}
          className="flex items-center justify-between bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
        >
          <span>Input Data</span>
          <Plus size={18} className="ml-2" />
        </button>
      </div>
    </div>
  );
}
