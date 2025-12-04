import { logInfo, logError } from "../../../common/logger/logger.js";

export default function createRabHandler(rabService) {
  return {
    // ==================== RAB HANDLERS ====================

    async getRAByear(req, res, next) {
      const log = req?.log;
      try {
        const years = await rabService.getRAByearService();
        logInfo("RAB Years fetched", { layer: "handler", route: "GET /years" }, 10, log);

        res.json({
          success: true,
          data: years,
          message: "Data tahun RAB berhasil diambil",
        });
      } catch (err) {
        logError(err, "Failed to fetch RAB years", { layer: "handler", route: "GET /years" }, log);
        next(err);
      }
    },

    async getRABbyYear(req, res, next) {
      const log = req?.log;
      try {
        const { year } = req.params;
        const rabList = await rabService.getRABbyYearService(parseInt(year));

        logInfo("RAB by year fetched", { layer: "handler", route: "GET /year/:year", year }, 10, log);

        res.json({
          success: true,
          data: rabList,
          message: `Data RAB tahun ${year} berhasil diambil`,
          metadata: {
            year: parseInt(year),
            count: rabList.length,
            total_amount: rabList.reduce((sum, rab) => sum + rab.total_amount, 0),
          },
        });
      } catch (err) {
        logError(err, "Failed to fetch RAB by year", { layer: "handler", route: "GET /year/:year" }, log);
        next(err);
      }
    },

    async getRABbyId(req, res, next) {
      const log = req?.log;
      try {
        const { rabId } = req.params;
        const rab = await rabService.getRABbyIdService(rabId);

        if (!rab) {
          logInfo("RAB not found", { layer: "handler", route: "GET /:rabId", rabId }, 10, log);
          return res.status(404).json({
            success: false,
            error: `RAB dengan ID ${rabId} tidak ditemukan`,
          });
        }

        logInfo("RAB fetched", { layer: "handler", route: "GET /:rabId", rabId }, 10, log);

        res.json({
          success: true,
          data: rab,
          message: "Data RAB berhasil diambil",
        });
      } catch (err) {
        logError(err, "Failed to fetch RAB by ID", { layer: "handler", route: "GET /:rabId" }, log);
        next(err);
      }
    },

    async getRABbyStatus(req, res, next) {
      const log = req?.log;
      try {
        const { status } = req.params;
        const rabList = await rabService.getRABbyStatusService(status);

        logInfo("RAB by status fetched", { layer: "handler", route: "GET /status/:status", status }, 10, log);

        res.json({
          success: true,
          data: rabList,
          message: `Data RAB dengan status ${status} berhasil diambil`,
          metadata: {
            status,
            count: rabList.length,
            total_amount: rabList.reduce((sum, rab) => sum + rab.total_amount, 0),
          },
        });
      } catch (err) {
        logError(err, "Failed to fetch RAB by status", { layer: "handler", route: "GET /status/:status" }, log);
        next(err);
      }
    },

    async createRAB(req, res, next) {
      const log = req?.log;
      try {
        const rabData = req.body;

        if (!rabData.mulai || !rabData.selesai || !rabData.kode_fungsi_id || !rabData.kode_ekonomi_id) {
          return res.status(400).json({
            success: false,
            error: "Data mulai, selesai, kode_fungsi_id, dan kode_ekonomi_id harus diisi",
          });
        }

        const result = await rabService.createRABService(rabData);

        logInfo("RAB created", { layer: "handler", route: "POST /" }, 10, log);

        res.status(201).json({
          success: true,
          data: result,
          message: "RAB berhasil dibuat",
        });
      } catch (err) {
        logError(err, "Failed to create RAB", { layer: "handler", route: "POST /" }, log);
        next(err);
      }
    },

    // ==================== RAB LINE ====================

    async getRABline(req, res, next) {
      const log = req?.log;
      try {
        const { rabId } = req.params;
        const lines = await rabService.getRABlineService(rabId);

        logInfo("RAB lines fetched", { layer: "handler", route: "GET /:rabId/lines" }, 10, log);

        res.json({
          success: true,
          data: lines,
          message: "Data RAB line berhasil diambil",
          metadata: {
            rab_id: rabId,
            count: lines.length,
            total_amount: lines.reduce((sum, line) => sum + line.jumlah, 0),
          },
        });
      } catch (err) {
        logError(err, "Failed to fetch RAB lines", { layer: "handler", route: "GET /:rabId/lines" }, log);
        next(err);
      }
    },

    async createRABLine(req, res, next) {
      const log = req?.log;
      try {
        const { rabId } = req.params;
        const lineData = { ...req.body, rab_id: rabId };

        if (!lineData.uraian || lineData.volume === undefined || lineData.harga_satuan === undefined || !lineData.satuan) {
          return res.status(400).json({
            success: false,
            error: "Data uraian, volume, harga_satuan, dan satuan harus diisi",
          });
        }

        const result = await rabService.createRABLineService(lineData);

        logInfo("RAB line created", { layer: "handler", route: "POST /:rabId/lines" }, 10, log);

        res.status(201).json({
          success: true,
          data: result,
          message: "RAB line berhasil ditambahkan",
        });
      } catch (err) {
        logError(err, "Failed to create RAB line", { layer: "handler", route: "POST /:rabId/lines" }, log);
        next(err);
      }
    },

    async updateRABLine(req, res, next) {
      const log = req?.log;
      try {
        const { rabLineId } = req.params;
        const updateData = req.body;

        if (!updateData.uraian || !updateData.satuan) {
          return res.status(400).json({
            success: false,
            error: "Uraian dan satuan harus diisi",
          });
        }

        const result = await rabService.updateRABLineService(rabLineId, updateData);

        logInfo("RAB line updated", { layer: "handler", route: "PUT /lines/:rabLineId" }, 10, log);

        res.json({
          success: true,
          data: result,
          message: result.message || "RAB line berhasil diupdate",
        });
      } catch (err) {
        logError(err, "Failed to update RAB line", { layer: "handler", route: "PUT /lines/:rabLineId" }, log);
        next(err);
      }
    },

    async deleteRABLine(req, res, next) {
      const log = req?.log;
      try {
        const { rabLineId } = req.params;
        const result = await rabService.deleteRABLineService(rabLineId);

        logInfo("RAB line deleted", { layer: "handler", route: "DELETE /lines/:rabLineId" }, 10, log);

        res.json({
          success: true,
          data: result.deleted,
          message: result.message || "RAB line berhasil dihapus",
        });
      } catch (err) {
        logError(err, "Failed to delete RAB line", { layer: "handler", route: "DELETE /lines/:rabLineId" }, log);
        next(err);
      }
    },

    // ==================== KODE REKENING ====================

    async getKodeRekeningBidang(req, res, next) {
      const log = req?.log;
      try {
        const bidangList = await rabService.getKodeRekeningBidangService();

        logInfo("Bidang fetched", { layer: "handler", route: "GET /kode-rekening/bidang" }, 10, log);

        res.json({
          success: true,
          data: bidangList,
          message: "Data bidang berhasil diambil",
          metadata: { count: bidangList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch bidang", { layer: "handler", route: "GET /kode-rekening/bidang" }, log);
        next(err);
      }
    },

    async getKodeRekeningSubBidang(req, res, next) {
      const log = req?.log;
      try {
        const { bidangId } = req.params;
        const subBidangList = await rabService.getKodeRekeningSubBidangService(bidangId);

        logInfo("Sub-bidang fetched", { layer: "handler", route: "GET /kode-rekening/bidang/:bidangId/sub-bidang" }, 10, log);

        res.json({
          success: true,
          data: subBidangList,
          message: "Data sub bidang berhasil diambil",
          metadata: { bidang_id: bidangId, count: subBidangList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch sub-bidang", { layer: "handler", route: "GET /kode-rekening/bidang/:bidangId/sub-bidang" }, log);
        next(err);
      }
    },

    async getKodeRekeningKegiatan(req, res, next) {
      const log = req?.log;
      try {
        const { subBidangId } = req.params;
        const kegiatanList = await rabService.getKodeRekeningKegiatanService(subBidangId);

        logInfo("Kegiatan fetched", { layer: "handler", route: "GET /kode-rekening/sub-bidang/:subBidangId/kegiatan" }, 10, log);

        res.json({
          success: true,
          data: kegiatanList,
          message: "Data kegiatan berhasil diambil",
          metadata: { sub_bidang_id: subBidangId, count: kegiatanList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch kegiatan", { layer: "handler", route: "GET /kode-rekening/sub-bidang/:subBidangId/kegiatan" }, log);
        next(err);
      }
    },

    async getKodeEkonomiAkun(req, res, next) {
      const log = req?.log;
      try {
        const akunList = await rabService.getKodeEkonomiAkunService();

        logInfo("Akun fetched", { layer: "handler", route: "GET /kode-ekonomi/akun" }, 10, log);

        res.json({
          success: true,
          data: akunList,
          message: "Data akun berhasil diambil",
          metadata: { count: akunList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch akun", { layer: "handler", route: "GET /kode-ekonomi/akun" }, log);
        next(err);
      }
    },

    async getKodeEkonomiKelompok(req, res, next) {
      const log = req?.log;
      try {
        const { akunId } = req.params;
        const kelompokList = await rabService.getKodeEkonomiKelompokService(akunId);

        logInfo("Kelompok fetched", { layer: "handler", route: "GET /kode-ekonomi/akun/:akunId/kelompok" }, 10, log);

        res.json({
          success: true,
          data: kelompokList,
          message: "Data kelompok berhasil diambil",
          metadata: { akun_id: akunId, count: kelompokList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch kelompok", { layer: "handler", route: "GET /kode-ekonomi/akun/:akunId/kelompok" }, log);
        next(err);
      }
    },

    async getKodeEkonomiJenis(req, res, next) {
      const log = req?.log;
      try {
        const { kelompokId } = req.params;
        const jenisList = await rabService.getKodeEkonomiJenisService(kelompokId);

        logInfo("Jenis fetched", { layer: "handler", route: "GET /kode-ekonomi/kelompok/:kelompokId/jenis" }, 10, log);

        res.json({
          success: true,
          data: jenisList,
          message: "Data jenis berhasil diambil",
          metadata: { kelompok_id: kelompokId, count: jenisList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch jenis", { layer: "handler", route: "GET /kode-ekonomi/kelompok/:kelompokId/jenis" }, log);
        next(err);
      }
    },

    async getKodeEkonomiObjek(req, res, next) {
      const log = req?.log;
      try {
        const { jenisId } = req.params;
        const objekList = await rabService.getKodeEkonomiObjekService(jenisId);

        logInfo("Objek fetched", { layer: "handler", route: "GET /kode-ekonomi/jenis/:jenisId/objek" }, 10, log);

        res.json({
          success: true,
          data: objekList,
          message: "Data objek berhasil diambil",
          metadata: { jenis_id: jenisId, count: objekList.length },
        });
      } catch (err) {
        logError(err, "Failed to fetch objek", { layer: "handler", route: "GET /kode-ekonomi/jenis/:jenisId/objek" }, log);
        next(err);
      }
    },

    // ==================== UTILITY ====================

    async calculateRABTotal(req, res, next) {
      const log = req?.log;
      try {
        const { rabId } = req.params;
        const result = await rabService.calculateRABTotalService(rabId);

        logInfo("RAB total calculated", { layer: "handler", route: "GET /:rabId/calculate-total" }, 10, log);

        res.json({
          success: true,
          data: result,
          message: "Perhitungan total RAB berhasil",
        });
      } catch (err) {
        logError(err, "Failed to calculate RAB total", { layer: "handler", route: "GET /:rabId/calculate-total" }, log);
        next(err);
      }
    },

    async validateRABData(req, res, next) {
      const log = req?.log;
      try {
        const rabData = req.body;
        const result = await rabService.validateRABDataService(rabData);

        logInfo("RAB data validated", { layer: "handler", route: "POST /validate" }, 10, log);

        res.json({
          success: true,
          data: result,
          message: result.isValid ? "Data RAB valid" : "Data RAB tidak valid",
        });
      } catch (err) {
        logError(err, "Failed to validate RAB data", { layer: "handler", route: "POST /validate" }, log);
        next(err);
      }
    },

    async updateRABStatus(req, res, next) {
      const log = req?.log;
      try {
        const { rabId } = req.params;
        const { status } = req.body;

        if (!status) {
          return res.status(400).json({
            success: false,
            error: "Status harus diisi",
          });
        }

        const result = await rabService.updateRABStatusService(rabId, status);

        logInfo("RAB status updated", { layer: "handler", route: "PUT /:rabId/status", status }, 10, log);

        res.json({
          success: true,
          data: result,
          message: `Status RAB berhasil diubah menjadi ${status}`,
        });
      } catch (err) {
        logError(err, "Failed to update RAB status", { layer: "handler", route: "PUT /:rabId/status" }, log);
        next(err);
      }
    },
  };
}
