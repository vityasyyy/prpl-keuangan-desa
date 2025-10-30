export default function createRepo(db) {
  const P = (i) => `$${i}`;

  /**
   * Ambil daftar transaksi kas pembantu dengan filter dan pagination
   */
  async function listKegiatanTransaksi({ bulan, tahun, type_enum, search, page = 1, limit = 10 }) {
    console.log("params di repo:", { bulan, tahun, type_enum, search, page, limit });
    const where = [];
    const params = [];
    let idx = 1;

    if (bulan) {
      where.push(`EXTRACT(MONTH FROM tanggal) = ${P(idx)}`);
      params.push(bulan);
      idx++;
    }
    if (tahun) {
      where.push(`EXTRACT(YEAR FROM tanggal) = ${P(idx)}`);
      params.push(tahun);
      idx++;
    }
    if (type_enum) {
      where.push(`type_enum = ${P(idx)}`);
      params.push(type_enum);
      idx++;
    }
    if (search) {
      where.push(`(uraian ILIKE ${P(idx)} OR bku_id ILIKE ${P(idx)})`);
      params.push(`%${search}%`);
      idx++;
    }

    const offset = (page - 1) * limit;
    const sql = `
      SELECT id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after
      FROM buku_kas_pembantu
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY tanggal, id
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await db.query(sql, params);
    return rows;
  }

  /**
   * Hitung ringkasan bulanan kas pembantu
   */
  async function getRingkasan({ bulan, tahun, type_enum, search }) {
    const where = [];
    const params = [];
    let idx = 1;

    if (bulan) {
      where.push(`EXTRACT(MONTH FROM tanggal) = ${P(idx)}`);
      params.push(bulan);
      idx++;
    }
    if (tahun) {
      where.push(`EXTRACT(YEAR FROM tanggal) = ${P(idx)}`);
      params.push(tahun);
      idx++;
    }
    if (type_enum) {
      where.push(`type_enum = ${P(idx)}`);
      params.push(type_enum);
      idx++;
    }
    if (search) {
      where.push(`(uraian ILIKE ${P(idx)} OR bku_id ILIKE ${P(idx)})`);
      params.push(`%${search}%`);
      idx++;
    }

    const sql = `
      SELECT
        COALESCE(SUM(saldo_after), 0) AS total_bulan_ini,
        COUNT(*) AS jumlah_transaksi,
        MAX(saldo_after) AS saldo_akhir
      FROM buku_kas_pembantu
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    `;

    const { rows: [row] } = await db.query(sql, params);
    return row || { total_bulan_ini: 0, jumlah_transaksi: 0, saldo_akhir: 0 };
  }

  /**
   * Ambil semua data dari tabel buku_kas_pembantu tanpa filter
   */
  async function getAllData() {
    console.log('getAllData DIPANGGIL, db:', typeof db);
    try {
      const query = `
        SELECT * FROM buku_kas_pembantu 
        ORDER BY tanggal ASC, id ASC
      `;
      const result = await db.query(query);
      console.log('QUERY RESULT getAllData:', result);
      return result.rows;
    } catch (err) {
      console.error('ERROR getAllData:', err);
      throw err;
    }
  }

  return {
    listKegiatanTransaksi,
    getRingkasan,
    getAllData,  // expose fungsi baru
  };
}
