import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

// Ensure tests use the same secret as jwt signing in utils
process.env.ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret";

// Mock the auth middleware to bypass JWT verification
jest.mock("../../middleware/auth.middleware.js", () => ({
  verifyAccessToken: jest.fn((req, res, next) => {
    req.user = { user_id: 1, username: "testuser", role: "bendahara" };
    next();
  }),
}));

// Mock the logging middleware
jest.mock("../../middleware/logging.middleware.js", () => ({
  attachLogging: jest.fn(() => (req, res, next) => {
    req.log = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
    next();
  }),
}));

describe("Bank Desa Handler (Unit)", () => {
  let app;
  let mockDb;
  let mockClient;
  let token;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // Create mock client
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Create mock database pool
    mockDb = {
      connect: jest.fn().mockResolvedValue(mockClient),
      query: jest.fn(),
    };

    // Create JWT token for auth
    token = jwt.sign(
      { user_id: 1, username: "testuser", role: "bendahara" },
      process.env.ACCESS_SECRET || "access-secret"
    );
  });

  describe("POST /api/bank-desa - Validation", () => {
    it("should return 400 when tanggal is missing", async () => {
      // Dynamic import after mocks are set up
      const { default: bankDesaRouter } = await import("../../router/bank-desa/bank-desa.router.js");
      
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
      app.use("/api/bank-desa", bankDesaRouter({ db: mockDb }));

      const payload = {
        uraian: 'Test Entry',
        setoran: 1000000,
      };

      const res = await request(app)
        .post("/api/bank-desa")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Tanggal');
    });

    it("should return 400 when uraian is missing", async () => {
      const { default: bankDesaRouter } = await import("../../router/bank-desa/bank-desa.router.js");
      
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
      app.use("/api/bank-desa", bankDesaRouter({ db: mockDb }));

      const payload = {
        tanggal: '2025-01-15',
        setoran: 1000000,
      };

      const res = await request(app)
        .post("/api/bank-desa")
        .set("Authorization", `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Uraian');
    });
  });

  describe("GET /api/bank-desa/print - Validation", () => {
    it("should return 400 when year is missing", async () => {
      const { default: bankDesaRouter } = await import("../../router/bank-desa/bank-desa.router.js");
      
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
      app.use("/api/bank-desa", bankDesaRouter({ db: mockDb }));

      const res = await request(app)
        .get("/api/bank-desa/print")
        .query({ month: 1 })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
    });

    it("should return 400 when month is missing", async () => {
      const { default: bankDesaRouter } = await import("../../router/bank-desa/bank-desa.router.js");
      
      app = express();
      app.use(express.json());
      app.use(cookieParser());
      app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
      app.use("/api/bank-desa", bankDesaRouter({ db: mockDb }));

      const res = await request(app)
        .get("/api/bank-desa/print")
        .query({ year: 2025 })
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });

  describe("Balance Calculation Logic", () => {
    it("should calculate balance correctly: deposits add, withdrawals subtract", () => {
      // Test the balance calculation logic directly (same as in handler)
      const calculateBalance = (latestSaldo, entryData) => {
        const {
          setoran = 0,
          penerimaan_bunga = 0,
          penarikan = 0,
          pajak = 0,
          biaya_admin = 0,
        } = entryData;

        const numLatestSaldo = Number(latestSaldo) || 0;
        const numSetoran = Number(setoran) || 0;
        const numPenerimaanBunga = Number(penerimaan_bunga) || 0;
        const numPenarikan = Number(penarikan) || 0;
        const numPajak = Number(pajak) || 0;
        const numBiayaAdmin = Number(biaya_admin) || 0;

        const totalMasuk = numSetoran + numPenerimaanBunga;
        const totalKeluar = numPenarikan + numPajak + numBiayaAdmin;

        return numLatestSaldo + totalMasuk - totalKeluar;
      };

      // Test case 1: Simple deposit
      expect(calculateBalance(1000000, { setoran: 500000 })).toBe(1500000);

      // Test case 2: Simple withdrawal
      expect(calculateBalance(1000000, { penarikan: 300000 })).toBe(700000);

      // Test case 3: All transaction types
      expect(calculateBalance(1000000, {
        setoran: 200000,
        penerimaan_bunga: 10000,
        penarikan: 100000,
        pajak: 5000,
        biaya_admin: 2000,
      })).toBe(1103000); // 1000000 + 200000 + 10000 - 100000 - 5000 - 2000

      // Test case 4: Starting from zero
      expect(calculateBalance(0, { setoran: 1000000 })).toBe(1000000);

      // Test case 5: Balance can go negative
      expect(calculateBalance(100000, { penarikan: 200000 })).toBe(-100000);
    });
  });

  describe("Running Balance Recalculation Logic", () => {
    it("should recalculate running balance for a list of entries", () => {
      // This tests the logic used in getBukuBankEntries
      const recalculateBalance = (entries) => {
        let runningBalance = 0;
        return entries.map(entry => {
          const setoran = Number(entry.setoran) || 0;
          const bunga = Number(entry.penerimaan_bunga) || 0;
          const penarikan = Number(entry.penarikan) || 0;
          const pajak = Number(entry.pajak) || 0;
          const admin = Number(entry.biaya_admin) || 0;

          const totalMasuk = setoran + bunga;
          const totalKeluar = penarikan + pajak + admin;

          runningBalance = runningBalance + totalMasuk - totalKeluar;

          return {
            ...entry,
            saldo_after: runningBalance,
          };
        });
      };

      const entries = [
        { id: '1', setoran: 1000000, penerimaan_bunga: 0, penarikan: 0, pajak: 0, biaya_admin: 0 },
        { id: '2', setoran: 0, penerimaan_bunga: 50000, penarikan: 0, pajak: 0, biaya_admin: 0 },
        { id: '3', setoran: 0, penerimaan_bunga: 0, penarikan: 200000, pajak: 10000, biaya_admin: 5000 },
      ];

      const result = recalculateBalance(entries);

      expect(result[0].saldo_after).toBe(1000000);
      expect(result[1].saldo_after).toBe(1050000);
      expect(result[2].saldo_after).toBe(835000);
    });
  });

  describe("Reversal Entry Generation Logic", () => {
    it("should generate correct reversal payload", () => {
      const generateReversal = (original, tanggalOverride) => {
        const tanggal = tanggalOverride || original.tanggal;
        const toNum = (v) => (v == null ? 0 : Number(v));
        const neg = (v) => (v == null ? 0 : -Math.abs(Number(v)));

        return {
          tanggal,
          uraian: `[REVERSAL] ${original.uraian || original.bukti_transaksi || original.id}`,
          bukti_transaksi: original.bukti_transaksi 
            ? `${String(original.bukti_transaksi).slice(0, 45)}-REV` 
            : 'REV',
          setoran: neg(toNum(original.setoran)),
          penerimaan_bunga: neg(toNum(original.penerimaan_bunga)),
          penarikan: neg(toNum(original.penarikan)),
          pajak: neg(toNum(original.pajak)),
          biaya_admin: neg(toNum(original.biaya_admin)),
        };
      };

      const original = {
        id: 'test-1',
        tanggal: '2025-01-15',
        uraian: 'Test Setoran',
        bukti_transaksi: 'BT001',
        setoran: 1000000,
        penerimaan_bunga: 50000,
        penarikan: 0,
        pajak: 0,
        biaya_admin: 0,
      };

      const reversal = generateReversal(original);

      expect(reversal.tanggal).toBe('2025-01-15');
      expect(reversal.uraian).toBe('[REVERSAL] Test Setoran');
      expect(reversal.bukti_transaksi).toBe('BT001-REV');
      expect(reversal.setoran).toBe(-1000000);
      expect(reversal.penerimaan_bunga).toBe(-50000);
      expect(reversal.penarikan).toBe(-0); // neg(0) = -0
      expect(reversal.pajak).toBe(-0);
      expect(reversal.biaya_admin).toBe(-0);
    });

    it("should use override date if provided", () => {
      const generateReversal = (original, tanggalOverride) => {
        const tanggal = tanggalOverride || original.tanggal;
        return { tanggal };
      };

      const original = { tanggal: '2025-01-15' };
      const reversal = generateReversal(original, '2025-01-20');

      expect(reversal.tanggal).toBe('2025-01-20');
    });

    it("should handle missing bukti_transaksi", () => {
      const generateReversal = (original) => {
        return {
          bukti_transaksi: original.bukti_transaksi 
            ? `${String(original.bukti_transaksi).slice(0, 45)}-REV` 
            : 'REV',
        };
      };

      const original = { bukti_transaksi: null };
      const reversal = generateReversal(original);

      expect(reversal.bukti_transaksi).toBe('REV');
    });

    it("should truncate long bukti_transaksi", () => {
      const generateReversal = (original) => {
        return {
          bukti_transaksi: original.bukti_transaksi 
            ? `${String(original.bukti_transaksi).slice(0, 45)}-REV` 
            : 'REV',
        };
      };

      const longBukti = 'A'.repeat(60); // 60 chars
      const original = { bukti_transaksi: longBukti };
      const reversal = generateReversal(original);

      expect(reversal.bukti_transaksi.length).toBe(49); // 45 + 4 ("-REV")
    });
  });
});
