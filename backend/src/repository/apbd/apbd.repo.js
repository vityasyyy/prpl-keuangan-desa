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

  async function listApbdesRows({ id, tahun, status }) {
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

  const listKodeEkonomi = async () => {
    const { rows } = await db.query(`
      SELECT id, full_code, uraian 
      FROM kode_ekonomi 
      ORDER BY full_code
    `);
    return rows;
  };

  const listAkun = async () => {
    const { rows } = await db.query(
      `SELECT id, full_code, uraian FROM kode_ekonomi WHERE level = 'akun' ORDER BY full_code`
    );
    return rows;
  };

  const listKodeFungsi = async () => {
    const { rows } = await db.query(
      `SELECT id, full_code, uraian, level, parent_id FROM kode_fungsi ORDER BY full_code`
    );
    return rows;
  };

  const listUraian = async () => {
    const { rows } = await db.query(
      `SELECT DISTINCT uraian FROM kode_ekonomi ORDER BY uraian`
    );
    return rows.map((r) => r.uraian);
  };

  const listSumberDana = async () => {
    const { rows } = await db.query(
      `SELECT DISTINCT sumber_dana FROM apbdes_rincian WHERE sumber_dana IS NOT NULL ORDER BY sumber_dana`
    );
    return rows.map((r) => r.sumber_dana);
  };

  const validateApbdesRincian = (data) => {
    const {
      uraian,
      jumlah_anggaran,
      sumber_dana,
      kode_fungsi_id,
      kode_ekonomi_id,
      kegiatan_id,
    } = data;

    if (!uraian) {
      throw {
        status: 400,
        error: "uraian_required",
        message: "Uraian tidak boleh kosong",
      };
    }
    if (
      jumlah_anggaran === undefined ||
      jumlah_anggaran === null ||
      parseFloat(jumlah_anggaran) <= 0
    ) {
      throw {
        status: 400,
        error: "jumlah_anggaran_invalid",
        message: "Jumlah anggaran harus lebih dari 0",
      };
    }
    if (!sumber_dana) {
      throw {
        status: 400,
        error: "sumber_dana_required",
        message: "Sumber dana tidak boleh kosong",
      };
    }
    if (!kegiatan_id) {
      throw {
        status: 400,
        error: "kegiatan_required",
        hint: "Kegiatan harus dipilih dari dropdown",
      };
    }
    if (!kode_fungsi_id) {
      throw {
        status: 400,
        error: "kode_fungsi_required",
        hint: "Kode fungsi harus dipilih",
      };
    }
    if (!kode_ekonomi_id) {
      throw {
        status: 400,
        error: "kode_ekonomi_required",
        hint: "Kode ekonomi harus dipilih",
      };
    }
  };

  const createApbdesRincian = async (data) => {
    const {
      id,
      kegiatan_id,
      kode_fungsi_id,
      kode_ekonomi_id,
      uraian,
      jumlah_anggaran,
      sumber_dana,
    } = data;
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

    const {
      rows: [newRow],
    } = await db.query(insertQuery, values);

    const detailQuery = `
      SELECT r.*, kf.full_code AS kode_fungsi_full, kf.uraian AS kode_fungsi_uraian,
             ke.full_code AS kode_ekonomi_full, ke.uraian AS kode_ekonomi_uraian
      FROM apbdes_rincian r
      LEFT JOIN kode_fungsi kf ON kf.id = r.kode_fungsi_id
      LEFT JOIN kode_ekonomi ke ON ke.id = r.kode_ekonomi_id
      WHERE r.id = $1
    `;

    const {
      rows: [detailRow],
    } = await db.query(detailQuery, [newRow.id]);
    return detailRow;
  };

  const getDraftApbdesList = async () => {
    const q = `
      SELECT r.id, r.kegiatan_id, k.nama AS kegiatan_nama, a.id AS apbdes_id, a.tahun, a.status,
             r.kode_fungsi_id, r.kode_ekonomi_id, r.uraian, r.jumlah_anggaran, r.sumber_dana  
      FROM apbdes_rincian r
      JOIN kegiatan k ON k.id = r.kegiatan_id
      JOIN apbdes a ON a.id = k.apbdes_id
      WHERE a.status = $1
      ORDER BY a.tahun DESC, r.id
    `;
    const { rows } = await db.query(q, ["draft"]);
    return rows;
  };

  const getDraftApbdesById = async (id) => {
    const q = `
      SELECT r.id, r.kegiatan_id, k.nama AS kegiatan_nama, a.id AS apbdes_id, a.tahun, a.status,
             r.kode_fungsi_id, r.kode_ekonomi_id, r.uraian, r.jumlah_anggaran, r.sumber_dana
      FROM apbdes_rincian r
      JOIN kegiatan k ON k.id = r.kegiatan_id
      JOIN apbdes a ON a.id = k.apbdes_id
      WHERE r.id = $1
    `;
    const { rows } = await db.query(q, [id]);
    return rows[0];
  };

  const getDraftApbdesSummary = async () => {
    const q = `
      SELECT e.uraian, SUM(r.jumlah_anggaran) AS total_anggaran
      FROM apbdes_rincian r
      JOIN kode_ekonomi e ON e.id = r.kode_ekonomi_id
      JOIN apbdes a ON a.id = (SELECT k.apbdes_id FROM kegiatan k WHERE k.id = r.kegiatan_id)
      WHERE e.level = 'akun' AND a.status = $1
      GROUP BY e.uraian
    `;
    const { rows } = await db.query(q, ["draft"]);
    const result = rows.reduce((acc, cur) => {
      acc[cur.uraian] = parseFloat(cur.total_anggaran) || 0;
      return acc;
    }, {});
    return result;
  };

  const updateDraftApbdesItem = async (id, data) => {
    const { uraian, jumlah_anggaran, sumber_dana } = data;
    const q = `
      UPDATE apbdes_rincian
      SET uraian = $1, jumlah_anggaran = $2, sumber_dana = $3
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await db.query(q, [
      uraian,
      jumlah_anggaran,
      sumber_dana,
      id,
    ]);
    return rows[0];
  };

  const deleteDraftApbdesItem = async (id) => {
    const q = `
      DELETE FROM apbdes_rincian
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(q, [id]);
    return rows[0];
  };

  const postDraftApbdes = async (id) => {
    const q = `
      UPDATE apbdes
      SET status = 'posted'
      WHERE id = $1
    `;
    await db.query(q, [id]);
  };

  const recalculateDraftApbdesTotals = async (apbdesId) => {
    const q = `
      SELECT e.uraian, SUM(r.jumlah_anggaran) AS total_anggaran
      FROM apbdes_rincian r
      JOIN kode_ekonomi e ON e.id = r.kode_ekonomi_id
      JOIN apbdes a ON a.id = (SELECT k.apbdes_id FROM kegiatan k WHERE k.id = r.kegiatan_id)
      WHERE e.level = 'akun'
        AND a.status = $1
        ${apbdesId ? "AND a.id = $2" : ""}
      GROUP BY e.uraian
  `;
    const params = apbdesId ? ["draft", apbdesId] : ["draft"];
    const { rows } = await db.query(q, params);
    const result = rows.reduce((acc, cur) => {
      acc[cur.uraian] = parseFloat(cur.total_anggaran) || 0;
      return acc;
    }, {});
    return result;
  };

  const validateApbdesRincianPenjabaran = (data) => {
    const {
      rincian_id,
      uraian,
      volume,
      satuan,
      jumlah_anggaran,
      sumber_dana,
      kode_fungsi_id,
      kode_ekonomi_id,
      kegiatan_id,
    } = data;

    if (!rincian_id) {
      throw {
        status: 400,
        error: "rincian_id_required",
        message: "ID rincian APBDes tidak ditemukan",
      };
    }
    if (!volume) {
      throw {
        status: 400,
        error: "volume_required",
        message: "Volume tidak boleh kosong",
      };
    }
    if (!satuan) {
      throw {
        status: 400,
        error: "satuan_required",
        message: "Satuan tidak boleh kosong",
      };
    }
    if (!uraian) {
      throw {
        status: 400,
        error: "uraian_required",
        message: "Uraian tidak boleh kosong",
      };
    }
    if (
      jumlah_anggaran === undefined ||
      jumlah_anggaran === null ||
      parseFloat(jumlah_anggaran) <= 0
    ) {
      throw {
        status: 400,
        error: "jumlah_anggaran_invalid",
        message: "Jumlah anggaran harus lebih dari 0",
      };
    }
    if (!sumber_dana) {
      throw {
        status: 400,
        error: "sumber_dana_required",
        message: "Sumber dana tidak boleh kosong",
      };
    }
    if (!kegiatan_id) {
      throw {
        status: 400,
        error: "kegiatan_required",
        hint: "Kegiatan harus dipilih dari dropdown",
      };
    }
    if (!kode_fungsi_id) {
      throw {
        status: 400,
        error: "kode_fungsi_required",
        hint: "Kode fungsi harus dipilih",
      };
    }
    if (!kode_ekonomi_id) {
      throw {
        status: 400,
        error: "kode_ekonomi_required",
        hint: "Kode ekonomi harus dipilih",
      };
    }
  };

  const createApbdesRincianPenjabaran = async (data) => {
    const { rincian_id, uraian, volume, satuan, jumlah_anggaran, sumber_dana } =
      data;
    const insertQuery = `
      INSERT INTO apbdes_rincian_penjabaran (
        rincian_id, uraian, volume, satuan, jumlah_anggaran, sumber_dana
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id, rincian_id, uraian, volume, satuan, jumlah_anggaran, sumber_dana
    `;
    const values = [
      rincian_id,
      uraian,
      volume,
      satuan,
      jumlah_anggaran,
      sumber_dana,
    ];

    const {
      rows: [newRow],
    } = await db.query(insertQuery, values);
    return newRow;
  };

  const getDraftPenjabaranApbdesList = async () => {
    const q = `
      SELECT p.id, p.rincian_id, r.uraian AS rincian_uraian, p.uraian, p.volume, p.satuan, p.jumlah_anggaran, p.sumber_dana
      FROM apbdes_rincian_penjabaran p
      JOIN apbdes_rincian r ON p.rincian_id = r.id
      ORDER BY p.id
    `;
    const { rows } = await db.query(q);
    return rows;
  };

  const getDraftPenjabaranApbdesById = async (id) => {
    const q = `
      SELECT id, rincian_id, uraian, volume, satuan, jumlah_anggaran, sumber_dana
      FROM apbdes_rincian_penjabaran
      WHERE id = $1
      ORDER BY id
    `;
    const { rows } = await db.query(q, [id]);
    return rows;
  };

  const getDraftPenjabaranApbdesSummary = async () => {
    const q = `
      SELECT e.uraian, SUM(p.jumlah_anggaran) AS total_anggaran
      FROM apbdes_rincian_penjabaran p
      JOIN kode_ekonomi e ON e.id = p.kode_ekonomi_id
      JOIN apbdes a ON a.id = (SELECT k.apbdes_id FROM kegiatan k WHERE k.id = p.kegiatan_id)
      WHERE e.level = 'akun' AND a.status = $1
      GROUP BY e.uraian
    `;
    const { rows } = await db.query(q, ["draft"]);
    const result = rows.reduce((acc, cur) => {
      acc[cur.uraian] = parseFloat(cur.total_anggaran) || 0;
      return acc;
    }, {});
    return result;
  };

  const postDraftPenjabaranApbdes = async (id) => {
    const q = `
      UPDATE apbdes_rincian_penjabaran
      SET status = 'posted'
      WHERE id = $1
    `;
    await db.query(q, [id]);
  };

  const generateDraftApbdes = async (apbdesId) => {
    // Implementasi pembuatan laporan APBDes berdasarkan apbdesId
    // Misalnya, mengumpulkan data terkait dan menyusunnya dalam format tertentu
  };

  const downloadDraftApbdes = async (apbdesId) => {
    const report = await generateDraftApbdes(apbdesId);
    // Implementasi pengunduhan laporan, misalnya mengirimkan file sebagai respons
  };

  const getApbdesStatus = async (id) => {
    const q = `
      SELECT status
      FROM apbdes
      WHERE id = $1
    `;
    const { rows } = await db.query(q, [id]);
    return rows[0]?.status || null;
  };

  const updatePenjabaranApbdesItem = async (id, data) => {
    const { uraian, volume, satuan, jumlah_anggaran, sumber_dana } = data;
    const q = `
      UPDATE apbdes_rincian_penjabaran
      SET uraian = $1, volume = $2, satuan = $3, jumlah_anggaran = $4, sumber_dana = $5
      WHERE id = $6
      RETURNING *;
    `;
    const { rows } = await db.query(q, [
      uraian,
      volume,
      satuan,
      jumlah_anggaran,
      sumber_dana,
      id,
    ]);
    return rows[0];
  };

  const deletePenjabaranApbdesItem = async (id) => {
    const q = `
      DELETE FROM apbdes_rincian_penjabaran
      WHERE id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(q, [id]);
    return rows[0];
  };

  const recalculatePenjabaranApbdesTotals = async (id) => {
    const q = `
      SELECT e.uraian, SUM(p.jumlah_anggaran) AS total_anggaran
      FROM apbdes_rincian_penjabaran p
      JOIN apbdes_rincian r ON p.rincian_id = r.id
      JOIN kode_ekonomi e ON e.id = r.kode_ekonomi_id
      JOIN apbdes a ON a.id = (SELECT k.apbdes_id FROM kegiatan k WHERE k.id = r.kegiatan_id)
      WHERE e.level = 'akun'
        AND a.status = $1
        ${id ? "AND a.id = $2" : ""}
      GROUP BY e.uraian
  `;
    const params = id ? ["draft", id] : ["draft"];
    const { rows } = await db.query(q, params);
    const result = rows.reduce((acc, cur) => {
      acc[cur.uraian] = parseFloat(cur.total_anggaran) || 0;
      return acc;
    }, {});
    return result;
  };

  return {
    //input form apbdes rincian
    listKodeFungsi,
    listBidang,
    listSubBidang,
    listKegiatan,
    listKodeEkonomi,
    listAkun,
    listUraian,
    listSumberDana,
    validateApbdesRincian,
    createApbdesRincian,

    //output apbdes rincian
    getDraftApbdesList,
    getDraftApbdesById,
    getDraftApbdesSummary,
    updateDraftApbdesItem,
    deleteDraftApbdesItem,
    recalculateDraftApbdesTotals,
    downloadDraftApbdes,
    postDraftApbdes,

    //input form apbdes rincian penjabaran
    validateApbdesRincianPenjabaran,
    createApbdesRincianPenjabaran,

    //output draft apbdes rincian penjabaran
    getDraftPenjabaranApbdesList,
    getDraftPenjabaranApbdesById,
    getDraftPenjabaranApbdesSummary,
    updatePenjabaranApbdesItem,
    deletePenjabaranApbdesItem,
    recalculatePenjabaranApbdesTotals,
    postDraftPenjabaranApbdes,

    //buku apbdes
    listApbdesRows,
    getApbdesStatus,
  };
}
