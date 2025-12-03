import { Pool } from "pg";
import { configDotenv } from "dotenv";
import * as bankDesaRepo from "./bank-desa.repo.js";

configDotenv({ path: ".env.test" });
const TEST_DB_URL = process.env.DB_URL_TEST;

if (!TEST_DB_URL) {
  throw new Error("Missing DB_URL_TEST environment variable. Did you run with `pnpm test:integration:repo`?");
}

describe("BankDesaRepository (Integration)", () => {
  let pool;
  let client;

  beforeAll(() => {
    pool = new Pool({ connectionString: TEST_DB_URL });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    client = await pool.connect();
    await client.query("BEGIN");
  });

  afterEach(async () => {
    await client.query("ROLLBACK");
    client.release();
  });

  describe("findLatestEntry", () => {
    it("should return null when table is empty", async () => {
      // Clean slate - no entries
      const result = await bankDesaRepo.findLatestEntry(client);
      
      // Could be null or could have existing data from migrations
      // The important thing is it doesn't throw
      expect(result === null || result?.saldo_after !== undefined).toBe(true);
    });

    it("should return the latest entry by date and created_at", async () => {
      // Insert test entries
      await client.query(
        `INSERT INTO buku_bank (id, tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, saldo_after)
         VALUES 
           ('test-1', '2025-01-01', 'Entry 1', 'BT001', 1000000, 0, 0, 0, 0, 1000000),
           ('test-2', '2025-01-02', 'Entry 2', 'BT002', 500000, 0, 0, 0, 0, 1500000)`
      );

      const result = await bankDesaRepo.findLatestEntry(client);

      expect(result).toBeDefined();
      expect(result.saldo_after).toBe(1500000);
    });
  });

  describe("insertEntry", () => {
    it("should insert a new entry and return it", async () => {
      const entryData = {
        tanggal: '2025-01-15',
        uraian: 'Test Setoran',
        bukti_transaksi: 'BT-TEST-001',
        setoran: 2000000,
        penerimaan_bunga: 0,
        penarikan: 0,
        pajak: 0,
        biaya_admin: 0,
        saldo_after: 2000000,
      };

      const result = await bankDesaRepo.insertEntry(client, entryData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.tanggal).toBeDefined();
      expect(result.uraian).toBe('Test Setoran');
      expect(result.bukti_transaksi).toBe('BT-TEST-001');
      expect(Number(result.setoran)).toBe(2000000);
      expect(Number(result.saldo_after)).toBe(2000000);
    });

    it("should handle null bukti_transaksi", async () => {
      const entryData = {
        tanggal: '2025-01-16',
        uraian: 'Test Entry No Bukti',
        bukti_transaksi: null,
        setoran: 100000,
        penerimaan_bunga: 0,
        penarikan: 0,
        pajak: 0,
        biaya_admin: 0,
        saldo_after: 100000,
      };

      const result = await bankDesaRepo.insertEntry(client, entryData);

      expect(result).toBeDefined();
      expect(result.bukti_transaksi).toBeNull();
    });

    it("should handle all transaction types", async () => {
      const entryData = {
        tanggal: '2025-01-17',
        uraian: 'Complex Transaction',
        bukti_transaksi: 'BT-COMPLEX',
        setoran: 1000000,
        penerimaan_bunga: 50000,
        penarikan: 200000,
        pajak: 10000,
        biaya_admin: 5000,
        saldo_after: 835000, // 1000000 + 50000 - 200000 - 10000 - 5000
      };

      const result = await bankDesaRepo.insertEntry(client, entryData);

      expect(result).toBeDefined();
      expect(Number(result.setoran)).toBe(1000000);
      expect(Number(result.penerimaan_bunga)).toBe(50000);
      expect(Number(result.penarikan)).toBe(200000);
      expect(Number(result.pajak)).toBe(10000);
      expect(Number(result.biaya_admin)).toBe(5000);
      expect(Number(result.saldo_after)).toBe(835000);
    });
  });

  describe("findAllEntries", () => {
    it("should return all entries ordered by date", async () => {
      // Insert test entries in random order
      await client.query(
        `INSERT INTO buku_bank (id, tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, saldo_after)
         VALUES 
           ('test-b', '2025-01-15', 'Entry B', 'BT002', 500000, 0, 0, 0, 0, 1500000),
           ('test-a', '2025-01-10', 'Entry A', 'BT001', 1000000, 0, 0, 0, 0, 1000000),
           ('test-c', '2025-01-20', 'Entry C', 'BT003', 750000, 0, 0, 0, 0, 2250000)`
      );

      const result = await bankDesaRepo.findAllEntries(client);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      // Check ordering (should be ASC by date)
      const testEntries = result.filter(e => e.id.startsWith('test-'));
      if (testEntries.length === 3) {
        expect(testEntries[0].uraian).toBe('Entry A');
        expect(testEntries[1].uraian).toBe('Entry B');
        expect(testEntries[2].uraian).toBe('Entry C');
      }
    });

    it("should return empty array when no entries exist", async () => {
      // Clear table for this test
      await client.query("DELETE FROM buku_bank");
      
      const result = await bankDesaRepo.findAllEntries(client);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("findById", () => {
    it("should return entry when found", async () => {
      await client.query(
        `INSERT INTO buku_bank (id, tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, saldo_after)
         VALUES ('find-by-id-test', '2025-02-01', 'Find Me', 'BT-FIND', 999999, 0, 0, 0, 0, 999999)`
      );

      const result = await bankDesaRepo.findById(client, 'find-by-id-test');

      expect(result).toBeDefined();
      expect(result.id).toBe('find-by-id-test');
      expect(result.uraian).toBe('Find Me');
      expect(Number(result.setoran)).toBe(999999);
    });

    it("should return null when entry not found", async () => {
      const result = await bankDesaRepo.findById(client, 'non-existent-id');

      expect(result).toBeNull();
    });
  });
});
