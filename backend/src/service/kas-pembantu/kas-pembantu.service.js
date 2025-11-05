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

    async deleteKegiatanById(id) {
      return await repo.deleteById(id);
    },
  };
}
