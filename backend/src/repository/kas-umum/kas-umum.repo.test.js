import { Pool } from "pg";
import createKasUmumRepo from "./kas-umum.repo.js";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.test" });
const TEST_DB_URL = process.env.DB_URL_TEST;

if (!TEST_DB_URL) {
  throw new Error("Missing DB_URL_TEST environment variable. Did you run with `pnpm test:integration:repo`?");
}

describe("KasUmumRepository (Integration)", () => {
  let pool;
  let client;
  let kasUmumRepo;
  let testRabId;
  let testKodeEkonomiId;
  let testKodeFungsiId;
  let testBidangId;
  let testSubBidangId;

  beforeAll(() => {
    pool = new Pool({ connectionString: TEST_DB_URL });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    client = await pool.connect();
    await client.query("BEGIN");
    kasUmumRepo = createKasUmumRepo(client);

    // Seed test data
    // Create APBDes first
    const apbdesRes = await client.query(
      `INSERT INTO apbdes (id, tahun, status)
       VALUES ('apbdes-test-1', 2025, 'aktif')
       RETURNING id`
    );
    const testApbdesId = apbdesRes.rows[0].id;

    // Create Kegiatan
    const kegiatanRes = await client.query(
      `INSERT INTO kegiatan (id, apbdes_id, nama, jenis)
       VALUES ('kegiatan-test-1', $1, 'Kegiatan Test', 'rutin')
       RETURNING id`,
      [testApbdesId]
    );
    const testKegiatanId = kegiatanRes.rows[0].id;

    // Create RKA
    const rkaRes = await client.query(
      `INSERT INTO rka (id, kegiatan_id, uraian, jumlah)
       VALUES ('rka-test-1', $1, 'RKA Test', 50000000)
       RETURNING id`,
      [testKegiatanId]
    );
    const testRkaId = rkaRes.rows[0].id;

    // Create RKK
    const rkkRes = await client.query(
      `INSERT INTO rkk (id, rka_id, lokasi, biaya_rkk)
       VALUES ('rkk-test-1', $1, 'Desa Test', 30000000)
       RETURNING id`,
      [testRkaId]
    );
    const testRkkId = rkkRes.rows[0].id;

    // Create RAB
    const rabRes = await client.query(
      `INSERT INTO rab (id, rkk_id, total_amount)
       VALUES ('rab-test-1', $1, 25000000)
       RETURNING id`,
      [testRkkId]
    );
    testRabId = rabRes.rows[0].id;

    // Create Kode Ekonomi hierarchy
    const akunRes = await client.query(
      `INSERT INTO kode_ekonomi (id, full_code, uraian, level, parent_id)
       VALUES ('ke-akun-1', '4', 'Pendapatan', 'akun', NULL)
       RETURNING id`
    );
    const akunId = akunRes.rows[0].id;

    const kelompokRes = await client.query(
      `INSERT INTO kode_ekonomi (id, full_code, uraian, level, parent_id)
       VALUES ('ke-kelompok-1', '4.1', 'Pendapatan Asli Desa', 'kelompok', $1)
       RETURNING id`,
      [akunId]
    );
    const kelompokId = kelompokRes.rows[0].id;

    const jenisRes = await client.query(
      `INSERT INTO kode_ekonomi (id, full_code, uraian, level, parent_id)
       VALUES ('ke-jenis-1', '4.1.1', 'Hasil Usaha Desa', 'jenis', $1)
       RETURNING id`,
      [kelompokId]
    );
    const jenisId = jenisRes.rows[0].id;

    const objekRes = await client.query(
      `INSERT INTO kode_ekonomi (id, full_code, uraian, level, parent_id)
       VALUES ('ke-objek-1', '4.1.1.01', 'BUMDes', 'objek', $1)
       RETURNING id`,
      [jenisId]
    );
    testKodeEkonomiId = objekRes.rows[0].id;

    // Create Kode Fungsi hierarchy
    const bidangRes = await client.query(
      `INSERT INTO kode_fungsi (id, full_code, uraian, level, parent_id)
       VALUES ('kf-bidang-1', '1.1', 'Bidang Penyelenggaraan', 'bidang', NULL)
       RETURNING id`
    );
    testBidangId = bidangRes.rows[0].id;

    const subBidangRes = await client.query(
      `INSERT INTO kode_fungsi (id, full_code, uraian, level, parent_id)
       VALUES ('kf-subbidang-1', '1.1.1', 'Sub Bidang Pemerintahan', 'sub_bidang', $1)
       RETURNING id`,
      [testBidangId]
    );
    testSubBidangId = subBidangRes.rows[0].id;

    const kodeFungsiKegiatanRes = await client.query(
      `INSERT INTO kode_fungsi (id, full_code, uraian, level, parent_id)
       VALUES ('kf-kegiatan-1', '1.1.1.01', 'Kegiatan Administrasi', 'kegiatan', $1)
       RETURNING id`,
      [testSubBidangId]
    );
    testKodeFungsiId = kodeFungsiKegiatanRes.rows[0].id;
  });

  afterEach(async () => {
    await client.query("ROLLBACK");
    client.release();
  });

  describe("listRAB", () => {
    it("should return list of RAB entries", async () => {
      const result = await kasUmumRepo.listRAB();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('total_amount');
    });
  });

  describe("insertBku and listBkuRows", () => {
    it("should insert a BKU entry with pemasukan", async () => {
      const bkuData = {
        tanggal: '2025-01-15',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Penerimaan ADD',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: 'BKT-001',
      };

      const result = await kasUmumRepo.insertBku(bkuData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(parseFloat(result.penerimaan)).toBe(1000000);
      expect(parseFloat(result.pengeluaran)).toBe(0);
      expect(parseFloat(result.saldo_after)).toBe(1000000);
      expect(result.no_bukti).toBe('BKT-001');
    });

    it("should insert a BKU entry with pengeluaran", async () => {
      // Insert initial balance first
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-10',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Saldo Awal',
        penerimaan: 5000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      const bkuData = {
        tanggal: '2025-01-15',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Belanja ATK',
        penerimaan: 0,
        pengeluaran: 500000,
        no_bukti: 'BKT-002',
      };

      const result = await kasUmumRepo.insertBku(bkuData);

      expect(result).toBeDefined();
      expect(parseFloat(result.pengeluaran)).toBe(500000);
      expect(parseFloat(result.saldo_after)).toBe(4500000); // 5000000 - 500000
    });

    it("should calculate saldo_after correctly based on previous transactions", async () => {
      // First transaction
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-05',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Penerimaan 1',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      // Second transaction
      const result = await kasUmumRepo.insertBku({
        tanggal: '2025-01-10',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Penerimaan 2',
        penerimaan: 2000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      expect(parseFloat(result.saldo_after)).toBe(3000000); // 1000000 + 2000000
    });

    it("should list BKU rows for a specific month", async () => {
      // Insert test data
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-15',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Test Transaction',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: 'BKT-001',
      });

      const rows = await kasUmumRepo.listBkuRows({
        monthDate: '2025-01-01',
        rabId: testRabId,
      });

      expect(rows).toBeDefined();
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBeGreaterThan(0);
      expect(rows[0]).toHaveProperty('no');
      expect(rows[0]).toHaveProperty('tanggal');
      expect(rows[0]).toHaveProperty('kode_rekening');
      expect(rows[0]).toHaveProperty('uraian');
      expect(rows[0]).toHaveProperty('pemasukan');
      expect(rows[0]).toHaveProperty('pengeluaran');
      expect(rows[0]).toHaveProperty('saldo');
    });
  });

  describe("getBkuSummary", () => {
    it("should return summary of BKU transactions", async () => {
      // Insert test transactions
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-05',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Penerimaan',
        penerimaan: 3000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      await kasUmumRepo.insertBku({
        tanggal: '2025-01-10',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Pengeluaran',
        penerimaan: 0,
        pengeluaran: 1000000,
        no_bukti: null,
      });

      const summary = await kasUmumRepo.getBkuSummary({
        monthDate: '2025-01-01',
        rabId: testRabId,
      });

      expect(summary).toBeDefined();
      expect(parseFloat(summary.total_pemasukan)).toBe(3000000);
      expect(parseFloat(summary.total_pengeluaran)).toBe(1000000);
      expect(parseFloat(summary.total_netto)).toBe(2000000);
    });

    it("should return zero values for empty month", async () => {
      const summary = await kasUmumRepo.getBkuSummary({
        monthDate: '2024-12-01',
        rabId: testRabId,
      });

      expect(summary).toBeDefined();
      expect(parseFloat(summary.total_pemasukan)).toBe(0);
      expect(parseFloat(summary.total_pengeluaran)).toBe(0);
      expect(parseFloat(summary.total_netto)).toBe(0);
    });
  });

  describe("listBidang, listSubBidang, listKegiatan", () => {
    it("should list bidang entries", async () => {
      const bidang = await kasUmumRepo.listBidang();

      expect(bidang).toBeDefined();
      expect(Array.isArray(bidang)).toBe(true);
      expect(bidang.length).toBeGreaterThan(0);
      expect(bidang[0]).toHaveProperty('id');
      expect(bidang[0]).toHaveProperty('full_code');
      expect(bidang[0]).toHaveProperty('uraian');
    });

    it("should list sub bidang for a specific bidang", async () => {
      const subBidang = await kasUmumRepo.listSubBidang(testBidangId);

      expect(subBidang).toBeDefined();
      expect(Array.isArray(subBidang)).toBe(true);
      expect(subBidang.length).toBeGreaterThan(0);
      expect(subBidang[0].id).toBe(testSubBidangId);
    });

    it("should list kegiatan for a specific sub bidang", async () => {
      const kegiatan = await kasUmumRepo.listKegiatan(testSubBidangId);

      expect(kegiatan).toBeDefined();
      expect(Array.isArray(kegiatan)).toBe(true);
      expect(kegiatan.length).toBeGreaterThan(0);
      expect(kegiatan[0].id).toBe(testKodeFungsiId);
    });
  });

  describe("listKodeEkonomi, listAkun, listJenis, listObjek", () => {
    it("should list all kode ekonomi entries", async () => {
      const kodeEkonomi = await kasUmumRepo.listKodeEkonomi();

      expect(kodeEkonomi).toBeDefined();
      expect(Array.isArray(kodeEkonomi)).toBe(true);
      expect(kodeEkonomi.length).toBeGreaterThan(0);
      expect(kodeEkonomi[0]).toHaveProperty('id');
      expect(kodeEkonomi[0]).toHaveProperty('full_code');
      expect(kodeEkonomi[0]).toHaveProperty('uraian');
    });

    it("should list akun level entries", async () => {
      const akun = await kasUmumRepo.listAkun();

      expect(akun).toBeDefined();
      expect(Array.isArray(akun)).toBe(true);
      expect(akun.length).toBeGreaterThan(0);
      expect(akun[0].full_code).toBe('4');
    });

    it("should list jenis for a specific akun", async () => {
      // Get akun ID
      const akunResult = await client.query(
        `SELECT id FROM kode_ekonomi WHERE level = 'akun' AND full_code = '4'`
      );
      const akunId = akunResult.rows[0].id;

      const jenis = await kasUmumRepo.listJenis(akunId);

      expect(jenis).toBeDefined();
      expect(Array.isArray(jenis)).toBe(true);
      expect(jenis.length).toBeGreaterThan(0);
    });

    it("should list objek for a specific jenis", async () => {
      // Get jenis ID
      const jenisResult = await client.query(
        `SELECT id FROM kode_ekonomi WHERE level = 'jenis' AND full_code = '4.1.1'`
      );
      const jenisId = jenisResult.rows[0].id;

      const objek = await kasUmumRepo.listObjek(jenisId);

      expect(objek).toBeDefined();
      expect(Array.isArray(objek)).toBe(true);
      expect(objek.length).toBeGreaterThan(0);
      expect(objek[0].id).toBe(testKodeEkonomiId);
    });
  });

  describe("getLastSaldo", () => {
    it("should return last saldo for specific RAB", async () => {
      // Insert transactions
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-05',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Transaction 1',
        penerimaan: 1000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      await kasUmumRepo.insertBku({
        tanggal: '2025-01-10',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Transaction 2',
        penerimaan: 2000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      const saldo = await kasUmumRepo.getLastSaldo(testRabId);

      expect(parseFloat(saldo)).toBe(3000000); // Last transaction's saldo_after
    });

    it("should return 0 if no transactions exist for RAB", async () => {
      // Create a new RKK and RAB with no transactions  
      const newRkaRes = await client.query(
        `INSERT INTO rka (id, kegiatan_id, uraian, jumlah)
         VALUES ('rka-empty-1', 'kegiatan-test-1', 'Empty RKA', 10000000)
         RETURNING id`
      );
      const emptyRkaId = newRkaRes.rows[0].id;

      const newRkkRes = await client.query(
        `INSERT INTO rkk (id, rka_id, lokasi, biaya_rkk)
         VALUES ('rkk-empty-1', $1, 'Empty Location', 5000000)
         RETURNING id`,
        [emptyRkaId]
      );
      const emptyRkkId = newRkkRes.rows[0].id;

      const newRabRes = await client.query(
        `INSERT INTO rab (id, rkk_id, total_amount)
         VALUES ('rab-empty-1', $1, 2500000)
         RETURNING id`,
        [emptyRkkId]
      );
      const emptyRabId = newRabRes.rows[0].id;

      const saldo = await kasUmumRepo.getLastSaldo(emptyRabId);

      expect(saldo).toBe(0);
    });

    it("should return last global saldo if no rabId provided", async () => {
      await kasUmumRepo.insertBku({
        tanggal: '2025-01-15',
        rab_id: testRabId,
        kode_ekonomi_id: testKodeEkonomiId,
        kode_fungsi_id: testKodeFungsiId,
        uraian: 'Latest Transaction',
        penerimaan: 5000000,
        pengeluaran: 0,
        no_bukti: null,
      });

      const saldo = await kasUmumRepo.getLastSaldo();

      expect(parseFloat(saldo)).toBe(5000000);
    });
  });
});
