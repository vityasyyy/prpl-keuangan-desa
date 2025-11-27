// src/api/handler/kas-umum/kas-umum.handler.js
import { logInfo, logError } from "../../../common/logger/logger.js";

export default function createKasUmumHandler(kasUmumService) {
  const getRAB = async (req, res, next) => {
    const log = req?.log;
    try {
      const data = await kasUmumService.getRAB();
      logInfo("RAB fetched", { layer: "handler", route: "GET /rab" }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch RAB", { layer: "handler", route: "GET /rab" }, log);
      next(e);
    }
  };

  const getBku = async (req, res, next) => {
    const log = req?.log;
    try {
      const { month, year } = req.query;
      const result = await kasUmumService.getBku({ month, year });
      logInfo("BKU fetched", { layer: "handler", route: "GET /", month, year }, 10, log);
      res.json(result);
    } catch (e) {
      logError(e, "Failed to fetch BKU", { layer: "handler", route: "GET /", query: req.query }, req?.log);
      next(e);
    }
  };

  const getMonthlySaldo = async (req, res, next) => {
    const log = req?.log;
    try {
      const { year } = req.query;
      const result = await kasUmumService.getMonthlySaldo({ year });
      logInfo("Monthly saldo fetched", { layer: "handler", route: "GET /monthly-saldo", year }, 10, log);
      res.json(result);
    } catch (e) {
      logError(e, "Failed to fetch monthly saldo", { layer: "handler", route: "GET /monthly-saldo" }, log);
      next(e);
    }
  };

  const exportBku = async (req, res, next) => {
    const log = req?.log;
    try {
      const { month, year } = req.query;
      const { filename, buffer } = await kasUmumService.exportBku({ month, year });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      logInfo("BKU exported", { layer: "handler", route: "GET /export", month, year }, 10, log);
      res.send(buffer);
    } catch (e) {
      logError(e, "Failed to export BKU", { layer: "handler", route: "GET /export" }, log);
      next(e);
    }
  };

  const getBidang = async (req, res, next) => {
    const log = req?.log;
    try {
      const data = await kasUmumService.getBidang();
      logInfo("Bidang fetched", { layer: "handler", route: "GET /bidang" }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch bidang", { layer: "handler", route: "GET /bidang" }, log);
      next(e);
    }
  };

  const getSubBidang = async (req, res, next) => {
    const log = req?.log;
    try {
      const { bidangId } = req.query;
      const data = await kasUmumService.getSubBidang(bidangId);
      logInfo("Sub-bidang fetched", { layer: "handler", route: "GET /sub-bidang", bidangId }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch sub-bidang", { layer: "handler", route: "GET /sub-bidang" }, log);
      next(e);
    }
  };

  const getKegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const { subBidangId } = req.query;
      const data = await kasUmumService.getKegiatan(subBidangId);
      logInfo("Kegiatan fetched", { layer: "handler", route: "GET /kegiatan", subBidangId }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch kegiatan", { layer: "handler", route: "GET /kegiatan" }, log);
      next(e);
    }
  };

  const createBku = async (req, res, next) => {
    const log = req?.log;
    try {
      const result = await kasUmumService.createBku(req.body);
      logInfo("BKU created", { layer: "handler", route: "POST /", body: req.body }, 10, log);
      res.status(201).json(result);
    } catch (e) {
      logError(e, "Failed to create BKU", { layer: "handler", route: "POST /", body: req.body }, log);
      next(e);
    }
  };

  const getSaldo = async (req, res, next) => {
    const log = req?.log;
    try {
      const { rabId } = req.query;
      const result = await kasUmumService.getLastSaldo(rabId);
      logInfo("Last saldo fetched", { layer: "handler", route: "GET /saldo", rabId }, 10, log);
      res.json(result);
    } catch (e) {
      logError(e, "Failed to fetch last saldo", { layer: "handler", route: "GET /saldo" }, log);
      next(e);
    }
  };

  const getKodeEkonomi = async (req, res, next) => {
    const log = req?.log;
    try {
      const data = await kasUmumService.getKodeEkonomi();
      logInfo("Kode ekonomi fetched", { layer: "handler", route: "GET /kode-ekonomi" }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch kode ekonomi", { layer: "handler", route: "GET /kode-ekonomi" }, log);
      next(e);
    }
  };

  const getAkun = async (req, res, next) => {
    const log = req?.log;
    try {
      const data = await kasUmumService.getAkun();
      logInfo("Akun fetched", { layer: "handler", route: "GET /akun" }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch akun", { layer: "handler", route: "GET /akun" }, log);
      next(e);
    }
  };

  const getJenis = async (req, res, next) => {
    const log = req?.log;
    try {
      const { akunId } = req.query;
      const data = await kasUmumService.getJenis(akunId);
      logInfo("Jenis fetched", { layer: "handler", route: "GET /jenis", akunId }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch jenis", { layer: "handler", route: "GET /jenis" }, log);
      next(e);
    }
  };

  const getObjek = async (req, res, next) => {
    const log = req?.log;
    try {
      const { jenisId } = req.query;
      const data = await kasUmumService.getObjek(jenisId);
      logInfo("Objek fetched", { layer: "handler", route: "GET /objek", jenisId }, 10, log);
      res.json(data);
    } catch (e) {
      logError(e, "Failed to fetch objek", { layer: "handler", route: "GET /objek" }, log);
      next(e);
    }
  };

  const getBkuById = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const row = await kasUmumService.getBkuById(id);
      logInfo("BKU by id fetched", { layer: "handler", route: "GET /:id", id }, 10, log);
      res.json(row);
    } catch (e) {
      logError(e, "Failed to fetch BKU by id", { layer: "handler", route: "GET /:id" }, log);
      next(e);
    }
  };

  const updateBku = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const result = await kasUmumService.updateBku(id, req.body);
      logInfo("BKU updated", { layer: "handler", route: "PUT /:id", id }, 10, log);
      res.json(result);
    } catch (e) {
      logError(e, "Failed to update BKU", { layer: "handler", route: "PUT /:id" }, log);
      next(e);
    }
  };

  const approveBku = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const { status } = req.body; // optional, default 'approved'
      const result = await kasUmumService.approveBku(id, { status });
      logInfo("BKU approval updated", { layer: "handler", route: "POST /:id/approve", id, status }, 10, log);
      res.json(result);
    } catch (e) {
      logError(e, "Failed to update BKU approval", { layer: "handler", route: "POST /:id/approve" }, log);
      next(e);
    }
  };

  const deleteBku = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await kasUmumService.deleteBku(id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  return {
    getRAB,
    getBku,
    getMonthlySaldo,
    exportBku,
    getBidang,
    getSubBidang,
    getKegiatan,
    createBku,
    getKodeEkonomi,
    getAkun,
    getJenis,
    getObjek,
    getSaldo,
    getBkuById,
    updateBku,
<<<<<<< HEAD
    deleteBku,
    approveBku,
>>>>>>> 4c67659 (Feat (Auth) : Impelent auth)
  };
}
