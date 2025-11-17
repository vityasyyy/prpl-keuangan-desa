import bcrypt from "bcrypt";
import { Pool } from "pg";
import "dotenv/config";

// --- Database Configuration ---
const pool = new Pool({
  connectionString:
    process.env.DB_URL ||
    "postgresql://prpl_koma:password@localhost:5432/keuangan_desa",
});

// --- User Data ---
const users = [
  { username: "kades", full_name: "Kepala Desa", role: "kepala_desa" },
  { username: "sekdes", full_name: "Sekretaris Desa", role: "sekretaris_desa" },
  {
    username: "kaur_keuangan",
    full_name: "Kaur Keuangan",
    role: "kaur_keuangan",
  },
  {
    username: "kaur_perencanaan",
    full_name: "Kaur Perencanaan",
    role: "kaur_perencanaan",
  },
  {
    username: "kaur_tu_umum",
    full_name: "Kaur TU & Umum",
    role: "kaur_tu_umum",
  },
  {
    username: "kasi_pemerintahan",
    full_name: "Kasi Pemerintahan",
    role: "kasi_pemerintahan",
  },
  {
    username: "kasi_kesejahteraan",
    full_name: "Kasi Kesejahteraan",
    role: "kasi_kesejahteraan",
  },
  {
    username: "kasi_pelayanan",
    full_name: "Kasi Pelayanan",
    role: "kasi_pelayanan",
  },
];

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log("Starting database seeding...");

    // Begin transaction
    await client.query("BEGIN");

    // ========================
    // CLEANUP EXISTING DATA
    // ========================
    console.log("Cleaning up existing data...");

    // Delete in reverse order of dependencies
    await client.query("DELETE FROM refresh_tokens");
    await client.query("DELETE FROM buku_bank");
    await client.query("DELETE FROM buku_kas_pajak");
    await client.query("DELETE FROM buku_pembantu_panjar");
    await client.query("DELETE FROM buku_kas_pembantu");
    await client.query("DELETE FROM buku_kas_umum");
    await client.query("DELETE FROM rab_line");
    await client.query("DELETE FROM rab");
    await client.query("DELETE FROM rkk");
    await client.query("DELETE FROM rka_penarikan");
    await client.query("DELETE FROM rka");
    await client.query("DELETE FROM apbdes_rincian_penjabaran");
    await client.query("DELETE FROM apbdes_rincian");
    await client.query("DELETE FROM kegiatan");
    await client.query("DELETE FROM apbdes");
    await client.query("DELETE FROM users");
    // We assume kode_fungsi and kode_ekonomi are already populated

    console.log("✅ Cleanup completed");

    // Reset sequences for SERIAL columns
    await client.query("ALTER SEQUENCE users_user_id_seq RESTART WITH 1");
    await client.query(
      "ALTER SEQUENCE refresh_tokens_refresh_token_id_seq RESTART WITH 1"
    );

    // ========================
    // SEED USERS (with bcrypt)
    // ========================
    console.log("🌱 Starting user seed...");

    for (const u of users) {
      const plainPassword = `${u.role}_desa_6769`;
      const hashed = await bcrypt.hash(plainPassword, 10);

      const result = await client.query(
        `INSERT INTO users (username, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             full_name = EXCLUDED.full_name,
             role = EXCLUDED.role
         RETURNING user_id, username, role;`,
        [u.username, hashed, u.full_name, u.role]
      );

      const row = result.rows[0];
      console.log(`✅ Seeded user: ${row.username} (${row.role})`);
      console.log(`   → password: ${plainPassword}`);
    }
    console.log("🎉 All users seeded successfully!");

    // ========================
    // SEED APBDES DATA
    // ========================
    console.log("Seeding apbdes...");
    await client.query(`
      INSERT INTO apbdes (id, tahun, status) VALUES
      ('apb001', 2024, 'approved'),
      ('apb002', 2025, 'draft')
    `);

    console.log("Seeding kegiatan...");
    await client.query(`
      INSERT INTO kegiatan (id, apbdes_id, nama, jenis) VALUES
      ('keg001', 'apb001', 'Penyelenggaraan Pemerintahan Desa', 'rutin'),
      ('keg002', 'apb001', 'Pembangunan Jalan Desa', 'pembangunan'),
      ('keg003', 'apb001', 'Pembangunan Air Bersih', 'pembangunan'),
      ('keg004', 'apb001', 'Pemberdayaan Masyarakat', 'pemberdayaan'),
      ('keg005', 'apb002', 'Renovasi Balai Desa', 'pembangunan'),
      ('keg006', 'apb002', 'Program Kesehatan Masyarakat', 'pemberdayaan')
    `);

    // Seed apbdes_rincian (KEYS CORRECTED)
    console.log("Seeding apbdes_rincian...");
    await client.query(`
      INSERT INTO apbdes_rincian (id, kegiatan_id, kode_fungsi_id, kode_ekonomi_id, uraian, jumlah_anggaran, sumber_dana) VALUES
      ('rin001', 'keg001', '1.1.01', '5.1.1.01', 'Honorarium Kepala Desa', 12000000.00, 'ADD'),
      ('rin002', 'keg001', '1.1.02', '5.1.2.01', 'Honorarium Perangkat Desa', 36000000.00, 'ADD'),
      ('rin003', 'keg001', '1.1.04', '5.2.1.01', 'Belanja Alat Tulis Kantor', 2500000.00, 'ADD'),
      ('rin004', 'keg002', '2.3.10', '5.3.5', 'Pembangunan Jalan Desa 500m', 75000000.00, 'DD'),
      ('rin005', 'keg003', '2.4.11', '5.3.7', 'Pembangunan Sumur Bor', 25000000.00, 'DD'),
      ('rin006', 'keg004', '4.7.04', '5.2', 'Pelatihan Keterampilan Masyarakat', 15000000.00, 'ADD'),
      ('rin007', 'keg005', '1.2.03', '5.3.4', 'Renovasi Balai Desa', 50000000.00, 'DD'),
      ('rin008', 'keg006', '2.2.02', '5.2', 'Program Posyandu', 8000000.00, 'ADD')
    `);

    console.log("Seeding apbdes_rincian_penjabaran...");
    await client.query(`
      INSERT INTO apbdes_rincian_penjabaran (id, rincian_id, uraian, volume, satuan, jumlah_anggaran, sumber_dana) VALUES
      ('penj001', 'rin001', 'Honorarium Kepala Desa per bulan', 12, 'bulan', 12000000.00, 'ADD'),
      ('penj002', 'rin002', 'Honorarium 3 Perangkat Desa per bulan', 36, 'orang-bulan', 36000000.00, 'ADD'),
      ('penj003', 'rin003', 'ATK untuk kebutuhan kantor desa', 1, 'paket', 2500000.00, 'ADD'),
      ('penj004', 'rin004', 'Material dan upah pembangunan jalan', 500, 'meter', 75000000.00, 'DD'),
      ('penj005', 'rin005', 'Pembuatan sumur bor lengkap dengan pompa', 1, 'unit', 25000000.00, 'DD'),
      ('penj006', 'rin006', 'Pelatihan menjahit dan kerajinan', 4, 'kali', 15000000.00, 'ADD'),
      ('penj007', 'rin007', 'Renovasi atap dan lantai balai desa', 1, 'unit', 50000000.00, 'DD'),
      ('penj008', 'rin008', 'Operasional posyandu 4 dusun', 12, 'bulan', 8000000.00, 'ADD')
    `);

    // ========================
    // SEED PLANNING DATA (RKA, RKK, RAB)
    // ========================
    console.log("Seeding rka...");
    await client.query(`
      INSERT INTO rka (id, kegiatan_id, uraian, jumlah) VALUES
      ('rka001', 'keg002', 'Pembangunan Jalan Desa Tahap 1', 75000000.00),
      ('rka002', 'keg003', 'Pembangunan Air Bersih', 25000000.00),
      ('rka003', 'keg004', 'Program Pemberdayaan Masyarakat', 15000000.00),
      ('rka004', 'keg005', 'Renovasi Balai Desa', 50000000.00)
    `);

    console.log("Seeding rka_penarikan...");
    await client.query(`
      INSERT INTO rka_penarikan (id, rka_id, month, amount) VALUES
      ('rkap001', 'rka001', 3, 25000000.00), ('rkap002', 'rka001', 6, 25000000.00), ('rkap003', 'rka001', 9, 25000000.00),
      ('rkap004', 'rka002', 4, 12500000.00), ('rkap005', 'rka002', 8, 12500000.00),
      ('rkap006', 'rka003', 2, 5000000.00), ('rkap007', 'rka003', 5, 5000000.00), ('rkap008', 'rka003', 10, 5000000.00),
      ('rkap009', 'rka004', 7, 25000000.00), ('rkap010', 'rka004', 11, 25000000.00)
    `);

    // Seed rkk (KEYS CORRECTED)
    console.log("Seeding rkk...");
    await client.query(`
      INSERT INTO rkk (id, rka_id, bidang_fungsi_id, lokasi, volume, satuan, biaya_rkk, durasi_days, mulai, selesai, pelaksana) VALUES
      ('rkk001', 'rka001', '2.3.10', 'Jalan Utama Desa RT 01', 500, 'meter', 75000000.00, 90, '2024-03-01', '2024-05-30', 'CV Karya Bersama'),
      ('rkk002', 'rka002', '2.4.11', 'Dusun Mawar RT 02', 1, 'unit', 25000000.00, 30, '2024-04-01', '2024-04-30', 'CV Air Jernih'),
      ('rkk003', 'rka003', '4.7.04', 'Balai Desa', 4, 'kali', 15000000.00, 120, '2024-02-01', '2024-05-31', 'Pokmas Maju Bersama'),
      ('rkk004', 'rka004', '1.2.03', 'Balai Desa', 1, 'unit', 50000000.00, 60, '2024-07-01', '2024-08-30', 'CV Renovasi Jaya')
    `);

    // Seed rab (KEYS CORRECTED)
    // console.log('Seeding rab...');
    // await client.query(`
    //   INSERT INTO rab (id, rkk_id, rincian_id, kode_fungsi_id, kode_ekonomi_id, total_amount) VALUES
    //   ('rab001', 'rkk001', 'rin004', '2.3.10', '5.3.5', 75000000.00),
    //   ('rab002', 'rkk002', 'rin005', '2.4.11', '5.3.7', 25000000.00),
    //   ('rab003', 'rkk003', 'rin006', '4.7.04', '5.2', 15000000.00),
    //   ('rab004', 'rkk004', 'rin007', '1.2.03', '5.3.4', 50000000.00)
    // `);
    // Seed rab (UPDATED STRUCTURE)
    console.log("Seeding rab...");
    await client.query(`
    INSERT INTO rab (id, mulai, selesai, kode_fungsi_id, kode_ekonomi_id, total_amount, status_rab) VALUES
    ('rab001', '2024-01-15', '2024-03-15', '2.3.10','5.3.5', 75000000.00, 'disetujui'),
    ('rab002', '2024-02-01', '2024-02-28', '2.4.11','5.3.7', 25000000.00, 'diajukan'),
    ('rab003', '2024-03-01', '2024-03-20', '4.7.04','5.2', 15000000.00, 'disetujui'),
    ('rab004', '2024-04-01', '2024-05-31', '1.2.03','5.3.4', 50000000.00, 'belum diajukan')
    `);
    // Seed rab_line (KEYS CORRECTED)
    // console.log('Seeding rab_line...');
    // await client.query(`
    //   INSERT INTO rab_line (id, rab_id, uraian, volume, harga_satuan, jumlah, kode_ekonomi_id) VALUES
    //   ('rabl001', 'rab001', 'Semen 40kg', 100, 75000.00, 7500000.00, '5.3.5.03'),
    //   ('rabl002', 'rab001', 'Pasir per kubik', 50, 150000.00, 7500000.00, '5.3.5.03'),
    //   ('rabl003', 'rab001', 'Kerikil per kubik', 50, 200000.00, 10000000.00, '5.3.5.03'),
    //   ('rabl004', 'rab001', 'Upah tukang per hari', 300, 100000.00, 30000000.00, '5.3.5.02'),
    //   ('rabl005', 'rab001', 'Upah buruh per hari', 400, 50000.00, 20000000.00, '5.3.5.02'),
    //   ('rabl006', 'rab002', 'Pipa PVC 4 inch', 20, 150000.00, 3000000.00, '5.3.7.03'),
    //   ('rabl007', 'rab002', 'Pompa air submersible', 1, 8000000.00, 8000000.00, '5.3.2.10'),
    //   ('rabl008', 'rab002', 'Bor sumur per meter', 30, 300000.00, 9000000.00, '5.3.7.02'),
    //   ('rabl009', 'rab002', 'Instalasi listrik', 1, 5000000.00, 5000000.00, '5.3.8.03'),
    //   ('rabl010', 'rab003', 'Konsumsi pelatihan', 48, 25000.00, 1200000.00, '5.2.1.06'),
    //   ('rabl011', 'rab003', 'Honorarium instruktur', 12, 500000.00, 6000000.00, '5.2.2.04'),
    //   ('rabl012', 'rab003', 'Bahan pelatihan', 1, 7800000.00, 7800000.00, '5.2.1.07'),
    //   ('rabl013', 'rab004', 'Genteng per buah', 500, 15000.00, 7500000.00, '5.3.4.03'),
    //   ('rabl014', 'rab004', 'Keramik lantai per m2', 100, 150000.00, 15000000.00, '5.3.4.03'),
    //   ('rabl015', 'rab004', 'Cat tembok', 20, 85000.00, 1700000.00, '5.3.4.03'),
    //   ('rabl016', 'rab004', 'Upah tukang renovasi', 120, 120000.00, 14400000.00, '5.3.4.02'),
    //   ('rabl017', 'rab004', 'Material lain-lain', 1, 11400000.00, 11400000.00, '5.3.4.03')
    // `);
    // Seed rab_line (UPDATED STRUCTURE)
    console.log("Seeding rab_line...");
    await client.query(`
  INSERT INTO rab_line (id, rab_id, uraian, volume, harga_satuan, jumlah, satuan) VALUES
  ('rabl001', 'rab001', 'Semen 40kg', 100.00, 75000.00, 7500000.00, 'sak'),
  ('rabl002', 'rab001', 'Pasir', 50.00, 150000.00, 7500000.00, 'm3'),
  ('rabl003', 'rab001', 'Kerikil', 50.00, 200000.00, 10000000.00, 'm3'),
  ('rabl004', 'rab001', 'Upah tukang', 300.00, 100000.00, 30000000.00, 'HOK'),
  ('rabl005', 'rab001', 'Upah buruh', 400.00, 50000.00, 20000000.00, 'HOK'),
  ('rabl006', 'rab002', 'Pipa PVC 4 inch', 20.00, 150000.00, 3000000.00, 'batang'),
  ('rabl007', 'rab002', 'Pompa air submersible', 1.00, 8000000.00, 8000000.00, 'unit'),
  ('rabl008', 'rab002', 'Bor sumur', 30.00, 300000.00, 9000000.00, 'meter'),
  ('rabl009', 'rab002', 'Instalasi listrik', 1.00, 5000000.00, 5000000.00, 'paket'),
  ('rabl010', 'rab003', 'Konsumsi pelatihan', 48.00, 25000.00, 1200000.00, 'orang'),
  ('rabl011', 'rab003', 'Honorarium instruktur', 12.00, 500000.00, 6000000.00, 'jam'),
  ('rabl012', 'rab003', 'Bahan pelatihan', 1.00, 7800000.00, 7800000.00, 'paket'),
  ('rabl013', 'rab004', 'Genteng', 500.00, 15000.00, 7500000.00, 'buah'),
  ('rabl014', 'rab004', 'Keramik lantai', 100.00, 150000.00, 15000000.00, 'm2'),
  ('rabl015', 'rab004', 'Cat tembok', 20.00, 85000.00, 1700000.00, 'kaleng'),
  ('rabl016', 'rab004', 'Upah tukang renovasi', 120.00, 120000.00, 14400000.00, 'HOK'),
  ('rabl017', 'rab004', 'Material lain-lain', 1.00, 11400000.00, 11400000.00, 'paket')
`);

    // ========================
    // SEED EXECUTION DATA (Buku Kas)
    // ========================
    console.log("Seeding buku_kas_umum...");
    await client.query(`
      INSERT INTO buku_kas_umum (id, tanggal, rab_id, kode_ekonomi_id, kode_fungsi_id, uraian, no_bukti, penerimaan, pengeluaran, saldo_after) VALUES
      ('bku001', '2024-01-01', NULL, '4.2.3.01', '1', 'Penerimaan ADD Tahap I', 'TRM001', 100000000.00, 0.00, 100000000.00),
      ('bku002', '2024-01-01', NULL, '4.2.1.01', '1', 'Penerimaan DD Tahap I', 'TRM002', 200000000.00, 0.00, 300000000.00),
      ('bku003', '2024-01-15', NULL, '5.1.1.01', '1.1.01', 'Bayar Honorarium Kepala Desa Januari', 'BKL001', 0.00, 1000000.00, 299000000.00),
      ('bku004', '2024-01-15', NULL, '5.1.2.01', '1.1.02', 'Bayar Honorarium Perangkat Desa Januari', 'BKL002', 0.00, 3000000.00, 296000000.00),
      ('bku005', '2024-02-01', NULL, '5.2.1.01', '1.1.04', 'Belanja ATK Februari', 'BKL003', 0.00, 500000.00, 295500000.00),
      ('bku006', '2024-03-01', 'rab001', '5.3.5', '2.3.10', 'Pembayaran Material Jalan Tahap 1', 'BKL004', 0.00, 25000000.00, 270500000.00),
      ('bku007', '2024-04-01', 'rab002', '5.3.7', '2.4.11', 'Pembayaran Bor Sumur', 'BKL005', 0.00, 12500000.00, 258000000.00),
      ('bku008', '2024-04-01', NULL, '4.2.3.01', '1', 'Penerimaan ADD Tahap II', 'TRM003', 100000000.00, 0.00, 358000000.00),
      ('bku009', '2024-05-01', 'rab003', '5.2', '4.7.04', 'Pembayaran Pelatihan Masyarakat', 'BKL006', 0.00, 5000000.00, 353000000.00),
      ('bku010', '2024-06-01', 'rab001', '5.3.5', '2.3.10', 'Pembayaran Upah Jalan Tahap 2', 'BKL007', 0.00, 25000000.00, 328000000.00)
    `);

    console.log("Seeding buku_kas_pembantu...");
    await client.query(`
      INSERT INTO buku_kas_pembantu (id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after) VALUES
      ('bkp001', 'bku003', 'honorarium', '2024-01-15', 'Honorarium Kepala Desa Januari', 0.00, 1000000.00, 1000000.00),
      ('bkp002', 'bku004', 'honorarium', '2024-01-15', 'Honorarium Perangkat Desa Januari', 0.00, 3000000.00, 4000000.00),
      ('bkp003', 'bku005', 'operasional', '2024-02-01', 'ATK untuk kantor desa', 0.00, 500000.00, 4500000.00),
      ('bkp004', 'bku006', 'pembangunan', '2024-03-01', 'Material pembangunan jalan', 0.00, 25000000.00, 29500000.00),
      ('bkp005', 'bku007', 'pembangunan', '2024-04-01', 'Biaya pembuatan sumur bor', 0.00, 12500000.00, 42000000.00),
      ('bkp006', 'bku009', 'pemberdayaan', '2024-05-01', 'Biaya pelatihan masyarakat', 0.00, 5000000.00, 47000000.00),
      ('bkp007', 'bku010', 'pembangunan', '2024-06-01', 'Upah pembangunan jalan', 0.00, 25000000.00, 72000000.00)
    `);

    // Seed buku_kas_pajak (KEYS CORRECTED)
    console.log("Seeding buku_kas_pajak...");
    await client.query(`
      INSERT INTO buku_kas_pajak (id, bku_id, tanggal, uraian, pemotongan, penyetoran, saldo_after) VALUES
      ('bkpj001', 'bku004', '2024-01-15', 'PPh 21 Honorarium Januari', 150000.00, 0.00, 150000.00),
      ('bkpj002', NULL, '2024-02-10', 'Setor PPh 21 Januari', 0.00, 150000.00, 0.00),
      ('bkpj003', 'bku004', '2024-02-15', 'PPh 21 Honorarium Februari', 150000.00, 0.00, 150000.00),
      ('bkpj004', NULL, '2024-03-10', 'Setor PPh 21 Februari', 0.00, 150000.00, 0.00),
      ('bkpj005', 'bku006', '2024-03-15', 'PPh 23 Jasa Konstruksi', 1250000.00, 0.00, 1250000.00),
      ('bkpj006', NULL, '2024-04-10', 'Setor PPh 23 Maret', 0.00, 1250000.00, 0.00),
      ('bkpj007', 'bku004', '2024-04-15', 'PPh 21 Honorarium April', 150000.00, 0.00, 150000.00),
      ('bkpj008', NULL, '2024-05-10', 'Setor PPh 21 April', 0.00, 150000.00, 0.00)
    `);

    // Seed buku_bank (KEYS CORRECTED)
    console.log("Seeding buku_bank...");
    await client.query(`
      INSERT INTO buku_bank (id, bku_id, tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, saldo_after) VALUES
      ('bb001', NULL, '2024-01-01', 'Saldo Awal Tahun', 'SA2024', 0.00, 0.00, 0.00, 0.00, 0.00, 50000000.00),
      ('bb002', 'bku001', '2024-01-02', 'Transfer ADD Tahap I', 'TF001', 100000000.00, 0.00, 0.00, 0.00, 2500.00, 149997500.00),
      ('bb003', 'bku002', '2024-01-03', 'Transfer DD Tahap I', 'TF002', 200000000.00, 0.00, 0.00, 0.00, 2500.00, 349995000.00),
      ('bb004', 'bku003', '2024-01-15', 'Tarik untuk Operasional', 'TK001', 0.00, 0.00, 10000000.00, 0.00, 5000.00, 339990000.00),
      ('bb005', NULL, '2024-02-01', 'Bunga Bank Januari', 'BG001', 0.00, 425000.00, 0.00, 0.00, 0.00, 340415000.00),
      ('bb006', 'bku006', '2024-02-10', 'Tarik untuk Pembangunan', 'TK002', 0.00, 0.00, 50000000.00, 0.00, 5000.00, 290410000.00),
      ('bb007', NULL, '2024-03-01', 'Bunga Bank Februari', 'BG002', 0.00, 363000.00, 0.00, 0.00, 0.00, 290773000.00),
      ('bb008', 'bku008', '2024-04-01', 'Transfer ADD Tahap II', 'TF003', 100000000.00, 0.00, 0.00, 0.00, 2500.00, 390770500.00),
      ('bb009', NULL, '2024-04-01', 'Bunga Bank Maret', 'BG003', 0.00, 364000.00, 0.00, 0.00, 0.00, 391134500.00),
      ('bb010', 'bku009', '2024-04-15', 'Tarik untuk Pelatihan', 'TK003', 0.00, 0.00, 15000000.00, 0.00, 5000.00, 376129500.00)
    `);

    console.log("Seeding buku_pembantu_panjar...");
    await client.query(`
      INSERT INTO buku_pembantu_panjar (id, bku_id, tanggal, uraian, pemberian, pertanggungjawaban, saldo_after) VALUES
      ('panjar001', 'bku005', '2024-02-01', 'Panjar untuk Belanja ATK Februari', 500000.00, 0.00, 500000.00),
      ('panjar002', 'bku005', '2024-02-03', 'Pertanggungjawaban Belanja ATK (SPJ)', 0.00, 500000.00, 0.00),
      ('panjar003', 'bku009', '2024-04-30', 'Panjar untuk Persiapan Pelatihan Masyarakat', 1500000.00, 0.00, 1500000.00),
      ('panjar004', 'bku009', '2024-05-02', 'Pertanggungjawaban Panjar Pelatihan', 0.00, 1500000.00, 0.00)
    `);

    // Commit transaction
    await client.query("COMMIT");
    console.log("✅ Database seeding completed successfully!");

    // Display summary
    console.log("\n📊 Seeding Summary:");
    console.log(`- users: ${users.length} records`);
    console.log("- apbdes: 2 records");
    console.log("- kegiatan: 6 records");
    console.log("- apbdes_rincian: 8 records");
    console.log("- apbdes_rincian_penjabaran: 8 records");
    console.log("- rka: 4 records");
    console.log("- rka_penarikan: 10 records");
    console.log("- rkk: 4 records");
    console.log("- rab: 4 records");
    console.log("- rab_line: 17 records");
    console.log("- buku_kas_umum: 10 records");
    console.log("- buku_kas_pembantu: 7 records");
    console.log("- buku_kas_pajak: 8 records");
    console.log("- buku_bank: 10 records");
    console.log("- buku_pembantu_panjar: 4 records");
    console.log("\n🎉 All tables have been populated with sample data!");
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK");
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log("🌱 Starting database seeding process...");
    console.log("📅 Date:", new Date().toISOString());

    // Test database connection
    const testClient = await pool.connect();
    await testClient.query("SELECT 1");
    testClient.release();
    console.log("✅ Database connection successful");

    // Run seeding
    await seedDatabase();
  } catch (error) {
    console.error("💥 Seeding failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the main function
main();
