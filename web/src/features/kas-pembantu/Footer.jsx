"use client";
import { useState } from "react";
import { Trash2, Plus, Save } from "lucide-react";

export default function Footer({ onDelete, onCreate, onSave }) {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
    onCreate?.();
  };

  return (
    <div className="mt-6 flex items-center justify-between">
      {/* Tombol Hapus (kiri) */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-2 rounded-md bg-red-600 px-5 py-2 text-white transition-colors hover:bg-red-700"
      >
        Hapus
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Kanan */}
      <div className="flex items-center space-x-4">
        {/* Teks dan Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">Buat lagi</span>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative flex h-5 w-9 items-center rounded-full border-[2.5px] transition-colors duration-200 ${
              isActive
                ? "border-black bg-gradient-to-r from-blue-500/90 to-blue-400/90"
                : "border-black bg-transparent"
            }`}
          >
            {/* inner layer (buat efek biru tapi border tetap kelihatan) */}
            <span
              className={`absolute inset-[2px] rounded-full transition-colors duration-200 ${
                isActive ? "bg-blue-500/30" : "bg-transparent"
              }`}
            />
            {/* bola putih */}
            <span
              className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-[2.5px] border-black bg-white transition-transform duration-200 ${
                isActive ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          onClick={onSave}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white transition-transform hover:bg-blue-700 active:scale-95"
        >
          Simpan
          <Save className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
