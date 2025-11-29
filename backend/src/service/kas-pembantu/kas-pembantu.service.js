// src/service/kas-pembantu/kas-pembantu.service.js

export default function createKasPembantuService(repo) {
  return {
    async getKegiatan({
      bulan,
      tahun,
      type_enum,
      search,
      page = 1,
      limit = 20,
    }) {
      // Ambil data dari repo
      let data = await repo.listKegiatanTransaksi({
        bulan,
        tahun,
        type_enum,
        search,
        page,
        limit,
      });
      let ringkasan = await repo.getRingkasan({
        bulan,
        tahun,
        type_enum,
        search,
      });

      // Debug: log semua data yang ada di tabel buku_kas_pembantu
      try {
        const allData = await repo.getAllData();
      } catch (error) {
        logger.logError(
          error.message,
          "error getting all buku_kas_pembantu data"
        );
      }

      if (!data || data.length === 0) {
        return {
          message:
            "Tidak ada data transaksi kas pembantu untuk filter yang diberikan.",
          meta: { page: 0, total_pages: 0, total_items: 0 },
          data: [],
          ringkasan: {
            jumlah_transaksi: 0,
            total_penerimaan: 0,
            total_pengeluaran: 0,
            saldo_akhir: 0,
          },
        };
      }

      // Hitung total_items dan total_pages
      const total_items = ringkasan.jumlah_transaksi;
      const total_pages = Math.ceil(total_items / limit);

      const mappedData = data.map((row) => ({
        id: row.id,
        bku_id: row.bku_id,
        type_enum: row.type_enum,
        tanggal: row.tanggal,
        uraian: row.uraian,
        no_bukti: row.no_bukti,
        penerimaan_bendahara: row.penerimaan_bendahara,
        penerimaan_swadaya: row.penerimaan_swadaya,
        pengeluaran_barang_dan_jasa: row.pengeluaran_barang_dan_jasa,
        pengeluaran_modal: row.pengeluaran_modal,
        saldo_after: row.saldo_after,
      }));

      return {
        meta: { page, total_pages, total_items },
        data: mappedData,
        ringkasan,
      };
    },
    async getKegiatanById(id) {
      const kegiatan = await repo.getKegiatanById(id);
      if (!kegiatan) {
        return { message: `Kegiatan dengan id ${id} tidak ditemukan.` };
      }
      return kegiatan;
    },
    async deleteKegiatanById(id) {
      return await repo.deleteById(id);
    },
    async createKegiatan(payload) {
      // validasi minimal
      const required = ["bku_id", "type_enum", "tanggal", "uraian", "no_bukti"];
      for (const r of required) {
        if (!payload[r]) throw new Error(`${r} is required`);
      }

      // pastikan bku_id valid (ada di buku_kas_umum)
      const exists = await repo.checkBkuExists(payload.bku_id);
      if (!exists) throw new Error(`bku_id ${payload.bku_id} not found`);

      // parse angka
      const penerimaan_bendahara = Number(payload.penerimaan_bendahara ?? 0);
      const penerimaan_swadaya = Number(payload.penerimaan_swadaya ?? 0);
      const pengeluaran_barang_dan_jasa = Number(payload.pengeluaran_barang_dan_jasa ?? 0);
      const pengeluaran_modal = Number(payload.pengeluaran_modal ?? 0);
      if (Number.isNaN(penerimaan_bendahara) ||Number.isNaN(penerimaan_swadaya) ||
          Number.isNaN(pengeluaran_modal) || Number.isNaN(pengeluaran_barang_dan_jasa)) {
        throw new Error("penerimaan and pengeluaran must be numeric");
      }

      // ambil saldo terakhir untuk bku_id (jika ada)
      const lastSaldo = await repo.getLastSaldoByBkuId(payload.bku_id);
      const starting = lastSaldo === null ? 0 : lastSaldo;
      const saldo_after = Number(
        (starting + penerimaan_bendahara + penerimaan_swadaya - pengeluaran_barang_dan_jasa - pengeluaran_modal).toFixed(2)
      );

      // generate id sederhana (unik).
      const id = `bkp${Date.now()}`;

      const toInsert = {
        id,
        bku_id: payload.bku_id,
        type_enum: payload.type_enum,
        tanggal: payload.tanggal,
        uraian: payload.uraian,
        no_bukti: payload.no_bukti,
        penerimaan_bendahara,
        penerimaan_swadaya,
        pengeluaran_barang_dan_jasa,
        pengeluaran_modal,
        saldo_after,
      };

      const inserted = await repo.insertKegiatan(toInsert);
      return inserted;
    },
    async editKegiatan(id, updates) {
      if (!id) throw { status: 400, message: "id is required" };
      if (!updates || Object.keys(updates).length === 0)
        throw { status: 400, message: "no update fields provided" };

      // optional: validasi numeric
      if (
        updates.penerimaan_bendahara !== undefined &&
        Number.isNaN(Number(updates.penerimaan_bendahara))
      ) {
        throw { status: 400, message: "penerimaan bendahara must be numeric" };
      }
      if (
        updates.penerimaan_swadaya !== undefined &&
        Number.isNaN(Number(updates.penerimaan_swadaya))
      ) {
        throw { status: 400, message: "penerimaan swadaya must be numeric" };
      }

      if (
        updates.pengeluaran_barang_dan_jasa !== undefined &&
        Number.isNaN(Number(updates.pengeluaran_barang_dan_jasa))
      ) {
        throw { status: 400, message: "pengeluaran barang dan jasa must be numeric" };
      }

      if (
        updates.pengeluaran_modal !== undefined &&
        Number.isNaN(Number(updates.pengeluaran_modal))
      ) {
        throw { status: 400, message: "pengeluaran modal dan jasa must be numeric" };
      }

      const updated = await repo.updateKegiatanById(id, updates);
      if (!updated)
        throw { status: 404, message: `Kegiatan with id ${id} not found` };
      return updated;
    },

    async getPanjarList({
      page = 1,
      per_page = 20,
      bku_id,
      from,
      to,
      sort_by = "tanggal",
      order = "asc",
    }) {
      page = Number(page) || 1;
      per_page = Number(per_page) || 20;
      if (per_page > 100) per_page = 100;
      if (page < 1) page = 1;

      const allowedSort = ["tanggal", "id", "saldo_after"];
      const allowedOrder = ["asc", "desc"];
      if (!allowedSort.includes(sort_by))
        throw { status: 400, message: "invalid sort_by" };
      if (!allowedOrder.includes(String(order).toLowerCase()))
        throw { status: 400, message: "invalid order" };

      const isValidDate = (d) => !d || /^\d{4}-\d{2}-\d{2}$/.test(d);
      if (!isValidDate(from) || !isValidDate(to))
        throw {
          status: 400,
          message: "invalid date format for from/to (expected YYYY-MM-DD)",
        };

      const { rows, total } = await repo.listPanjar({
        page,
        per_page,
        bku_id,
        from,
        to,
        sort_by,
        order,
      });
      const total_pages =
        total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page));

      return {
        meta: {
          page,
          per_page,
          total_pages,
          total_items: total,
        },
        data: rows,
      };
    },

    async deletePanjar(id) {
      if (!id) throw { status: 400, message: "id is required" };

      const deleted = await repo.deletePanjarById(id);
      if (!deleted)
        throw { status: 404, message: `Panjar entry with id ${id} not found` };

      return `Entry panjar dengan id ${id} telah dihapus`;
    },

    async createPanjar(input) {
      // required fields
      const { id: rawId, bku_id, tanggal, uraian, no_bukti} = input || {};
      if (!bku_id) throw { status: 400, message: "bku_id is required" };
      if (!tanggal) throw { status: 400, message: "tanggal is required" };
      if (!uraian) throw { status: 400, message: "uraian is required" };

      // validate tanggal YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
        throw { status: 400, message: "tanggal must be in YYYY-MM-DD format" };
      }

      // numeric fields default and validation (must be >= 0)
      const pemberian =
        input.pemberian !== undefined ? Number(input.pemberian) : 0;
      const pertanggungjawaban =
        input.pertanggungjawaban !== undefined
          ? Number(input.pertanggungjawaban)
          : 0;
      const saldo_after =
        input.saldo_after !== undefined
          ? Number(input.saldo_after)
          : pemberian - pertanggungjawaban;

      if (Number.isNaN(pemberian) || pemberian < 0)
        throw {
          status: 400,
          message: "pemberian must be a non-negative number",
        };
      if (Number.isNaN(pertanggungjawaban) || pertanggungjawaban < 0)
        throw {
          status: 400,
          message: "pertanggungjawaban must be a non-negative number",
        };
      if (Number.isNaN(saldo_after))
        throw { status: 400, message: "saldo_after must be numeric" };

      // generate id if not provided
      const id = rawId ? String(rawId) : `panjar${Date.now()}`;

      // if id provided, ensure not conflict
      if (rawId) {
        const exists = await repo.getPanjarById(id);
        if (exists)
          throw {
            status: 409,
            message: `Panjar entry with id ${id} already exists`,
          };
      }

      // optional: if you have repo.checkBkuExists, validate bku_id exists in buku_kas_umum
      if (typeof repo.checkBkuExists === "function") {
        const ok = await repo.checkBkuExists(bku_id);
        if (!ok) throw { status: 400, message: `bku_id ${bku_id} not found` };
      }

      const payload = {
        id,
        bku_id,
        tanggal,
        uraian,
        no_bukti,
        pemberian,
        pertanggungjawaban,
        saldo_after,
      };

      const inserted = await repo.insertPanjar(payload);
      return inserted;
    },

    async getPanjarById(id) {
      const panjar = await repo.getPanjarById(id);
      if (!panjar) {
        return { message: `Panjar entry with id ${id} not found` };
      }
      return panjar;
    },

    async editPanjar(id, updates) {
      if (!id) throw { status: 400, message: "id is required" };
      
      if (!updates || Object.keys(updates).length === 0)
        throw { status: 400, message: "no update fields provided" };
      
      // validate tanggal if provided
      if (updates.tanggal !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(updates.tanggal))) {
          throw {
            status: 400,
            message: "tanggal must be in YYYY-MM-DD format",
          };
        }
      }
  
      // validate no_bukti if provided
      if (updates.no_bukti !== undefined) {
        if (typeof updates.no_bukti !== 'string' || updates.no_bukti.trim() === '') {
          throw {
            status: 400,
            message: "no_bukti must be a non-empty string",
          };
        }
      }
      
      // validate uraian if provided
      if (updates.uraian !== undefined) {
        if (typeof updates.uraian !== 'string' || updates.uraian.trim() === '') {
          throw {
            status: 400,
            message: "uraian must be a non-empty string",
          };
        }
      }
      
      // validate numeric fields if provided
      if (updates.pemberian !== undefined) {
        const p = Number(updates.pemberian);
        if (Number.isNaN(p) || p < 0)
          throw {
            status: 400,
            message: "pemberian must be a non-negative number",
          };
      }
      
      if (updates.pertanggungjawaban !== undefined) {
        const pj = Number(updates.pertanggungjawaban);
        if (Number.isNaN(pj) || pj < 0)
          throw {
            status: 400,
            message: "pertanggungjawaban must be a non-negative number",
          };
      }
      
      if (updates.saldo_after !== undefined) {
        const s = Number(updates.saldo_after);
        if (Number.isNaN(s))
          throw { status: 400, message: "saldo_after must be numeric" };
      }
      
      // compute final saldo_after if not provided
      let finalPemberian =
        updates.pemberian !== undefined ? Number(updates.pemberian) : undefined;
      let finalPertanggungjawaban =
        updates.pertanggungjawaban !== undefined
          ? Number(updates.pertanggungjawaban)
          : undefined;
      
      // fetch current row to compute missing values
      const existing = await repo.getPanjarById(id);
      if (!existing)
        throw { status: 404, message: `Panjar entry with id ${id} not found` };
      
      if (finalPemberian === undefined)
        finalPemberian = Number(existing.pemberian ?? 0);
      if (finalPertanggungjawaban === undefined)
        finalPertanggungjawaban = Number(existing.pertanggungjawaban ?? 0);
      
      const finalSaldo =
        updates.saldo_after !== undefined
          ? Number(updates.saldo_after)
          : finalPemberian - finalPertanggungjawaban;
      
      // business rule: saldo cannot be negative
      if (finalSaldo < 0) {
        throw {
          status: 409,
          message:
            "Update would cause negative saldo_after (conflict with business rules)",
        };
      }
      
      // optional: validate bku_id exists if repo has checkBkuExists
      if (
        updates.bku_id !== undefined &&
        typeof repo.checkBkuExists === "function"
      ) {
        const ok = await repo.checkBkuExists(updates.bku_id);
        if (!ok)
          throw { status: 400, message: `bku_id ${updates.bku_id} not found` };
      }
      
      // delegate update to repo (repo will return updated row or null)
      const updated = await repo.updatePanjarById(id, updates);
      if (!updated)
        throw { status: 404, message: `Panjar entry with id ${id} not found` };
      
      return updated;
    },

    // =========================
    // BUKU KAS PAJAK
    // =========================

    async getPajakList({
      page = 1,
      per_page = 20,
      bku_id,
      from,
      to,
      sort_by = "tanggal",
      order = "asc",
    }) {
      page = Number(page) || 1;
      per_page = Number(per_page) || 20;
      if (per_page > 100) per_page = 100;
      if (page < 1) page = 1;

      const allowedSort = ["tanggal", "id", "saldo_after"];
      const allowedOrder = ["asc", "desc"];
      if (!allowedSort.includes(sort_by))
        throw { status: 400, message: "invalid sort_by" };
      if (!allowedOrder.includes(String(order).toLowerCase()))
        throw { status: 400, message: "invalid order" };

      const isValidDate = (d) => !d || /^\d{4}-\d{2}-\d{2}$/.test(d);
      if (!isValidDate(from) || !isValidDate(to)) {
        throw {
          status: 400,
          message: "invalid date format for from/to (expected YYYY-MM-DD)",
        };
      }

      const { rows, total } = await repo.listPajak({
        page,
        per_page,
        bku_id,
        from,
        to,
        sort_by,
        order,
      });
      const total_pages =
        total === 0 ? 1 : Math.max(1, Math.ceil(total / per_page));

      return {
        meta: {
          page,
          per_page,
          total_pages,
          total_items: total,
        },
        data: rows,
      };
    },

    async getPajakById(id) {
      const pajak = await repo.getPajakById(id);
      if (!pajak) {
        return { message: `Pajak entry with id ${id} not found` };
      }
      return pajak;
    },

    async deletePajak(id) {
      if (!id) throw { status: 400, message: "id is required" };

      const deleted = await repo.deletePajakById(id);
      if (!deleted)
        throw { status: 404, message: `Pajak entry with id ${id} not found` };

      return `Entry pajak dengan id ${id} telah dihapus`;
    },

    async createPajak(input) {
      const { id: rawId, bku_id, tanggal, uraian } = input || {};

      if (!tanggal) throw { status: 400, message: "tanggal is required" };
      if (!uraian) throw { status: 400, message: "uraian is required" };

      // tanggal harus YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(tanggal))) {
        throw { status: 400, message: "tanggal must be in YYYY-MM-DD format" };
      }

      // numeric fields
      const pemotongan =
        input.pemotongan !== undefined ? Number(input.pemotongan) : 0;
      const penyetoran =
        input.penyetoran !== undefined ? Number(input.penyetoran) : 0;

      if (Number.isNaN(pemotongan) || pemotongan < 0) {
        throw {
          status: 400,
          message: "pemotongan must be a non-negative number",
        };
      }
      if (Number.isNaN(penyetoran) || penyetoran < 0) {
        throw {
          status: 400,
          message: "penyetoran must be a non-negative number",
        };
      }

      // cek bku_id kalau disediakan
      if (bku_id && typeof repo.checkBkuExists === "function") {
        const ok = await repo.checkBkuExists(bku_id);
        if (!ok) throw { status: 400, message: `bku_id ${bku_id} not found` };
      }

      // saldo_after: default pakai running saldo global pajak (lastSaldo + pemotongan - penyetoran)
      const lastSaldo =
        typeof repo.getLastSaldoPajak === "function"
          ? await repo.getLastSaldoPajak()
          : 0;

      let saldo_after;
      if (input.saldo_after !== undefined) {
        saldo_after = Number(input.saldo_after);
      } else {
        saldo_after = Number((lastSaldo + pemotongan - penyetoran).toFixed(2));
      }
      if (Number.isNaN(saldo_after)) {
        throw { status: 400, message: "saldo_after must be numeric" };
      }

      // generate id kalau tidak disediakan
      const id = rawId ? String(rawId) : `pajak${Date.now()}`;

      // kalau id disediakan, pastikan belum ada
      if (rawId) {
        const exists = await repo.getPajakById(id);
        if (exists)
          throw {
            status: 409,
            message: `Pajak entry with id ${id} already exists`,
          };
      }

      const payload = {
        id,
        bku_id: bku_id ?? null,
        tanggal,
        uraian,
        pemotongan,
        penyetoran,
        saldo_after,
      };

      const inserted = await repo.insertPajak(payload);
      return inserted;
    },

    async editPajak(id, updates) {
      if (!id) throw { status: 400, message: "id is required" };
      if (!updates || Object.keys(updates).length === 0) {
        throw { status: 400, message: "no update fields provided" };
      }

      // validate tanggal kalau ada
      if (updates.tanggal !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(updates.tanggal))) {
          throw {
            status: 400,
            message: "tanggal must be in YYYY-MM-DD format",
          };
        }
      }

      // validate numeric fields
      if (updates.pemotongan !== undefined) {
        const p = Number(updates.pemotongan);
        if (Number.isNaN(p) || p < 0) {
          throw {
            status: 400,
            message: "pemotongan must be a non-negative number",
          };
        }
      }
      if (updates.penyetoran !== undefined) {
        const s = Number(updates.penyetoran);
        if (Number.isNaN(s) || s < 0) {
          throw {
            status: 400,
            message: "penyetoran must be a non-negative number",
          };
        }
      }
      if (updates.saldo_after !== undefined) {
        const sa = Number(updates.saldo_after);
        if (Number.isNaN(sa)) {
          throw { status: 400, message: "saldo_after must be numeric" };
        }
      }

      // optional: cek bku_id baru
      if (
        updates.bku_id !== undefined &&
        typeof repo.checkBkuExists === "function"
      ) {
        const ok = await repo.checkBkuExists(updates.bku_id);
        if (!ok)
          throw { status: 400, message: `bku_id ${updates.bku_id} not found` };
      }

      const updated = await repo.updatePajakById(id, updates);
      if (!updated)
        throw { status: 404, message: `Pajak entry with id ${id} not found` };
      return updated;
    },

    // Category/Master Data Methods
    async getKodeFungsi(parentId = null) {
      const categories = await repo.getKodeFungsi(parentId);
      return categories || [];
    },

    async getKegiatanBySubBidang(parentId) {
      const kegiatan = await repo.getKodeFungsi(parentId);
      return kegiatan || [];
    },

    async getBKUidByKodeFungsi(kode) {
      const bku_id = await repo.getBKUidByKodeFungsi(kode);
      return bku_id || null; // maka BKU yang memiliki kode_fungsi tersebut belum ada
    }
  };
}
