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
    <div className="flex justify-between items-center mt-6">
      {/* Tombol Hapus (kiri) */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Hapus
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Kanan */}
      <div className="flex items-center space-x-4">
        {/* Teks dan Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-gray-800 text-sm font-medium">Buat lagi</span>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative w-9 h-5 rounded-full border-[2.5px] flex items-center transition-colors duration-200 ${
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
              className={`absolute rounded-full bg-white border-[2.5px] border-black w-3 h-3 top-1/2 -translate-y-1/2 transition-transform duration-200 ${
                isActive ? "translate-x-[18px]" : "translate-x-[2px]"
              }`}
            />
          </button>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-transform active:scale-95"
        >
          Simpan
          <Save className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
