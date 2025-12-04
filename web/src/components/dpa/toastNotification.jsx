"use client";

import { useEffect } from "react";
import { Success, InfoIcon, ErrIcon } from "@/components/dpa/icons";

const ToastNotification = ({ message, type, onClose }) => {
  const types = {
    success: {
      style: "border-green-500 text-green-700",
      icon: <Success height={24} width={24} className="mr-4 flex-shrink-0" />,
    },
    error: {
      style: "border-red-500 text-red-700",
      icon: <ErrIcon height={24} width={24} className="mr-4 flex-shrink-0" />,
    },
    info: {
      style: "border-blue-500 text-blue-700",
      icon: <InfoIcon height={24} width={24} className="mr-4 flex-shrink-0" />,
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 bottom-4 z-100 flex max-w-100 min-w-80 items-start justify-between rounded-md border-l-4 bg-white p-4 text-sm shadow-lg ${types[type].style}`}
      role="alert"
      aria-live="assertive"
    >
      {types[type].icon}
      <p className="flex-1 text-gray-800">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastNotification;
