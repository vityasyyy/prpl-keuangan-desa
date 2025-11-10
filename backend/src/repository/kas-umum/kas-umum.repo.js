// src/repository/kas-umum/kas-umum.repo.js
import crypto from "crypto";

export default function createKasUmumRepo(arg) {
  // Deteksi instance Pool / BoundPool / Client dari pg
  const db =
    arg?.query || arg?.connect || arg?.db?.query
      ? arg.query
        ? arg
        : arg.db
      : undefined;

  if (!db || typeof db.query !== "function") {
    console.error("[kas-umum.repo] Invalid db instance received:", arg);
    throw new Error("Invalid database instance passed to createKasUmumRepo");
  }

  const P = (i) => `$${i}`;
  // Helper untuk pencocokan bulan
  const monthBku = () =>
    `DATE_TRUNC('month', bku.tanggal) = DATE_TRUNC('month', ${P(1)}::date)`;
  const monthRaw = () =>
    `DATE_TRUNC('month', tanggal) = DATE_TRUNC('month', ${P(1)}::date)`;

  const listRAB = async () => {
    const { rows } = await db.query(`
      SELECT *
      FROM rab
      ORDER BY id
    `);
    return rows;
  };

  /**
   * Ambil daftar transaksi BKU (Buku Kas Umum)
   */
  async function listBkuRows({ monthDate, rabId, rkkId }) {
    const where = [monthBku()];
    const params = [monthDate];
    let join = "";

    if (rabId) {
      where.push(`bku.rab_id = ${P(2)}`);
      params.push(rabId);
    } else if (rkkId) {
      join = `LEFT JOIN rab r ON r.id = bku.rab_id`;
      where.push(`r.rkk_id = ${P(2)}`);
      params.push(rkkId);
    }

    const sql = `
      SELECT ROW_NUMBER() OVER (ORDER BY bku.tanggal, bku.id) AS no,
             bku.tanggal,
             ke.full_code AS kode_rekening,
             bku.uraian,
             bku.penerimaan AS pemasukan,
             bku.pengeluaran,
             bku.no_bukti,
             (bku.penerimaan - bku.pengeluaran) AS netto_transaksi,
             bku.saldo_after AS saldo
      FROM buku_kas_umum bku
      LEFT JOIN kode_ekonomi ke ON ke.id = bku.kode_ekonomi_id
      ${join}
      WHERE ${where.join(" AND ")}
      ORDER BY bku.tanggal, bku.id
    `;

    const { rows } = await db.query(sql, params);
    return rows;
  }

  /**
   * Hitung rekapitulasi total pemasukan/pengeluaran/netto BKU
   */
  async function getBkuSummary({ monthDate, rabId, rkkId }) {
    const where = [monthRaw()];
    const params = [monthDate];

    if (rabId) {
      where.push(`rab_id = ${P(2)}`);
      params.push(rabId);
    } else if (rkkId) {
      where.push(
        `EXISTS (
          SELECT 1
          FROM rab r
          WHERE r.id = buku_kas_umum.rab_id
          AND r.rkk_id = ${P(2)}
        )`
      );
      params.push(rkkId);
    }

    const sql = `
      SELECT
        COALESCE(SUM(penerimaan), 0) AS total_pemasukan,
        COALESCE(SUM(pengeluaran), 0) AS total_pengeluaran,
        COALESCE(SUM(penerimaan - pengeluaran), 0) AS total_netto
      FROM buku_kas_umum
      WHERE ${where.join(" AND ")}
    `;

    const {
      rows: [row],
    } = await db.query(sql, params);

    return row || { total_pemasukan: 0, total_pengeluaran: 0, total_netto: 0 };
  }

  /**
   * Dropdown kode fungsi — disesuaikan dgn level:
   * level 1 = Bidang, 2 = Sub-bidang, 3 = Kegiatan
   */
  const listBidang = async () => {
    const { rows } = await db.query(`
      SELECT id, full_code, uraian
      FROM kode_fungsi
      WHERE level = 'bidang'
      ORDER BY full_code
    `);
    return rows;
  };

  const listSubBidang = async (bidangId) => {
    const { rows } = await db.query(
      `
      SELECT id, full_code, uraian
      FROM kode_fungsi
      WHERE level = 'sub_bidang' AND parent_id = ${P(1)}
      ORDER BY full_code
    `,
      [bidangId]
    );
    return rows;
  };

  const listKegiatan = async (subBidangId) => {
    const { rows } = await db.query(
      `
      SELECT id, full_code, uraian
      FROM kode_fungsi
      WHERE level = 'kegiatan' AND parent_id = ${P(1)}
      ORDER BY full_code
    `,
      [subBidangId]
    );
    return rows;
  };

  /**
   * Insert data baru ke tabel Buku_Kas_Umum
   */
  const insertBku = async (data) => {
    const {
      tanggal,
      rab_id,
      kode_ekonomi_id, // ID dari tabel Kode_Ekonomi
      kode_fungsi_id, // ID dari tabel Kode_Fungsi (kegiatan)
      uraian,
      penerimaan = 0,
      pengeluaran = 0,
      no_bukti,
    } = data;

    // Validasi: tidak boleh penerimaan dan pengeluaran keduanya terisi
    if (penerimaan > 0 && pengeluaran > 0) {
      throw new Error(
        "Transaksi hanya boleh pemasukan ATAU pengeluaran, tidak keduanya"
      );
    }

    // Hitung saldo_after berdasarkan saldo terakhir dari RAB yang sama
    const lastSaldoQuery = `
      SELECT saldo_after 
      FROM Buku_Kas_Umum 
      WHERE rab_id = $1 
      ORDER BY tanggal DESC, id DESC 
      LIMIT 1
    `;
    const {
      rows: [lastRow],
    } = await db.query(lastSaldoQuery, [rab_id]);
    const saldoBefore = parseFloat(lastRow?.saldo_after) || 0;
    const saldoAfter = saldoBefore + penerimaan - pengeluaran;

    // Generate ID for new record
    const id = crypto.randomUUID();

    // Insert data baru ke tabel Buku_Kas_Umum
    const insertQuery = `
      INSERT INTO Buku_Kas_Umum (
        id,
        tanggal, 
        rab_id, 
        kode_ekonomi_id,
        kode_fungsi_id,
        uraian, 
        penerimaan, 
        pengeluaran, 
        no_bukti,
        saldo_after
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, tanggal, rab_id, kode_ekonomi_id, kode_fungsi_id, 
                uraian, penerimaan, pengeluaran, no_bukti, saldo_after
    `;

    const values = [
      id,
      tanggal,
      rab_id,
      kode_ekonomi_id,
      kode_fungsi_id,
      uraian,
      penerimaan,
      pengeluaran,
      no_bukti,
      saldoAfter,
    ];

    const {
      rows: [newRow],
    } = await db.query(insertQuery, values);

    // Get detail kode ekonomi dan kode fungsi untuk response
    const detailQuery = `
      SELECT 
        bku.*,
        ke.full_code AS kode_ekonomi_full,
        ke.uraian AS kode_ekonomi_uraian,
        kf.full_code AS kode_fungsi_full,
        kf.uraian AS kode_fungsi_uraian
      FROM Buku_Kas_Umum bku
      LEFT JOIN Kode_Ekonomi ke ON ke.id = bku.kode_ekonomi_id
      LEFT JOIN Kode_Fungsi kf ON kf.id = bku.kode_fungsi_id
      WHERE bku.id = $1
    `;

    const {
      rows: [detailRow],
    } = await db.query(detailQuery, [newRow.id]);
    return detailRow;
  };

  /**
   * Dropdown Kode Ekonomi
   */
  const listKodeEkonomi = async () => {
    const { rows } = await db.query(`
      SELECT id, full_code, uraian 
      FROM kode_ekonomi 
      ORDER BY full_code
    `);
    return rows;
  };
  const listAkun = async () => {
    const { rows } = await db.query(`
      SELECT id, full_code, uraian
      FROM kode_ekonomi
      WHERE level = 'akun'
      ORDER BY full_code
    `);
    return rows;
  };

  const listJenis = async (akunID) => {
    const { rows } = await db.query(
      `
    SELECT j.id, j.full_code, j.uraian
    FROM kode_ekonomi j
    JOIN kode_ekonomi k ON j.parent_id = k.id
    JOIN kode_ekonomi a ON k.parent_id = a.id
    WHERE j.level = 'jenis' AND a.id = ${P(1)}
    ORDER BY j.full_code
    `,
      [akunID]
    );
    return rows;
  };

  const listObjek = async (jenisID) => {
    const { rows } = await db.query(
      `
      SELECT id, full_code, uraian
      FROM kode_ekonomi
      WHERE level = 'objek' AND parent_id = ${P(1)}
      ORDER BY full_code
    `,
      [jenisID]
    );
    return rows;
  };

  /**
   * Ambil saldo terakhir. Jika rabId diberikan, ambil saldo terakhir untuk RAB tersebut,
   * jika tidak, ambil saldo terakhir secara global.
   */
  const getLastSaldo = async (rabId) => {
    let sql;
    let params = [];
    if (rabId) {
      sql = `
        SELECT saldo_after
        FROM buku_kas_umum
        WHERE rab_id = ${P(1)}
        ORDER BY tanggal DESC, id DESC
        LIMIT 1
      `;
      params = [rabId];
    } else {
      sql = `
        SELECT saldo_after
        FROM buku_kas_umum
        ORDER BY tanggal DESC, id DESC
        LIMIT 1
      `;
    }

    const { rows } = await db.query(sql, params);
    const row = rows[0];
    return row?.saldo_after ?? 0;
  };

  return {
    listRAB,
    listBkuRows,
    getBkuSummary,
    listBidang,
    listSubBidang,
    listKegiatan,
    insertBku,
    listKodeEkonomi,
    listAkun,
    listJenis,
    listObjek,
    getLastSaldo,
  };
}
