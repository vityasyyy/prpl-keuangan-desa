"use client";

import Button from "@/components/dpa//button";
import { useEffect, useRef, useState } from "react";

const DropDrag = ({ isOpen, setIsOpen, onFileUpload }) => {
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleComfirm = () => {
    if (selectedFile) {
      console.log("File Dikonfirmasi:", selectedFile.name);
      onFileUpload?.(selectedFile);
      setSelectedFile(null);
    }
    setIsOpen(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dragRef.current && !dragRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedFile(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={dragRef}
        className="mx-auto min-h-64 min-w-128 space-y-8 rounded-lg border-1 border-gray-100 bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold">Unggah File</h2>
        <div
          className={`cursor-pointer rounded-md border-3 border-dashed px-8 py-32 text-center text-lg transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-gray-200 text-gray-500"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          {selectedFile ? (
            <div className="text-green-600">
              <p className="font-semibold">File terpilih:</p>
              <p className="mt-2">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
            </div>
          ) : (
            "Silahkan klik atau seret file yang ingin diunggah ke area ini"
          )}
        </div>
        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={() => {
              setIsOpen(false);
              setSelectedFile(null);
            }}
          >
            Batal
          </Button>
          <Button variant="peace" onClick={handleComfirm} disabled={!selectedFile}>
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DropDrag;
