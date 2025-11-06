"use client";
import { useRouter, usePathname } from "next/navigation";
import { Download, Plus } from "lucide-react";

export default function Header({ title }) {
  const router = useRouter();
  const pathname = usePathname();

  // path otomatis ke Form di halaman saat ini
  const formPath = `${pathname}/Form`;

  return (
    <div className="flex justify-between items-start mb-6">
      {/* Judul Halaman */}
      <h1 className="text-2xl font-semibold text-black mt-8">{title}</h1>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-2">
        {/* Tombol Unduh File */}
        <button className="flex items-center justify-between bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-all">
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
