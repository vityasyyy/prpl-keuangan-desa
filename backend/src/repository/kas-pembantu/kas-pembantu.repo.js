export default function createRepo(db) {
  const P = (i) => `$${i}`;

  /**
   * Ambil daftar transaksi kas pembantu dengan filter dan pagination
   */
  async function listKegiatanTransaksi({ bulan, tahun, type_enum, search, page = 1, limit = 10 }) {
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
    try {
      const query = `
        SELECT * FROM buku_kas_pembantu 
        ORDER BY tanggal ASC, id ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      console.error('ERROR getAllData:', err);
      throw err;
    }
  }

  /**
   * Hapus entry buku_kas_pembantu berdasarkan id
   */
  async function deleteById(id) {
    try {
      const sql = 'DELETE FROM buku_kas_pembantu WHERE id = $1';
      const result = await db.query(sql, [id]);
      if (result.rowCount > 0) {
        return { success: true, message: `Entry dengan id ${id} berhasil dihapus.` };
      } else {
        return { success: false, message: `Entry dengan id ${id} tidak ditemukan.` };
      }
    } catch (err) {
      return { success: false, message: `Terjadi error saat menghapus: ${err.message}` };
    }
  }

  async function checkBkuExists(bku_id) {
    const q = `SELECT 1 FROM buku_kas_umum WHERE id = ${P(1)} LIMIT 1`;
    const { rows } = await db.query(q, [bku_id]);
    return rows.length > 0;
  }
  async function getLastSaldoByBkuId(bku_id) {
    const q = `SELECT saldo_after FROM buku_kas_pembantu WHERE bku_id = ${P(1)} ORDER BY tanggal DESC, id DESC LIMIT 1`;
    const { rows } = await db.query(q, [bku_id]);
    if (rows.length === 0) return null;
    return Number(rows[0].saldo_after);
  }
   /**
   * Insert satu row ke buku_kas_pembantu
   * payload: { id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after }
   */
  async function insertKegiatan(payload) {
    const q = `
      INSERT INTO buku_kas_pembantu
        (id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after)
      VALUES (${P(1)},${P(2)},${P(3)},${P(4)},${P(5)},${P(6)},${P(7)},${P(8)})
      RETURNING *`;
    const values = [
      payload.id,
      payload.bku_id,
      payload.type_enum,
      payload.tanggal,
      payload.uraian,
      payload.penerimaan ?? 0,
      payload.pengeluaran ?? 0,
      payload.saldo_after
    ];
    const { rows } = await db.query(q, values);
    return rows[0];
  }
 

  return {
    listKegiatanTransaksi,
    getRingkasan,
    getAllData,
    deleteById,
    checkBkuExists,
    getLastSaldoByBkuId,
    insertKegiatan,
  };
}
