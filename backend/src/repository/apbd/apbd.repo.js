// src/repository/apbd/apbd.repo.js
export default function createApbdRepo(arg) {
  const db =
    arg?.query || arg?.connect || arg?.db?.query
      ? arg.query
        ? arg
        : arg.db
      : undefined;

  if (!db || typeof db.query !== "function") {
    console.error("[apbd.repo] Invalid db instance received:", arg);
    throw new Error("Invalid database instance passed to createApbdRepo");
  }

  async function listBApbdRows({ id, tahun, status }) {
    const conditions = [];
    const values = [];
    let idx = 1;

    // Join apbdes_rincian with kegiatan and apbdes to allow filtering by tahun/status
    if (id) {
      conditions.push(`r.id = $${idx++}`);
      values.push(id);
    }
    if (tahun) {
      conditions.push(`a.tahun = $${idx++}`);
      values.push(tahun);
    }
    if (status) {
      conditions.push(`a.status = $${idx++}`);
      values.push(status);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const q = `
      SELECT
        r.id,
        r.kegiatan_id,
        k.nama AS kegiatan_nama,
        a.id AS apbdes_id,
        a.tahun,
        a.status,
        r.kode_fungsi_id,
        r.kode_ekonomi_id,
        r.uraian,
        r.jumlah_anggaran,
        r.sumber_dana
      FROM apbdes_rincian r
      LEFT JOIN kegiatan k ON k.id = r.kegiatan_id
      LEFT JOIN apbdes a ON a.id = k.apbdes_id
      ${where}
      ORDER BY a.tahun DESC, r.id
    `;

    const { rows } = await db.query(q, values);
    return rows;
  }

  /**
   * Dropdown kode fungsi — disesuaikan dgn level:
   * level 1 = Bidang, 2 = Sub-bidang, 3 = Kegiatan
   */
  const listBidang = async () => {
    const { rows } = await db.query(
      `SELECT id, full_code, uraian FROM kode_fungsi WHERE level = $1 ORDER BY full_code`,
      ["bidang"]
    );
    return rows;
  };

  const listSubBidang = async (bidangId) => {
    const { rows } = await db.query(
      `SELECT id, full_code, uraian FROM kode_fungsi WHERE level = $1 AND parent_id = $2 ORDER BY full_code`,
      ["sub_bidang", bidangId]
    );
    return rows;
  };

  const listKegiatan = async (subBidangId) => {
    const { rows } = await db.query(
      `SELECT id, full_code, uraian FROM kode_fungsi WHERE level = $1 AND parent_id = $2 ORDER BY full_code`,
      ["kegiatan", subBidangId]
    );
    return rows;
  };

  /**
   * Insert data baru ke tabel apbdes_rincian
   */
  const insertBApbd = async (data) => {
    const {
      id,
      kegiatan_id,
      kode_fungsi_id, 
      kode_ekonomi_id, 
      uraian,
      jumlah_anggaran,
      sumber_dana,
    } = data;
    // insert into apbdes_rincian (schema defined in migrations)
    const insertQuery = `
      INSERT INTO apbdes_rincian (
        id, kegiatan_id, kode_fungsi_id, kode_ekonomi_id, uraian, jumlah_anggaran, sumber_dana
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, kegiatan_id, kode_fungsi_id, kode_ekonomi_id, uraian, jumlah_anggaran, sumber_dana
    `;

    const values = [
      id,
      kegiatan_id,
      kode_fungsi_id,
      kode_ekonomi_id,
      uraian,
      jumlah_anggaran,
      sumber_dana,
    ];

    const { rows: [newRow] } = await db.query(insertQuery, values);

    const detailQuery = `
      SELECT r.*, kf.full_code AS kode_fungsi_full, kf.uraian AS kode_fungsi_uraian,
             ke.full_code AS kode_ekonomi_full, ke.uraian AS kode_ekonomi_uraian
      FROM apbdes_rincian r
      LEFT JOIN kode_fungsi kf ON kf.id = r.kode_fungsi_id
      LEFT JOIN kode_ekonomi ke ON ke.id = r.kode_ekonomi_id
      WHERE r.id = $1
    `;

    const { rows: [detailRow] } = await db.query(detailQuery, [newRow.id]);
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

  const listKodeFungsi = async () => {
    const { rows } = await db.query(`SELECT id, full_code, uraian, level, parent_id FROM kode_fungsi ORDER BY full_code`);
    return rows;
  };

  const listUraian = async () => {
    const { rows } = await db.query(`SELECT DISTINCT uraian FROM apbdes_rincian ORDER BY uraian`);
    return rows.map((r) => r.uraian);
  };

  const listSumberDana = async () => {
    const { rows } = await db.query(`SELECT DISTINCT sumber_dana FROM apbdes_rincian WHERE sumber_dana IS NOT NULL ORDER BY sumber_dana`);
    return rows.map((r) => r.sumber_dana);
  };

  return {
    listBApbdRows,
    listKodeFungsi,
    listBidang,
    listSubBidang,
    listKegiatan,
    listKodeEkonomi,
    listUraian,
    listSumberDana,
    insertBApbd,
  };
}