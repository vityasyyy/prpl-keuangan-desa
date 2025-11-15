/**
 * Currency formatting and parsing utilities
 */

export function formatCurrency(value) {
  if (!value) return "Rp0,00";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "Rp0,00";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function parseCurrency(value) {
  if (!value) return 0;

  const cleaned = value.replace(/[^0-9,-]/g, "").replace(",", ".");

  const num = parseFloat(cleaned);

  return isNaN(num) ? 0 : num;
}

/**
 * Date formatting utilities
 */

export function formatDate(isoString) {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

export function parseDate(ddmmyyyy) {
  if (!ddmmyyyy) return "";

  try {
    const parts = ddmmyyyy.split("/");
    if (parts.length !== 3) return "";

    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

/**
 * Convert ISO date to input type="date" format (YYYY-MM-DD)
 */
export function isoToDateInput(isoString) {
  if (!isoString) return "";

  try {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

/**
 * Extract month and year from ISO date
 */
export function getMonthYear(isoString) {
  if (!isoString) return { month: 0, year: 0 };

  try {
    const date = new Date(isoString);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  } catch {
    return { month: 0, year: 0 };
  }
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(monthNumber) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  if (monthNumber < 1 || monthNumber > 12) return "";
  return months[monthNumber - 1];
}

/**
 * Format month display (e.g., "Bulan 1", "Bulan 2")
 */
export function formatMonthDisplay(monthNumber) {
  return `Bulan ${monthNumber}`;
}
