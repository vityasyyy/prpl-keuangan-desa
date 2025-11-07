'use client";';

import { useState, useRef, useEffect } from "react";
import { Calendar } from "@/components/dpa/icons";

const DateInput = ({ value, onChange }) => {
  const dateInputRef = useRef(null);

  const formatTanggal = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className="relative flex w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pr-3 pl-9 transition-colors focus-within:ring-1 focus-within:ring-gray-400 hover:bg-gray-50"
      onClick={() => dateInputRef.current?.showPicker()}
    >
      <Calendar
        color="#71717A"
        className="top-2.4 pointer-events-none absolute left-3 h-5 w-5 text-gray-600"
      />

      <input
        ref={dateInputRef}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer [appearance:none] opacity-0 [&::-webkit-calendar-picker-indicator]:opacity-0"
      />

      <span className={`pointer-events-none pl-3 ${value ? "text-gray-800" : "text-gray-400"}`}>
        {value ? formatTanggal(value) : "DD/MM/YYYY"}
      </span>
    </div>
  );
};

const TextInput = ({ value, onChange, placeholder = "", prefix = "", ...props }) => {
  return (
    <div className="flex w-full items-center rounded-md border border-[#D4D4D8] transition-colors focus-within:ring-1 focus-within:ring-gray-400 hover:bg-gray-50">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 focus:outline-none"
        onChange={(e) => onChange(e.target.value)}
        value={value}
        {...props}
      />
    </div>
  );
};

const NumberInput = ({
  children,
  value,
  onChange,
  prefix = "Rp",
  placeholder = "",
  min = 0,
  auto = false,
  ...props
}) => {
  return (
    <div className="flex w-full items-center rounded-md border border-[#D4D4D8] transition-colors focus-within:ring-1 focus-within:ring-gray-400 hover:bg-gray-50">
      {prefix.length > 0 && (
        <span className="border-r border-[#D4D4D8] px-3 text-sm text-gray-500">{prefix}</span>
      )}
      {!auto ? (
        <input
          type="number"
          placeholder={placeholder}
          className="w-full [appearance:textfield] px-3 py-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(e) => onChange(e.target.value)}
          value={value}
          min={min}
          {...props}
        />
      ) : (
        <div className="px-3 py-2">{children}</div>
      )}
    </div>
  );
};

const DropdownInput = ({ label, options = [], value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [hasSelected, setHasSelected] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setHasSelected(true);
    setIsOpen(false);
  };

  return (
    <div className="relative flex w-full flex-col" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`text-leftfocus:ring-1 flex w-full items-center justify-between rounded-md border border-[#D4D4D8] bg-white px-3 focus:outline-none ${hasSelected ? "py-2.5 text-sm text-[#011829]" : "py-2 text-gray-400"}`}
      >
        <span>{value || `Pilih ${label}`}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transform text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-0 w-full rounded-lg border border-[#D4D4D8] bg-white shadow-lg">
          {options.length > 0 ? (
            options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 ${
                  value === option ? "textgraye-700 bg-gray-100" : "text-gray-800"
                }`}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-400">Tidak ada opsi</div>
          )}
        </div>
      )}
    </div>
  );
};

export { DateInput, TextInput, NumberInput, DropdownInput };
