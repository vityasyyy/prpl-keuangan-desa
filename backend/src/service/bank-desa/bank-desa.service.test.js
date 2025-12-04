import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { toIdr, generateBukuBankPrintHtml } from './bank-desa.service.js';

describe("BankDesaService (Unit)", () => {
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database pool
    mockDb = {
      query: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("toIdr", () => {
    it("should format number to Indonesian Rupiah format", () => {
      expect(toIdr(1000000)).toBe('1.000.000');
    });

    it("should return empty string for zero", () => {
      expect(toIdr(0)).toBe('');
    });

    it("should return empty string for null", () => {
      expect(toIdr(null)).toBe('');
    });

    it("should return empty string for undefined", () => {
      expect(toIdr(undefined)).toBe('');
    });

    it("should handle string numbers", () => {
      expect(toIdr('500000')).toBe('500.000');
    });

    it("should handle small numbers", () => {
      expect(toIdr(100)).toBe('100');
    });

    it("should handle large numbers", () => {
      expect(toIdr(1234567890)).toBe('1.234.567.890');
    });
  });

  describe("generateBukuBankPrintHtml", () => {
    it("should throw error if year is not provided", async () => {
      await expect(
        generateBukuBankPrintHtml(mockDb, { month: 1, meta: {} })
      ).rejects.toMatchObject({
        status: 400,
        message: 'year and month are required',
      });
    });

    it("should throw error if month is not provided", async () => {
      await expect(
        generateBukuBankPrintHtml(mockDb, { year: 2025, meta: {} })
      ).rejects.toMatchObject({
        status: 400,
        message: 'year and month are required',
      });
    });

    it("should generate HTML with correct structure", async () => {
      // Mock database queries
      mockDb.query
        // Query for transactions before month (opening balance)
        .mockResolvedValueOnce({ rows: [] })
        // Query for transactions in month
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'tx-1',
              tanggal: '2025-01-15',
              uraian: 'Setoran Tunai',
              bukti_transaksi: 'BT001',
              setoran: 1000000,
              penerimaan_bunga: 0,
              penarikan: 0,
              pajak: 0,
              biaya_admin: 0,
              created_at: '2025-01-15T10:00:00Z',
            },
          ],
        })
        // Query for last 5 transactions (debug)
        .mockResolvedValueOnce({ rows: [] })
        // Query for cumulative totals
        .mockResolvedValueOnce({
          rows: [
            {
              setoran: 1000000,
              penerimaan_bunga: 0,
              penarikan: 0,
              pajak: 0,
              biaya_admin: 0,
            },
          ],
        });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 1,
        meta: {
          desa: 'Banguntapan',
          kecamatan: 'Bantul',
          bankCabang: 'BRI Bantul',
          rekNo: '123456789',
        },
        autoPrint: false,
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('C.6 BUKU BANK DESA');
      expect(html).toContain('DESA Banguntapan');
      expect(html).toContain('KECAMATAN Bantul');
      expect(html).toContain('TAHUN ANGGARAN 2025');
      expect(html).toContain('Januari'); // Month name
      expect(html).toContain('BRI Bantul');
      expect(html).toContain('123456789');
      expect(html).toContain('Setoran Tunai');
      expect(html).toContain('1.000.000'); // Formatted amount
    });

    it("should calculate running balance correctly", async () => {
      // Mock database queries
      mockDb.query
        // Query for transactions before month (opening balance: 500000)
        .mockResolvedValueOnce({
          rows: [
            { setoran: 500000, penerimaan_bunga: 0, penarikan: 0, pajak: 0, biaya_admin: 0 },
          ],
        })
        // Query for transactions in month
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'tx-1',
              tanggal: '2025-02-10',
              uraian: 'Setoran',
              setoran: 200000,
              penerimaan_bunga: 10000,
              penarikan: 0,
              pajak: 0,
              biaya_admin: 0,
              created_at: '2025-02-10T10:00:00Z',
            },
            {
              id: 'tx-2',
              tanggal: '2025-02-15',
              uraian: 'Penarikan',
              setoran: 0,
              penerimaan_bunga: 0,
              penarikan: 100000,
              pajak: 5000,
              biaya_admin: 2000,
              created_at: '2025-02-15T10:00:00Z',
            },
          ],
        })
        // Query for last 5 transactions (debug)
        .mockResolvedValueOnce({ rows: [] })
        // Query for cumulative totals
        .mockResolvedValueOnce({
          rows: [
            { setoran: 700000, penerimaan_bunga: 10000, penarikan: 100000, pajak: 5000, biaya_admin: 2000 },
          ],
        });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 2,
        meta: {},
        autoPrint: false,
      });

      // Opening: 500000
      // After tx-1: 500000 + 200000 + 10000 = 710000
      // After tx-2: 710000 - 100000 - 5000 - 2000 = 603000
      expect(html).toContain('710.000'); // Saldo after first transaction
      expect(html).toContain('603.000'); // Saldo after second transaction
    });

    it("should include autoPrint script when autoPrint is true", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 1,
        meta: {},
        autoPrint: true,
      });

      expect(html).toContain('window.print()');
    });

    it("should not include autoPrint script when autoPrint is false", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 1,
        meta: {},
        autoPrint: false,
      });

      expect(html).not.toContain('window.print()');
    });

    it("should handle empty transactions gracefully", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] }) // No opening balance
        .mockResolvedValueOnce({ rows: [] }) // No transactions
        .mockResolvedValueOnce({ rows: [] }) // No debug entries
        .mockResolvedValueOnce({ rows: [] }); // No cumulative

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 3,
        meta: {},
        autoPrint: false,
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Maret'); // March in Indonesian
      expect(html).toContain('TOTAL TRANSAKSI BULAN INI');
    });

    it("should format dates correctly", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'tx-1',
              tanggal: '2025-06-25',
              uraian: 'Test',
              setoran: 100000,
              penerimaan_bunga: 0,
              penarikan: 0,
              pajak: 0,
              biaya_admin: 0,
              created_at: '2025-06-25T10:00:00Z',
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ setoran: 100000, penerimaan_bunga: 0, penarikan: 0, pajak: 0, biaya_admin: 0 }] });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 6,
        meta: {},
        autoPrint: false,
      });

      // Date should be formatted as DD-MM-YYYY
      expect(html).toContain('25-06-2025');
      expect(html).toContain('Juni'); // Month name
    });

    it("should include signature section", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 1,
        meta: { desa: 'Banguntapan' },
        autoPrint: false,
      });

      expect(html).toContain('KEPALA DESA');
      expect(html).toContain('BENDAHARA DESA');
      expect(html).toContain('Banguntapan');
    });

    it("should include instructions section", async () => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const html = await generateBukuBankPrintHtml(mockDb, {
        year: 2025,
        month: 1,
        meta: {},
        autoPrint: false,
      });

      expect(html).toContain('Cara Pengisian:');
      expect(html).toContain('Kolom 1');
      expect(html).toContain('Diisi dengan nomor urut');
    });
  });
});
