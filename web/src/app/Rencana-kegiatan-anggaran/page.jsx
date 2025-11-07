"use client";

import { useState } from "react";
import Header from "@/components/dpa/header";
import DropDrag from "@/components/dpa/dropDrag";
import FileList from "@/components/dpa/fileList";
import ToastNotification from "@/components/dpa/toastNotification";

export default function RencanaKegiatanAnggaran() {
  const [isDropDragOpen, setIsDropDragOpen] = useState(false);
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "RKA_Tahun_2024.pdf",
      uploadDate: "10/01/2024",
      filePath: null,
    },
  ]);
  const [toast, setToast] = useState(null);

  const handleDownload = () => {
    setToast({ message: "Mengunduh file...", type: "info" });
  };

  const handleInputData = () => {
    setIsDropDragOpen(true);
  };

  const handleFileUpload = (file) => {
    const newFile = {
      id: Date.now(),
      name: file.name,
      uploadDate: new Date().toLocaleDateString("id-ID"),
      file: file,
    };
    setFiles([...files, newFile]);
    setToast({ message: "File berhasil diunggah!", type: "success" });
  };

  const handleDeleteFile = (fileId) => {
    setFiles(files.filter((file) => file.id !== fileId));
    setToast({ message: "File berhasil dihapus!", type: "success" });
  };

  const handleViewFile = (file) => {
    setToast({ message: `Membuka file: ${file.name}`, type: "info" });
  };

  return (
    <div className="p-8">
      <Header
        judul="Rencana Kegiatan Anggaran"
        desa="Contoh Desa"
        tahun="2024"
        downloadHandler={handleDownload}
        inputHandler={handleInputData}
      />

      <FileList files={files} onDelete={handleDeleteFile} onView={handleViewFile} />

      <DropDrag
        isOpen={isDropDragOpen}
        setIsOpen={setIsDropDragOpen}
        onFileUpload={handleFileUpload}
      />

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
