// src/service/kas-pembantu/kas-pembantu.service.js

export default function createKasPembantuService(repo) {
  return {
    async getKegiatan({ bulan, tahun, type_enum, search, page = 1, limit = 10 }) {
      // Ambil data dari repo
      let data = await repo.listKegiatanTransaksi({ bulan, tahun, type_enum, search, page, limit });
      let ringkasan = await repo.getRingkasan({ bulan, tahun, type_enum, search });

      // Debug: log semua data yang ada di tabel buku_kas_pembantu
      try {
        const allData = await repo.getAllData();
      } catch (error) {
        logger.logError(error.message, 'error getting all buku_kas_pembantu data');
      }

      if (!data || data.length === 0) {
        return {
          message: "Tidak ada data transaksi kas pembantu untuk filter yang diberikan.",
          meta: { page: 0, total_pages: 0, total_items: 0 },
          data: [],
          ringkasan: {
            jumlah_transaksi: 0,
            total_penerimaan: 0,
            total_pengeluaran: 0,
            saldo_akhir: 0
          }
        };
      }

      // Hitung total_items dan total_pages
      const total_items = ringkasan.jumlah_transaksi;
      const total_pages = Math.ceil(total_items / limit);

      const mappedData = data.map(row => ({
        id: row.id,
        bku_id: row.bku_id,
        type_enum: row.type_enum,
        tanggal: row.tanggal,
        uraian: row.uraian,
        penerimaan: row.penerimaan,
        pengeluaran: row.pengeluaran,
        saldo_after: row.saldo_after
      }));

      return {
        meta: { page, total_pages, total_items },
        data: mappedData,
        ringkasan
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
      const required = ['bku_id', 'type_enum', 'tanggal', 'uraian'];
      for (const r of required) {
        if (!payload[r]) throw new Error(`${r} is required`);
      }

      // pastikan bku_id valid (ada di buku_kas_umum)
      const exists = await repo.checkBkuExists(payload.bku_id);
      if (!exists) throw new Error(`bku_id ${payload.bku_id} not found`);

      // parse angka
      const penerimaan = Number(payload.penerimaan ?? 0);
      const pengeluaran = Number(payload.pengeluaran ?? 0);
      if (Number.isNaN(penerimaan) || Number.isNaN(pengeluaran)) {
        throw new Error('penerimaan and pengeluaran must be numeric');
      }

      // ambil saldo terakhir untuk bku_id (jika ada)
      const lastSaldo = await repo.getLastSaldoByBkuId(payload.bku_id);
      const starting = lastSaldo === null ? 0 : lastSaldo;
      const saldo_after = Number((starting + penerimaan - pengeluaran).toFixed(2));

      // generate id sederhana (unik). 
      const id = `bkp${Date.now()}`;

      const toInsert = {
        id,
        bku_id: payload.bku_id,
        type_enum: payload.type_enum,
        tanggal: payload.tanggal,
        uraian: payload.uraian,
        penerimaan,
        pengeluaran,
        saldo_after
      };

      const inserted = await repo.insertKegiatan(toInsert);
      return inserted;
    },
     
    async  editKegiatan(id, updates) {
      if (!id) throw { status: 400, message: 'id is required' };
      if (!updates || Object.keys(updates).length === 0) throw { status: 400, message: 'no update fields provided' };

      // optional: validasi numeric
      if (updates.penerimaan !== undefined && Number.isNaN(Number(updates.penerimaan))) {
        throw { status: 400, message: 'penerimaan must be numeric' };
      }
      if (updates.pengeluaran !== undefined && Number.isNaN(Number(updates.pengeluaran))) {
        throw { status: 400, message: 'pengeluaran must be numeric' };
      }

      // delegasi ke repo — repo akan membuka transaksi sendiri
      const updated = await repo.updateKegiatanById(id, updates);
      if (!updated) throw { status: 404, message: `Kegiatan with id ${id} not found` };
      return updated;
    }
  };
}
