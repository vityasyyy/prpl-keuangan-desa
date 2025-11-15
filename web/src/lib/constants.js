/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  BASE: "/api/kas-pembantu",

  KEGIATAN_LIST: "/api/kas-pembantu/kegiatan",
  KEGIATAN_BY_ID: (id) => `/api/kas-pembantu/kegiatan/${id}`,
  KEGIATAN_CREATE: "/api/kas-pembantu/kegiatan",
  KEGIATAN_UPDATE: (id) => `/api/kas-pembantu/kegiatan/${id}`,
  KEGIATAN_DELETE: (id) => `/api/kas-pembantu/kegiatan/${id}`,

  PANJAR_LIST: "/api/kas-pembantu/panjar",
  PANJAR_BY_ID: (id) => `/api/kas-pembantu/panjar/${id}`,
  PANJAR_CREATE: "/api/kas-pembantu/panjar",
  PANJAR_UPDATE: (id) => `/api/kas-pembantu/panjar/${id}`,
  PANJAR_DELETE: (id) => `/api/kas-pembantu/panjar/${id}`,

  PAJAK_LIST: "/api/kas-pembantu/pajak",
  PAJAK_BY_ID: (id) => `/api/kas-pembantu/pajak/${id}`,
  PAJAK_CREATE: "/api/kas-pembantu/pajak",
  PAJAK_UPDATE: (id) => `/api/kas-pembantu/pajak/${id}`,
  PAJAK_DELETE: (id) => `/api/kas-pembantu/pajak/${id}`,
};

/**
 * Module types
 */
export const MODULE_TYPES = {
  KEGIATAN: "kegiatan",
  PANJAR: "panjar",
  PAJAK: "pajak",
};

/**
 * Field configurations per module type
 */
export const MODULE_FIELDS = {
  kegiatan: {
    amountField1: "penerimaan",
    amountField2: "pengeluaran",
    columns: [
      { key: "tanggal", label: "Tanggal", width: "15%" },
      { key: "uraian", label: "Uraian", width: "40%" },
      { key: "penerimaan", label: "Penerimaan", width: "15%" },
      { key: "pengeluaran", label: "Pengeluaran", width: "15%" },
      { key: "saldo_after", label: "Saldo", width: "15%" },
    ],
  },
  panjar: {
    amountField1: "pemberian",
    amountField2: "pertanggungjawaban",
    columns: [
      { key: "tanggal", label: "Tanggal", width: "20%" },
      { key: "uraian", label: "Uraian", width: "40%" },
      { key: "pemberian", label: "Pemberian", width: "15%" },
      { key: "pertanggungjawaban", label: "Pertanggungjawaban", width: "15%" },
      { key: "saldo_after", label: "Saldo", width: "10%" },
    ],
  },
  pajak: {
    amountField1: "pemotongan",
    amountField2: "penyetoran",
    columns: [
      { key: "tanggal", label: "Tanggal", width: "20%" },
      { key: "uraian", label: "Uraian", width: "40%" },
      { key: "pemotongan", label: "Pemotongan", width: "15%" },
      { key: "penyetoran", label: "Penyetoran", width: "15%" },
      { key: "saldo_after", label: "Saldo", width: "10%" },
    ],
  },
};
