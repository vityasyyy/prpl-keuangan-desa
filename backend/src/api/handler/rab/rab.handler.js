export default function createRabHandler(rabService) {
  return {
    // ==================== RAB HANDLERS ====================

    async getRAByear(req, res) {
      try {
        const years = await rabService.getRAByearService();
        res.json({
          success: true,
          data: years,
          message: "Data tahun RAB berhasil diambil",
        });
      } catch (err) {
        console.error("HANDLER ERROR getRAByear:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getRABbyYear(req, res) {
      try {
        const { year } = req.params;
        const rabList = await rabService.getRABbyYearService(parseInt(year));
        res.json({
          success: true,
          data: rabList,
          message: `Data RAB tahun ${year} berhasil diambil`,
          metadata: {
            year: parseInt(year),
            count: rabList.length,
            total_amount: rabList.reduce(
              (sum, rab) => sum + rab.total_amount,
              0
            ),
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getRABbyYear:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getRABbyId(req, res) {
      try {
        const { rabId } = req.params;
        const rab = await rabService.getRABbyIdService(rabId);

        if (!rab) {
          return res.status(404).json({
            success: false,
            error: `RAB dengan ID ${rabId} tidak ditemukan`,
          });
        }

        res.json({
          success: true,
          data: rab,
          message: "Data RAB berhasil diambil",
        });
      } catch (err) {
        console.error("HANDLER ERROR getRABbyId:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getRABbyStatus(req, res) {
      try {
        const { status } = req.params;
        const rabList = await rabService.getRABbyStatusService(status);
        res.json({
          success: true,
          data: rabList,
          message: `Data RAB dengan status ${status} berhasil diambil`,
          metadata: {
            status: status,
            count: rabList.length,
            total_amount: rabList.reduce(
              (sum, rab) => sum + rab.total_amount,
              0
            ),
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getRABbyStatus:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async createRAB(req, res) {
      try {
        const rabData = req.body;

        // Validasi required fields di handler level
        if (
          !rabData.mulai ||
          !rabData.selesai ||
          !rabData.kode_fungsi_id ||
          !rabData.kode_ekonomi_id
        ) {
          return res.status(400).json({
            success: false,
            error:
              "Data mulai, selesai, kode_fungsi_id, dan kode_ekonomi_id harus diisi",
          });
        }

        const result = await rabService.createRABService(rabData);

        res.status(201).json({
          success: true,
          data: result,
          message: "RAB berhasil dibuat",
        });
      } catch (err) {
        console.error("HANDLER ERROR createRAB:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    // ==================== RAB LINE HANDLERS ====================

    async getRABline(req, res) {
      try {
        const { rabId } = req.params;
        const lines = await rabService.getRABlineService(rabId);

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
        console.error("HANDLER ERROR getRABline:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async createRABLine(req, res) {
      try {
        const { rabId } = req.params;
        const lineData = {
          ...req.body,
          rab_id: rabId, // Ensure rab_id from URL parameter
        };

        // Validasi required fields
        if (
          !lineData.uraian ||
          lineData.volume === undefined ||
          lineData.harga_satuan === undefined ||
          !lineData.satuan
        ) {
          return res.status(400).json({
            success: false,
            error: "Data uraian, volume, harga_satuan, dan satuan harus diisi",
          });
        }

        const result = await rabService.createRABLineService(lineData);

        res.status(201).json({
          success: true,
          data: result,
          message: "RAB line berhasil ditambahkan",
        });
      } catch (err) {
        console.error("HANDLER ERROR createRABLine:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async updateRABLine(req, res) {
      try {
        const { rabLineId } = req.params;
        const updateData = req.body;

        if (!updateData.uraian) {
          return res.status(400).json({
            success: false,
            error: "Uraian harus diisi",
          });
        }

        const result = await rabService.updateRABLineService(
          rabLineId,
          updateData
        );

        res.json({
          success: true,
          data: result,
          message: "RAB line berhasil diupdate",
        });
      } catch (err) {
        console.error("HANDLER ERROR updateRABLine:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async deleteRABLine(req, res) {
      try {
        const { rabLineId } = req.params;
        const result = await rabService.deleteRABLineService(rabLineId);

        res.json({
          success: true,
          data: result,
          message: "RAB line berhasil dihapus",
        });
      } catch (err) {
        console.error("HANDLER ERROR deleteRABLine:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    // ==================== KODE REKENING HANDLERS ====================

    async getKodeRekeningBidang(req, res) {
      try {
        const bidangList = await rabService.getKodeRekeningBidangService();
        res.json({
          success: true,
          data: bidangList,
          message: "Data bidang berhasil diambil",
          metadata: {
            count: bidangList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeRekeningBidang:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getKodeRekeningSubBidang(req, res) {
      try {
        const { bidangId } = req.params;
        const subBidangList = await rabService.getKodeRekeningSubBidangService(
          bidangId
        );

        res.json({
          success: true,
          data: subBidangList,
          message: "Data sub bidang berhasil diambil",
          metadata: {
            bidang_id: bidangId,
            count: subBidangList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeRekeningSubBidang:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getKodeRekeningKegiatan(req, res) {
      try {
        const { subBidangId } = req.params;
        const kegiatanList = await rabService.getKodeRekeningKegiatanService(
          subBidangId
        );

        res.json({
          success: true,
          data: kegiatanList,
          message: "Data kegiatan berhasil diambil",
          metadata: {
            sub_bidang_id: subBidangId,
            count: kegiatanList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeRekeningKegiatan:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getKodeEkonomiAkun(req, res) {
      try {
        const akunList = await rabService.getKodeEkonomiAkunService();
        res.json({
          success: true,
          data: akunList,
          message: "Data akun berhasil diambil",
          metadata: {
            count: akunList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeEkonomiAkun:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getKodeEkonomiJenis(req, res) {
      try {
        const { akunId } = req.params;
        const jenisList = await rabService.getKodeEkonomiJenisService(akunId);

        res.json({
          success: true,
          data: jenisList,
          message: "Data jenis berhasil diambil",
          metadata: {
            akun_id: akunId,
            count: jenisList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeEkonomiJenis:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async getKodeEkonomiObjek(req, res) {
      try {
        const { jenisId } = req.params;
        const objekList = await rabService.getKodeEkonomiObjekService(jenisId);

        res.json({
          success: true,
          data: objekList,
          message: "Data objek berhasil diambil",
          metadata: {
            jenis_id: jenisId,
            count: objekList.length,
          },
        });
      } catch (err) {
        console.error("HANDLER ERROR getKodeEkonomiObjek:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    // ==================== UTILITY HANDLERS ====================

    async calculateRABTotal(req, res) {
      try {
        const { rabId } = req.params;
        const result = await rabService.calculateRABTotalService(rabId);

        res.json({
          success: true,
          data: result,
          message: "Perhitungan total RAB berhasil",
        });
      } catch (err) {
        console.error("HANDLER ERROR calculateRABTotal:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },

    async validateRABData(req, res) {
      try {
        const rabData = req.body;
        const result = await rabService.validateRABDataService(rabData);

        res.json({
          success: true,
          data: result,
          message: result.isValid ? "Data RAB valid" : "Data RAB tidak valid",
        });
      } catch (err) {
        console.error("HANDLER ERROR validateRABData:", err);
        res.status(400).json({
          success: false,
          error: err.message,
        });
      }
    },
  };
}
