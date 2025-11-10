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
  async function getKegiatanById(id) {
    const sql = `
      SELECT id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after
      FROM buku_kas_pembantu
      WHERE id = ${P(1)}
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [id]);
    return rows[0] || null;
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

  async function updateKegiatanById(id, updates = {}) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // ambil row lama
      const qOld = `
        SELECT id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after
        FROM buku_kas_pembantu
        WHERE id = ${P(1)}
        LIMIT 1
      `;
      const { rows: oldRows } = await client.query(qOld, [id]);
      const oldRow = oldRows[0];
      if (!oldRow) {
        await client.query('ROLLBACK');
        return null;
      }

      // nilai baru (pakai nilai lama bila tidak di-provide)
      const newTanggal = updates.tanggal ?? oldRow.tanggal;
      const newUraian = updates.uraian ?? oldRow.uraian;
      const newPenerimaan = updates.penerimaan !== undefined ? Number(updates.penerimaan) : Number(oldRow.penerimaan ?? 0);
      const newPengeluaran = updates.pengeluaran !== undefined ? Number(updates.pengeluaran) : Number(oldRow.pengeluaran ?? 0);
      const newTypeEnum = updates.type_enum ?? oldRow.type_enum;

      // ambil saldo_before (saldo_after dari row sebelum row ini) berdasarkan ordering tanggal,id
      const qPrev = `
        SELECT saldo_after FROM buku_kas_pembantu
        WHERE bku_id = ${P(1)}
          AND (tanggal < ${P(2)} OR (tanggal = ${P(2)} AND id < ${P(3)}))
        ORDER BY tanggal DESC, id DESC
        LIMIT 1
      `;
      const { rows: prevRows } = await client.query(qPrev, [oldRow.bku_id, newTanggal, id]);
      const prevSaldo = prevRows.length ? Number(prevRows[0].saldo_after) : 0;

      // hitung saldo baru untuk row ini
      const newSaldoAfter = Number((prevSaldo + newPenerimaan - newPengeluaran).toFixed(2));
      const oldSaldoAfter = Number(oldRow.saldo_after ?? 0);
      const delta = Number((newSaldoAfter - oldSaldoAfter).toFixed(2));

      // update baris ini
      const qUpdate = `
        UPDATE buku_kas_pembantu
        SET tanggal = ${P(1)},
            uraian = ${P(2)},
            penerimaan = ${P(3)},
            pengeluaran = ${P(4)},
            saldo_after = ${P(5)},
            type_enum = ${P(6)}
        WHERE id = ${P(7)}
        RETURNING id, bku_id, type_enum, tanggal, uraian, penerimaan, pengeluaran, saldo_after
      `;
      const valuesUpdate = [newTanggal, newUraian, newPenerimaan, newPengeluaran, newSaldoAfter, newTypeEnum, id];
      const { rows: updatedRows } = await client.query(qUpdate, valuesUpdate);
      const updatedRow = updatedRows[0];

      // jika ada perubahan saldo, adjust semua baris berikutnya untuk bku_id yang sama
      if (delta !== 0) {
        const qAdjust = `
          UPDATE buku_kas_pembantu
          SET saldo_after = (saldo_after + ${P(1)})
          WHERE bku_id = ${P(2)}
            AND (tanggal > ${P(3)} OR (tanggal = ${P(3)} AND id > ${P(4)}))
        `;
        await client.query(qAdjust, [delta, oldRow.bku_id, newTanggal, id]);
      }

      await client.query('COMMIT');
      return updatedRow;
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (_) {}
      throw err;
    } finally {
      client.release();
    }
  }

  async function listPanjar({ page = 1, per_page = 20, bku_id, from, to, sort_by = 'tanggal', order = 'asc' }) {
    const allowedSort = ['tanggal', 'id', 'saldo_after'];
    const allowedOrder = ['asc', 'desc'];
    if (!allowedSort.includes(sort_by)) throw new Error('invalid sort_by');
    if (!allowedOrder.includes(order.toLowerCase())) throw new Error('invalid order');

    const where = [];
    const params = [];
    let idx = 1;

    if (bku_id) {
      where.push(`bku_id = $${idx++}`);
      params.push(bku_id);
    }
    if (from) {
      where.push(`tanggal >= $${idx++}`);
      params.push(from);
    }
    if (to) {
      where.push(`tanggal <= $${idx++}`);
      params.push(to);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Total data
    const countSql = `SELECT COUNT(*)::int AS total FROM buku_pembantu_panjar ${whereSql}`;
    const { rows: countRows } = await db.query(countSql, params);
    const total = countRows[0] ? Number(countRows[0].total) : 0;

    // Paging
    const offset = (page - 1) * per_page;
    const sql = `
      SELECT id, bku_id, tanggal, uraian, pemberian, pertanggungjawaban, saldo_after
      FROM buku_pembantu_panjar
      ${whereSql}
      ORDER BY ${sort_by} ${order.toUpperCase()}, id ${order.toUpperCase()}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(per_page, offset);

    const { rows } = await db.query(sql, params);
    return { rows, total };
  }

  async function deletePanjarById(id) {
    const sql = `DELETE FROM buku_pembantu_panjar WHERE id = $1 RETURNING id`;
    const { rows, rowCount } = await db.query(sql, [id]);
    return rowCount > 0;
  }

  return {
    listKegiatanTransaksi,
    getKegiatanById,
    getRingkasan,
    getAllData,
    deleteById,
    checkBkuExists,
    getLastSaldoByBkuId,
    insertKegiatan,
    updateKegiatanById,
    listPanjar,
    deletePanjarById
  };
}
