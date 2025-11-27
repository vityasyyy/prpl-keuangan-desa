export default function createRabRepo(db) {
  async function getKodeRekeningBidang() {
    try {
      const { rows } = await db.query(`
        SELECT id, full_code AS kode, uraian
        FROM kode_fungsi
        WHERE level = 'bidang'
        ORDER BY full_code
      `);
      return rows;
    } catch (err) {
      console.error("ERROR getKodeRekeningBidang:", err);
      throw err;
    }
  }

  async function getKodeRekeningSubBidang(bidangId) {
    try {
      const { rows } = await db.query(
        `
        SELECT id, full_code AS kode, uraian
        FROM kode_fungsi
        WHERE level = 'sub_bidang' AND parent_id = $1
        ORDER BY full_code
      `,
        [bidangId]
      );
      return rows;
    } catch (err) {
      console.error("ERROR getKodeRekeningSubBidang:", err);
      throw err;
    }
  }

  async function getKodeRekeningKegiatan(subBidangId) {
    try {
      const { rows } = await db.query(
        `
        SELECT id, full_code AS kode, uraian
        FROM kode_fungsi
        WHERE level = 'kegiatan' AND parent_id = $1
        ORDER BY full_code
      `,
        [subBidangId]
      );
      return rows;
    } catch (err) {
      console.error("ERROR getKodeRekeningKegiatan:", err);
      throw err;
    }
  }

  async function getKodeEkonomiAkun() {
    try {
      const { rows } = await db.query(`
        SELECT id, full_code AS kode, uraian
        FROM kode_ekonomi
        WHERE level = 'akun'
        ORDER BY full_code
      `);
      return rows;
    } catch (err) {
      console.error("ERROR getKodeEkonomiAkun:", err);
      throw err;
    }
  }

  async function getKodeEkonomiKelompok(akunId) {
    try {
      const { rows } = await db.query(
        `
        SELECT id, full_code AS kode, uraian
        FROM kode_ekonomi
        WHERE level = 'kelompok' AND parent_id = $1
        ORDER BY full_code
      `,
        [akunId]
      );
      return rows;
    } catch (err) {
      console.error("ERROR getKodeEkonomiKelompok:", err);
      throw err;
    }
  }

  async function getKodeEkonomiJenis(akunId) {
    try {
      const { rows } = await db.query(
        `
        SELECT id, full_code AS kode, uraian
        FROM kode_ekonomi
        WHERE level = 'jenis' AND parent_id = $1
        ORDER BY full_code
      `,
        [akunId]
      );
      return rows;
    } catch (err) {
      console.error("ERROR getKodeEkonomiJenis:", err);
      throw err;
    }
  }

  async function getKodeEkonomiObjek(jenisId) {
    try {
      const { rows } = await db.query(
        `
        SELECT id, full_code AS kode, uraian
        FROM kode_ekonomi
        WHERE level = 'objek' AND parent_id = $1
        ORDER BY full_code
      `,
        [jenisId]
      );
      return rows;
    } catch (err) {
      console.error("ERROR getKodeEkonomiObjek:", err);
      throw err;
    }
  }
  async function getKodeFungsiById(kodeFungsiId) {
    try {
      const { rows } = await db.query(
        `SELECT id, full_code, uraian, level FROM kode_fungsi WHERE id = $1`,
        [kodeFungsiId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("ERROR getKodeFungsiById:", err);
      throw err;
    }
  }

  async function getKodeEkonomiById(kodeEkonomiId) {
    try {
      const { rows } = await db.query(
        `SELECT id, full_code, uraian, level FROM kode_ekonomi WHERE id = $1`,
        [kodeEkonomiId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("ERROR getKodeEkonomiById:", err);
      throw err;
    }
  }
  async function getRAByear() {
    const { rows } = await db.query(`
    SELECT DISTINCT DATE_PART('year', mulai) AS tahun
      FROM rab
      ORDER BY DATE_PART('year', mulai) ASC
    `);
    return rows;
  }
  async function getRABbyYear(year) {
    const { rows } = await db.query(
      `
    SELECT 
      r.*,
      kf.full_code AS kode_fungsi_full,
      kf.uraian AS kode_fungsi_uraian,
      kf.level AS kode_fungsi_level,
      ke.full_code AS kode_ekonomi_full, 
      ke.uraian AS kode_ekonomi_uraian,
      ke.level AS kode_ekonomi_level
    FROM rab r
    LEFT JOIN kode_fungsi kf ON kf.id = r.kode_fungsi_id
    LEFT JOIN kode_ekonomi ke ON ke.id = r.kode_ekonomi_id
    WHERE DATE_PART('year', r.mulai) = $1
    ORDER BY r.mulai ASC
    `,
      [year]
    );
    return rows;
  }
  async function getRABbyId(rab_id) {
    try {
      const { rows } = await db.query(
        `
      SELECT 
        r.*,
        kf.full_code AS kode_fungsi_full,
        kf.uraian AS kode_fungsi_uraian,
        kf.level AS kode_fungsi_level,
        ke.full_code AS kode_ekonomi_full,
        ke.uraian AS kode_ekonomi_uraian,
        ke.level AS kode_ekonomi_level
      FROM rab r
      LEFT JOIN kode_fungsi kf ON kf.id = r.kode_fungsi_id
      LEFT JOIN kode_ekonomi ke ON ke.id = r.kode_ekonomi_id
      WHERE r.id = $1
    `,
        [rab_id]
      );

      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error("ERROR getRABbyId:", err);
      throw err;
    }
  }
  async function getRABline(rab_id) {
    const { rows } = await db.query(
      `
      SELECT *
      FROM rab_line 
      WHERE rab_id = $1
      ORDER BY id ASC
    `,
      [rab_id]
    );
    return rows;
  }
  async function getRABLineById(rabLineId) {
    try {
      const sql = "SELECT * FROM rab_line WHERE id = $1";
      const { rows } = await db.query(sql, [rabLineId]);

      if (!rabLineId) throw new Error("rabLineId required");

      if (rows.length === 0) {
        return null;
      }

      return rows[0];
    } catch (err) {
      console.error("ERROR getRABLineById:", err);
      throw err;
    }
  }

  async function getNextRABId() {
    try {
      const { rows } = await db.query(
        "SELECT id FROM rab WHERE id IS NOT NULL ORDER BY id DESC LIMIT 1"
      );

      if (rows.length === 0) {
        return "rab001";
      }

      const lastId = rows[0].id;
      const lastNumberMatch = lastId.match(/rab(\d+)$/);

      if (!lastNumberMatch) {
        throw new Error("Invalid RAB ID format in database");
      }

      if (lastNumberMatch) {
        const lastNumber = parseInt(lastNumberMatch[1], 10);
        const nextNumber = lastNumber + 1;
        return `rab${String(nextNumber).padStart(3, "0")}`;
      }

      return "rab001";
    } catch (err) {
      console.error("ERROR getNextRABId:", err);
      throw err;
    }
  }

  async function getNextRABLineId() {
    try {
      const { rows } = await db.query(
        "SELECT id FROM rab_line WHERE id IS NOT NULL ORDER BY id DESC LIMIT 1"
      );

      if (rows.length === 0) {
        return "rabl001";
      }

      const lastId = rows[0].id;
      const lastNumberMatch = lastId.match(/rabl(\d+)$/);

      if (!lastNumberMatch) {
        throw new Error("Invalid RAB ID format in database");
      }

      if (lastNumberMatch) {
        const lastNumber = parseInt(lastNumberMatch[1], 10);
        const nextNumber = lastNumber + 1;
        return `rabl${String(nextNumber).padStart(3, "0")}`;
      }

      return "rabl001";
    } catch (err) {
      console.error("ERROR getNextRABLineId:", err);
      throw err;
    }
  }
  async function updateRABTotal(rabId, client = db) {
    try {
      const sql = `
        UPDATE rab 
        SET total_amount = (
          SELECT COALESCE(SUM(jumlah), 0) 
          FROM rab_line 
          WHERE rab_id = $1
        )
        WHERE id = $1
        RETURNING *
      `;

      const { rows } = await db.query(sql, [rabId]);
      return rows[0];
    } catch (err) {
      console.error("ERROR updateRABTotal:", err);
      throw err;
    }
  }
  async function createRAB(rabData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const rabId = await getNextRABId();

      const {
        mulai,
        selesai,
        kode_fungsi_id,
        kode_ekonomi_id,
        total_amount = 0,
      } = rabData;

      // Pastikan kode_fungsi_id dan kode_ekonomi_id ada di database
      const [fungsiCheck, ekonomiCheck] = await Promise.all([
        client.query("SELECT id FROM kode_fungsi WHERE id = $1", [
          kode_fungsi_id,
        ]),
        client.query("SELECT id FROM kode_ekonomi WHERE id = $1", [
          kode_ekonomi_id,
        ]),
      ]);
      if (fungsiCheck.rows.length === 0) {
        throw new Error(`kode_fungsi_id ${kode_fungsi_id} tidak ditemukan`);
      }
      if (ekonomiCheck.rows.length === 0) {
        throw new Error(`kode_ekonomi_id ${kode_ekonomi_id} tidak ditemukan`);
      }
      const sql = `
        INSERT INTO rab (
          id, mulai, selesai, kode_fungsi_id, kode_ekonomi_id, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const { rows } = await client.query(sql, [
        rabId,
        mulai,
        selesai,
        kode_fungsi_id,
        kode_ekonomi_id,
        total_amount,
      ]);

      const detailQuery = `
        SELECT 
          r.*,
          kf.full_code AS kode_fungsi_full,
          kf.uraian AS kode_fungsi_uraian,
          kf.level AS kode_fungsi_level,
          ke.full_code AS kode_ekonomi_full,
          ke.uraian AS kode_ekonomi_uraian,
          ke.level AS kode_ekonomi_level
        FROM rab r
        LEFT JOIN kode_fungsi kf ON kf.id = r.kode_fungsi_id
        LEFT JOIN kode_ekonomi ke ON ke.id = r.kode_ekonomi_id
        WHERE r.id = $1
      `;

      const {
        rows: [detailRow],
      } = await client.query(detailQuery, [rows[0].id]);

      await client.query("COMMIT");
      return detailRow;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("ERROR createRAB:", err);
      throw err;
    } finally {
      client.release();
    }
  }
  async function createRABLine(rabLineData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const rabLineId = await getNextRABLineId();

      const { rab_id, uraian, volume, harga_satuan, jumlah, satuan } =
        rabLineData;

      const sql = `
        INSERT INTO rab_line (id, rab_id, uraian, volume, harga_satuan, jumlah, satuan)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const { rows } = await client.query(sql, [
        rabLineId,
        rab_id,
        uraian,
        volume,
        harga_satuan,
        jumlah,
        satuan,
      ]);

      // AUTO-RECALCULATE TOTAL RAB
      await updateRABTotal(rab_id, client);

      await client.query("COMMIT");
      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("ERROR createRABLine:", err);
      throw err;
    } finally {
      client.release();
    }
  }
  async function updateRABLine(rabLineId, updateData) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const { uraian, volume, harga_satuan, jumlah, satuan } = updateData;

      const existingLine = await getRABLineById(rabLineId);
      if (!existingLine) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: `RAB line dengan id ${rabLineId} tidak ditemukan`,
        };
      }

      const sql = `
      UPDATE rab_line 
      SET uraian = $1, volume = $2, harga_satuan = $3, jumlah = $4, satuan = $5
      WHERE id = $6
      RETURNING *
    `;

      const { rows } = await client.query(sql, [
        uraian,
        volume,
        harga_satuan,
        jumlah,
        satuan,
        rabLineId,
      ]);

      // AUTO-RECALCULATE TOTAL RAB (tetap penting)
      await updateRABTotal(existingLine.rab_id, client);

      await client.query("COMMIT");
      return { success: true, data: rows[0] };
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("ERROR updateRABLine:", err);
      return { success: false, message: `Terjadi error: ${err.message}` };
    } finally {
      client.release();
    }
  }
  async function deleteRABLine(rabLineId) {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      // Get line data before deletion
      const existingLine = await getRABLineById(rabLineId);
      if (!existingLine) {
        await client.query("ROLLBACK");
        return {
          success: false,
          message: `RAB line dengan id ${rabLineId} tidak ditemukan`,
        };
      }

      const sql = "DELETE FROM rab_line WHERE id = $1 RETURNING *";
      const { rows } = await client.query(sql, [rabLineId]);

      // AUTO-RECALCULATE TOTAL RAB
      await updateRABTotal(existingLine.rab_id, client);

      await client.query("COMMIT");
      return {
        success: true,
        message: `RAB line berhasil dihapus`,
        deleted: rows[0],
      };
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("ERROR deleteRABLine:", err);
      return { success: false, message: `Terjadi error: ${err.message}` };
    } finally {
      client.release();
    }
  }
  async function getRABWithLines(rabId) {
    try {
      const rab = await getRABbyId(rabId);
      if (!rab) {
        return null;
      }

      const lines = await getRABline(rabId);

      return {
        ...rab,
        lines: lines,
      };
    } catch (err) {
      console.error("ERROR getRABWithLines:", err);
      throw err;
    }
  }
  return {
    getKodeRekeningBidang,
    getKodeRekeningSubBidang,
    getKodeRekeningKegiatan,
    getKodeEkonomiAkun,
    getKodeEkonomiKelompok,
    getKodeEkonomiJenis,
    getKodeEkonomiObjek,

    getKodeFungsiById,
    getKodeEkonomiById,

    getRAByear,
    getRABbyYear,
    getRABline,
    getRABLineById,
    getRABbyId,
    getNextRABId,
    getNextRABLineId,
    updateRABTotal,
    createRAB,
    createRABLine,
    updateRABLine,
    deleteRABLine,
    getRABWithLines,
  };
}
