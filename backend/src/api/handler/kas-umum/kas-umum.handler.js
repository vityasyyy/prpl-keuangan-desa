import createRepo from "../../../repository/kas-umum/kas-umum.repo.js";

const normalizeMonth = (m) => (m?.length === 7 ? `${m}-01` : m);

export default function createHandlers({ db }) {
  const repo = createRepo({ db }); // inject Pool dari server

  const getBku = async (req, res, next) => {
    try {
      const { month, rabId, rkkId } = req.query;
      if (!month)
        return res
          .status(400)
          .json({ error: "month_required", hint: "YYYY-MM atau YYYY-MM-DD" });
      const monthDate = normalizeMonth(month);

      const [rows, summary] = await Promise.all([
        repo.listBkuRows({ monthDate, rabId, rkkId }),
        repo.getBkuSummary({ monthDate, rabId, rkkId }),
      ]);

      res.json({ meta: { month: month.slice(0, 7) }, summary, rows });
    } catch (e) {
      next(e);
    }
  };

  const getBidang = async (_req, res, next) => {
    try {
      res.json(await repo.listBidang());
    } catch (e) {
      next(e);
    }
  };

  const getSubBidang = async (req, res, next) => {
    try {
      if (!req.query.bidangId)
        return res.status(400).json({ error: "bidangId_required" });
      res.json(await repo.listSubBidang(req.query.bidangId));
    } catch (e) {
      next(e);
    }
  };

  const getKegiatan = async (req, res, next) => {
    try {
      if (!req.query.subBidangId)
        return res.status(400).json({ error: "subBidangId_required" });
      res.json(await repo.listKegiatan(req.query.subBidangId));
    } catch (e) {
      next(e);
    }
  };

  const createBku = async (req, res, next) => {
    try {
      const {
        tanggal,
        rab_id,              
        kode_ekonomi_id,     
        bidang_id,           
        sub_bidang_id,       
        kegiatan_id,         
        uraian,
        pemasukan,
        pengeluaran,
        nomor_bukti,
      } = req.body;

      if (!tanggal)
        return res.status(400).json({
          error: "tanggal_required",
          hint: "Format: YYYY-MM-DD",
        });

      if (!rab_id)
        return res.status(400).json({
          error: "rab_id_required",
          hint: "RAB ID tidak ditemukan",
        });

      if (!kode_ekonomi_id)
        return res.status(400).json({
          error: "kode_ekonomi_required",
          hint: "Kode Ekonomi harus dipilih",
        });

      if (!kegiatan_id)
        return res.status(400).json({
          error: "kegiatan_required",
          hint: "Kegiatan harus dipilih dari dropdown",
        });

      const hasPemasukan = pemasukan && parseFloat(pemasukan) > 0;
      const hasPengeluaran = pengeluaran && parseFloat(pengeluaran) > 0;

      if (!hasPemasukan && !hasPengeluaran)
        return res.status(400).json({
          error: "amount_required",
          hint: "Harus mengisi Pemasukan atau Pengeluaran",
        });

      if (hasPemasukan && hasPengeluaran)
        return res.status(400).json({
          error: "amount_conflict",
          hint: "Tidak boleh mengisi Pemasukan dan Pengeluaran sekaligus",
        });

      const newBku = await repo.insertBku({
        tanggal,
        rab_id,
        kode_ekonomi_id,
        kode_fungsi_id: kegiatan_id,
        uraian: uraian || "",
        penerimaan: hasPemasukan ? parseFloat(pemasukan) : 0,
        pengeluaran: hasPengeluaran ? parseFloat(pengeluaran) : 0,
        no_bukti: nomor_bukti || null,
      });

      res.status(201).json({
        message: "Data Kas Umum berhasil ditambahkan",
        data: newBku,
      });
    } catch (e) {
      if (e.message.includes("hanya boleh"))
        return res.status(400).json({
          error: "validation_error",
          message: e.message,
        });
      next(e);
    }
  };

  const getKodeEkonomi = async (_req, res, next) => {
    try {
      res.json(await repo.listKodeEkonomi());
    } catch (e) {
      next(e);
    }
  };

  return { getBku, getBidang, getSubBidang, getKegiatan, createBku, getKodeEkonomi };
}
