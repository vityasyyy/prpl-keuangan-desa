import { logError } from "../../common/logger/logger.js";

export default function createRepo(db) {
  const P = (i) => `$${i}`;

  /**
   * Ambil daftar transaksi kas pembantu dengan filter dan pagination
   */

  async function listKegiatanTransaksi({
    bulan,
    tahun,
    type_enum,
    search,
    page = 1,
    limit = 10,
  }) {
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
      SELECT id, bku_id, type_enum, tanggal, uraian, no_bukti,
        penerimaan_bendahara, penerimaan_swadaya,
        pengeluaran_barang_dan_jasa, pengeluaran_modal, saldo_after
      FROM buku_kas_pembantu
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY tanggal, id
      LIMIT ${limit} OFFSET ${offset}
    `;

    const { rows } = await db.query(sql, params);
    return rows;
  }

  async function getKegiatanById(id) {
    const sql = `
      SELECT id, bku_id, type_enum, tanggal, uraian, no_bukti,
        penerimaan_bendahara, penerimaan_swadaya,
        pengeluaran_barang_dan_jasa, pengeluaran_modal, saldo_after
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
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
    `;

    const {
      rows: [row],
    } = await db.query(sql, params);
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
      logError("ERROR in getAllData():", err);
      throw err;
    }
  }

  /**
   * Hapus entry buku_kas_pembantu berdasarkan id
   */
  async function deleteById(id) {
    try {
      const sql = "DELETE FROM buku_kas_pembantu WHERE id = $1";
      const result = await db.query(sql, [id]);
      if (result.rowCount > 0) {
        return {
          success: true,
          message: `Entry dengan id ${id} berhasil dihapus.`,
        };
      } else {
        return {
          success: false,
          message: `Entry dengan id ${id} tidak ditemukan.`,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: `Terjadi error saat menghapus: ${err.message}`,
      };
    }
  }

  async function checkBkuExists(bku_id) {
    const q = `SELECT 1 FROM buku_kas_umum WHERE id = ${P(1)} LIMIT 1`;
    const { rows } = await db.query(q, [bku_id]);
    return rows.length > 0;
  }
  
  async function insertKegiatan(payload) {
    const q = `
      INSERT INTO buku_kas_pembantu
        (id, bku_id, type_enum, tanggal, uraian, no_bukti,
        penerimaan_bendahara, penerimaan_swadaya,
        pengeluaran_barang_dan_jasa, pengeluaran_modal, saldo_after)
      VALUES (${P(1)},${P(2)},${P(3)},${P(4)},${P(5)},${P(6)},
              ${P(7)},${P(8)},${P(9)},${P(10)},${P(11)})
      RETURNING *
    `;
    const values = [
      payload.id,
      payload.bku_id,
      payload.type_enum,
      payload.tanggal,
      payload.uraian,
      payload.no_bukti,
      payload.penerimaan_bendahara ?? 0,
      payload.penerimaan_swadaya ?? 0,
      payload.pengeluaran_barang_dan_jasa ?? 0,
      payload.pengeluaran_modal ?? 0,
      payload.saldo_after,
    ];
    const { rows } = await db.query(q, values);
    return rows[0];
  }

  async function updateKegiatanById(id, updates = {}) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // ambil row lama
      const qOld = `
        SELECT id, bku_id, type_enum, tanggal, uraian, no_bukti,
          penerimaan_bendahara, penerimaan_swadaya,
          pengeluaran_barang_dan_jasa, pengeluaran_modal, saldo_after
        FROM buku_kas_pembantu
        WHERE id = ${P(1)}
        LIMIT 1
      `;
      const { rows: oldRows } = await client.query(qOld, [id]);
      const oldRow = oldRows[0];
      if (!oldRow) {
        await client.query("ROLLBACK");
        return null;
      }

      // nilai baru (pakai nilai lama bila tidak di-provide)
      const newTanggal = updates.tanggal ?? oldRow.tanggal;
      const newUraian = updates.uraian ?? oldRow.uraian;
      const newNoBukti = updates.no_bukti ?? oldRow.no_bukti;
      const newPenerimaanBendahara =
        updates.penerimaan_bendahara !== undefined
          ? Number(updates.penerimaan_bendahara)
          : Number(oldRow.penerimaan_bendahara ?? 0);
      const newPenerimaanSwadaya =
        updates.penerimaan_swadaya !== undefined
          ? Number(updates.penerimaan_swadaya)
          : Number(oldRow.penerimaan_swadaya ?? 0);
      const newPengeluaranBarangJasa =
        updates.pengeluaran_barang_dan_jasa !== undefined
          ? Number(updates.pengeluaran_barang_dan_jasa)
          : Number(oldRow.pengeluaran_barang_dan_jasa ?? 0);
      const newPengeluaranModal =
        updates.pengeluaran_modal !== undefined
          ? Number(updates.pengeluaran_modal)
          : Number(oldRow.pengeluaran_modal ?? 0);
      const newTypeEnum = updates.type_enum ?? oldRow.type_enum;

      // ambil saldo_before (saldo_after dari row sebelum row ini) berdasarkan ordering tanggal,id
      const qPrev = `
        SELECT saldo_after FROM buku_kas_pembantu
        WHERE bku_id = ${P(1)}
          AND (tanggal < ${P(2)} OR (tanggal = ${P(2)} AND id < ${P(3)}))
        ORDER BY tanggal DESC, id DESC
        LIMIT 1
      `;
      const { rows: prevRows } = await client.query(qPrev, [
        oldRow.bku_id,
        newTanggal,
        id,
      ]);
      const prevSaldo = prevRows.length ? Number(prevRows[0].saldo_after) : 0;

      // hitung saldo baru untuk row ini
      const newSaldoAfter = Number(
        (prevSaldo + newPenerimaanBendahara + newPenerimaanSwadaya - newPengeluaranBarangJasa - newPengeluaranModal).toFixed(2)
      );
      const oldSaldoAfter = Number(oldRow.saldo_after ?? 0);
      const delta = Number((newSaldoAfter - oldSaldoAfter).toFixed(2));

      // update baris ini
      const qUpdate = `
        UPDATE buku_kas_pembantu
        SET tanggal = ${P(1)},
            uraian = ${P(2)},
            no_bukti = ${P(3)},
            penerimaan_bendahara = ${P(4)},
            penerimaan_swadaya = ${P(5)},
            pengeluaran_barang_dan_jasa = ${P(6)},
            pengeluaran_modal = ${P(7)},
            saldo_after = ${P(8)},
            type_enum = ${P(9)}
        WHERE id = ${P(10)}
        RETURNING id, bku_id, type_enum, tanggal, uraian, no_bukti,
          penerimaan_bendahara, penerimaan_swadaya,
          pengeluaran_barang_dan_jasa, pengeluaran_modal, saldo_after
      `;
      const valuesUpdate = [
        newTanggal,
        newUraian,
        newNoBukti,
        newPenerimaanBendahara,
        newPenerimaanSwadaya,
        newPengeluaranBarangJasa,
        newPengeluaranModal,
        newSaldoAfter,
        newTypeEnum,
        id,
      ];
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

      await client.query("COMMIT");
      return updatedRow;
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch (_) {}
      throw err;
    } finally {
      client.release();
    }
  }


  async function getAllKasPanjar() {  // khusus untuk export semua data ke excel
    try {
      const query = `
        SELECT * FROM buku_pembantu_panjar
        ORDER BY tanggal ASC, id ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      logError("ERROR in getAllKasPanjar():", err);
      throw err;
    }
  }
  async function listPanjar({
    page = 1,
    per_page = 20,
    bku_id,
    from,
    to,
    sort_by = "tanggal",
    order = "asc",
  }) {
    const allowedSort = ["tanggal", "id", "saldo_after"];
    const allowedOrder = ["asc", "desc"];
    if (!allowedSort.includes(sort_by)) throw new Error("invalid sort_by");
    if (!allowedOrder.includes(order.toLowerCase()))
      throw new Error("invalid order");

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

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total data
    const countSql = `SELECT COUNT(*)::int AS total FROM buku_pembantu_panjar ${whereSql}`;
    const { rows: countRows } = await db.query(countSql, params);
    const total = countRows[0] ? Number(countRows[0].total) : 0;

    // Paging
    const offset = (page - 1) * per_page;
    const sql = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemberian, pertanggungjawaban, saldo_after
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

  async function getPanjarById(id) {
    const sql = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemberian, pertanggungjawaban, saldo_after
      FROM buku_pembantu_panjar
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [id]);
    return rows[0] ?? null;
  }

  async function insertPanjar(payload) {
    const sql = `
      INSERT INTO buku_pembantu_panjar
        (id, bku_id, tanggal, uraian, no_bukti, pemberian, pertanggungjawaban, saldo_after)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, bku_id, tanggal, uraian, no_bukti, pemberian, pertanggungjawaban, saldo_after
    `;
    const values = [
      payload.id,
      payload.bku_id,
      payload.tanggal,
      payload.uraian,
      payload.no_bukti,
      payload.pemberian ?? 0,
      payload.pertanggungjawaban ?? 0,
      payload.saldo_after ?? 0,
    ];
    const { rows } = await db.query(sql, values);
    return rows[0];
  }

  async function updatePanjarById(id, updates) {
    // ambil row lama
    const qOld = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemberian, pertanggungjawaban, saldo_after
      FROM buku_pembantu_panjar
      WHERE id = $1
      LIMIT 1
    `;
    const { rows: oldRows } = await db.query(qOld, [id]);
    const oldRow = oldRows[0];
    if (!oldRow) return null;

    // tentukan nilai baru (pakai nilai lama kalau tidak disediakan)
    const newBkuId = updates.bku_id ?? oldRow.bku_id;
    const newTanggal = updates.tanggal ?? oldRow.tanggal;
    const newUraian = updates.uraian ?? oldRow.uraian;
    const newNoBukti = updates.no_bukti ?? oldRow.no_bukti;
    const newPemberian =
      updates.pemberian !== undefined
        ? Number(updates.pemberian)
        : Number(oldRow.pemberian ?? 0);
    const newPertanggungjawaban =
      updates.pertanggungjawaban !== undefined
        ? Number(updates.pertanggungjawaban)
        : Number(oldRow.pertanggungjawaban ?? 0);
    const newSaldoAfter =
      updates.saldo_after !== undefined
        ? Number(updates.saldo_after)
        : newPemberian - newPertanggungjawaban;
    

    const qUpdate = `
      UPDATE buku_pembantu_panjar
      SET bku_id = $1,
          tanggal = $2,
          uraian = $3,
          no_bukti = $4,
          pemberian = $5,
          pertanggungjawaban = $6,
          saldo_after = $7
      WHERE id = $8
      RETURNING id, bku_id, tanggal, uraian, pemberian, pertanggungjawaban, saldo_after
    `;
    const values = [
      newBkuId,
      newTanggal,
      newUraian,
      newNoBukti,
      newPemberian,
      newPertanggungjawaban,
      newSaldoAfter,
      id,
    ];
    const { rows: updatedRows } = await db.query(qUpdate, values);
    return updatedRows[0] ?? null;
  }

  // =========================
  // BUKU KAS PAJAK (buku_kas_pajak)
  // =========================
  
  async function getAllKasPajak() {  // khusus untuk export semua data ke excel
    try {
      const query = `
        SELECT * FROM buku_kas_pajak
        ORDER BY tanggal ASC, id ASC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      logError("ERROR in getAllKasPajak():", err);
      throw err;
    }
  }

  async function listPajak({
    page = 1,
    per_page = 20,
    bku_id,
    from,
    to,
    sort_by = "tanggal",
    order = "asc",
  }) {
    const allowedSort = ["tanggal", "id", "saldo_after"];
    const allowedOrder = ["asc", "desc"];

    if (!allowedSort.includes(sort_by)) throw new Error("invalid sort_by");
    if (!allowedOrder.includes(order.toLowerCase()))
      throw new Error("invalid order");

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

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total data
    const countSql = `SELECT COUNT(*)::int AS total FROM buku_kas_pajak ${whereSql}`;
    const { rows: countRows } = await db.query(countSql, params);
    const total = countRows[0] ? Number(countRows[0].total) : 0;

    // Paging
    const offset = (page - 1) * per_page;
    const sql = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after
      FROM buku_kas_pajak
      ${whereSql}
      ORDER BY ${sort_by} ${order.toUpperCase()}, id ${order.toUpperCase()}
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(per_page, offset);

    const { rows } = await db.query(sql, params);
    return { rows, total };
  }

  async function getPajakById(id) {
    const sql = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after
      FROM buku_kas_pajak
      WHERE id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [id]);
    return rows[0] ?? null;
  }

  async function deletePajakById(id) {
    const sql = `DELETE FROM buku_kas_pajak WHERE id = $1 RETURNING id`;
    const { rowCount } = await db.query(sql, [id]);
    return rowCount > 0;
  }

  async function insertPajak(payload) {
    const sql = `
      INSERT INTO buku_kas_pajak
        (id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after
    `;
    const values = [
      payload.id,
      payload.bku_id ?? null,
      payload.tanggal,
      payload.uraian,
      payload.no_bukti ?? null,
      payload.pemotongan ?? 0,
      payload.penyetoran ?? 0,
      payload.saldo_after ?? 0,
    ];
    const { rows } = await db.query(sql, values);
    return rows[0];
  }

  async function updatePajakById(id, updates) {
    // ambil row lama
    const qOld = `
      SELECT id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after
      FROM buku_kas_pajak
      WHERE id = $1
      LIMIT 1
    `;
    const { rows: oldRows } = await db.query(qOld, [id]);
    const oldRow = oldRows[0];
    if (!oldRow) return null;
    
    // tentukan nilai baru (pakai nilai lama kalau tidak disediakan)
    const newBkuId = updates.bku_id ?? oldRow.bku_id;
    const newTanggal = updates.tanggal ?? oldRow.tanggal;
    const newUraian = updates.uraian ?? oldRow.uraian;
    const newNoBukti = updates.no_bukti !== undefined ? updates.no_bukti : oldRow.no_bukti;
    const newPemotongan =
      updates.pemotongan !== undefined
        ? Number(updates.pemotongan)
        : Number(oldRow.pemotongan ?? 0);
    const newPenyetoran =
      updates.penyetoran !== undefined
        ? Number(updates.penyetoran)
        : Number(oldRow.penyetoran ?? 0);
    const newSaldoAfter =
      updates.saldo_after !== undefined
        ? Number(updates.saldo_after)
        : newPemotongan - newPenyetoran;
    
    const qUpdate = `
      UPDATE buku_kas_pajak
      SET bku_id = $1,
          tanggal = $2,
          uraian = $3,
          no_bukti = $4,
          pemotongan = $5,
          penyetoran = $6,
          saldo_after = $7
      WHERE id = $8
      RETURNING id, bku_id, tanggal, uraian, no_bukti, pemotongan, penyetoran, saldo_after
    `;
    const values = [
      newBkuId,
      newTanggal,
      newUraian,
      newNoBukti,
      newPemotongan,
      newPenyetoran,
      newSaldoAfter,
      id,
    ];
    const { rows: updatedRows } = await db.query(qUpdate, values);
    return updatedRows[0] ?? null;
  }

  // Fetch kode_fungsi (categories) hierarchically
  async function getKodeFungsi(parentId = null) {
    let sql = `
      SELECT id, full_code, uraian, level, parent_id
      FROM kode_fungsi
    `;
    const params = [];

    if (parentId === null) {
      sql += ` WHERE level = 'bidang' ORDER BY id`;
    } else {
      sql += ` WHERE parent_id = $1 ORDER BY id`;
      params.push(parentId);
    }

    const { rows } = await db.query(sql, params);
    return rows;
  }

  async function getBKUidByKodeFungsi(kode) {
    const sql = `
      SELECT id
      FROM buku_kas_umum
      WHERE kode_fungsi_id = $1
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [kode]);
    if (rows.length === 0) return null; // maka BKU yang memiliki kode_fungsi tersebut belum ada
    return rows[0].id;
  }

  return {
    listKegiatanTransaksi,
    getKegiatanById,
    getRingkasan,
    getAllData,
    deleteById,
    checkBkuExists,
    insertKegiatan,
    updateKegiatanById,

    getAllKasPanjar,
    listPanjar,
    deletePanjarById,
    getPanjarById,
    insertPanjar,
    updatePanjarById,

    getAllKasPajak,
    listPajak,
    getPajakById,
    deletePajakById,
    insertPajak,
    updatePajakById,
    getKodeFungsi,
    getBKUidByKodeFungsi
  };
}
