import { logInfo, logError } from "../../../common/logger/logger.js";

export default function createKasPembantuHandler(service) {
  const health = async (req, res) => {
    res.send("test kas pembantu router ok");
  };

  const kegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      if(req.query.showAll === "true"){
        const result = await service.getKegiatan({
          bulan: undefined,
          tahun: undefined,
          type_enum: undefined,
          search: undefined,
          page,
          limit,
        });
        logInfo("Kegiatan fetched (showAll)", { layer: "handler", route: "GET /kegiatan", showAll: true }, 10, log);
        return res.json(result);
      }
      
      const now = new Date();
      // Only use bulan if explicitly provided in query
      const bulan = req.query.bulan ? parseInt(req.query.bulan) : null;
      // Use current year if tahun not provided
      const tahun = req.query.tahun
        ? parseInt(req.query.tahun)
        : now.getFullYear();
      const type_enum = req.query.type_enum || "";
      const search = req.query.search || "";
      const result = await service.getKegiatan({
        bulan,
        tahun,
        type_enum,
        search,
        page,
        limit,
      });
      
      logInfo("Kegiatan fetched", { layer: "handler", route: "GET /kegiatan", bulan, tahun, type_enum, search }, 10, log);
      return res.json(result);
    } catch (err) {
      logError(err, "Failed to fetch kegiatan", { layer: "handler", route: "GET /kegiatan", query: req.query }, log);
      next(err);
    }
  };

  const getKegiatanById = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const kegiatan = await service.getKegiatanById(id);
      
      if (!kegiatan || kegiatan.message) {
        logInfo("Kegiatan not found", { layer: "handler", route: "GET /kegiatan/:id", id }, 10, log);
        return res.status(404).json({
          success: false,
          message: kegiatan?.message || "Data tidak ditemukan",
        });
      }
      
      logInfo("Kegiatan by id fetched", { layer: "handler", route: "GET /kegiatan/:id", id }, 10, log);
      res.json({ success: true, data: kegiatan });
    } catch (err) {
      logError(err, "Failed to fetch kegiatan by id", { layer: "handler", route: "GET /kegiatan/:id", id: req.params.id }, log);
      next(err);
    }
  };

  const deleteKegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const success = await service.deleteKegiatanById(id);
      
      if (success) {
        logInfo("Kegiatan deleted", { layer: "handler", route: "DELETE /kegiatan/:id", id }, 10, log);
        res.json({ message: `Entry dengan id ${id} berhasil dihapus.` });
      } else {
        logInfo("Kegiatan not found for deletion", { layer: "handler", route: "DELETE /kegiatan/:id", id }, 10, log);
        res.status(404).json({ message: `Entry dengan id ${id} tidak ditemukan.` });
      }
    } catch (err) {
      logError(err, "Failed to delete kegiatan", { layer: "handler", route: "DELETE /kegiatan/:id", id: req.params.id }, log);
      next(err);
    }
  };

  const createKegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const payload = req.body;
      const result = await service.createKegiatan(payload);
      
      logInfo("Kegiatan created", { layer: "handler", route: "POST /kegiatan", body: req.body }, 10, log);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      logError(err, "Failed to create kegiatan", { layer: "handler", route: "POST /kegiatan", body: req.body }, log);
      next(err);
    }
  };

  const editKegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editKegiatan(id, updates);
      
      logInfo("Kegiatan updated", { layer: "handler", route: "PUT /kegiatan/:id", id }, 10, log);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      logError(err, "Failed to update kegiatan", { layer: "handler", route: "PUT /kegiatan/:id", id: req.params.id }, log);
      if (err && err.status)
        return res.status(err.status).json({ success: false, message: err.message });
      next(err);
    }
  };

  const listPanjar = async (req, res, next) => {
    const log = req?.log;
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const per_page = req.query.per_page ? parseInt(req.query.per_page, 10) : 20;
      const bku_id = req.query.bku_id || undefined;
      const from = req.query.from || undefined;
      const to = req.query.to || undefined;
      const sort_by = req.query.sort_by || "tanggal";
      const order = req.query.order || "asc";

      const result = await service.getPanjarList({
        page,
        per_page,
        bku_id,
        from,
        to,
        sort_by,
        order,
      });
      
      logInfo("Panjar list fetched", { layer: "handler", route: "GET /panjar", page, per_page, bku_id }, 10, log);
      res.status(200).json(result);
    } catch (err) {
      logError(err, "Failed to fetch panjar list", { layer: "handler", route: "GET /panjar", query: req.query }, log);
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const deletePanjar = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const message = await service.deletePanjar(id);
      
      logInfo("Panjar deleted", { layer: "handler", route: "DELETE /panjar/:id", id }, 10, log);
      return res.status(200).json({ message });
    } catch (err) {
      logError(err, "Failed to delete panjar", { layer: "handler", route: "DELETE /panjar/:id", id: req.params.id }, log);
      if (err && err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const createPanjar = async (req, res, next) => {
    const log = req?.log;
    try {
      const payload = req.body || {};
      const created = await service.createPanjar(payload);
      
      res.setHeader("Location", `/api/kas-pembantu/panjar/${created.id}`);
      logInfo("Panjar created", { layer: "handler", route: "POST /panjar", body: req.body }, 10, log);
      return res.status(201).json({ data: created });
    } catch (err) {
      logError(err, "Failed to create panjar", { layer: "handler", route: "POST /panjar", body: req.body }, log);
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const getPanjarById = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const panjar = await service.getPanjarById(id);
      
      if (!panjar || panjar.message) {
        logInfo("Panjar not found", { layer: "handler", route: "GET /panjar/:id", id }, 10, log);
        return res.status(404).json({
          success: false,
          message: panjar?.message || "Data tidak ditemukan",
        });
      }
      
      logInfo("Panjar by id fetched", { layer: "handler", route: "GET /panjar/:id", id }, 10, log);
      res.json({ success: true, data: panjar });
    } catch (err) {
      logError(err, "Failed to fetch panjar by id", { layer: "handler", route: "GET /panjar/:id", id: req.params.id }, log);
      next(err);
    }
  };

  const editPanjar = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editPanjar(id, updates);
      
      logInfo("Panjar updated", { layer: "handler", route: "PUT /panjar/:id", id }, 10, log);
      return res.status(200).json({ data: updated });
    } catch (err) {
      logError(err, "Failed to update panjar", { layer: "handler", route: "PUT /panjar/:id", id: req.params.id }, log);
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const listPajak = async (req, res, next) => {
    const log = req?.log;
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const per_page = req.query.per_page ? parseInt(req.query.per_page, 10) : 20;
      const bku_id = req.query.bku_id || undefined;
      const from = req.query.from || undefined;
      const to = req.query.to || undefined;
      const sort_by = req.query.sort_by || "tanggal";
      const order = req.query.order || "asc";

      const result = await service.getPajakList({
        page,
        per_page,
        bku_id,
        from,
        to,
        sort_by,
        order,
      });
      
      logInfo("Pajak list fetched", { layer: "handler", route: "GET /pajak", page, per_page, bku_id }, 10, log);
      res.status(200).json(result);
    } catch (err) {
      logError(err, "Failed to fetch pajak list", { layer: "handler", route: "GET /pajak", query: req.query }, log);
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const getPajakById = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const pajak = await service.getPajakById(id);
      
      if (!pajak || pajak.message) {
        logInfo("Pajak not found", { layer: "handler", route: "GET /pajak/:id", id }, 10, log);
        return res.status(404).json({
          success: false,
          message: pajak?.message || "Data tidak ditemukan",
        });
      }
      
      logInfo("Pajak by id fetched", { layer: "handler", route: "GET /pajak/:id", id }, 10, log);
      res.json({ success: true, data: pajak });
    } catch (err) {
      logError(err, "Failed to fetch pajak by id", { layer: "handler", route: "GET /pajak/:id", id: req.params.id }, log);
      next(err);
    }
  };

  const deletePajak = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const message = await service.deletePajak(id);
      
      logInfo("Pajak deleted", { layer: "handler", route: "DELETE /pajak/:id", id }, 10, log);
      return res.status(200).json({ message });
    } catch (err) {
      logError(err, "Failed to delete pajak", { layer: "handler", route: "DELETE /pajak/:id", id: req.params.id }, log);
      if (err && err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const createPajak = async (req, res, next) => {
    const log = req?.log;
    try {
      const payload = req.body || {};
      const created = await service.createPajak(payload);
      
      res.setHeader("Location", `/api/kas-pembantu/pajak/${created.id}`);
      logInfo("Pajak created", { layer: "handler", route: "POST /pajak", body: req.body }, 10, log);
      return res.status(201).json({ data: created });
    } catch (err) {
      logError(err, "Failed to create pajak", { layer: "handler", route: "POST /pajak", body: req.body }, log);
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const editPajak = async (req, res, next) => {
    const log = req?.log;
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editPajak(id, updates);
      
      logInfo("Pajak updated", { layer: "handler", route: "PUT /pajak/:id", id }, 10, log);
      return res.status(200).json({ data: updated });
    } catch (err) {
      logError(err, "Failed to update pajak", { layer: "handler", route: "PUT /pajak/:id", id: req.params.id }, log);
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  // Category handlers
  const getBidang = async (req, res, next) => {
    const log = req?.log;
    try {
      const bidang = await service.getKodeFungsi(null);
      
      logInfo("Bidang fetched", { layer: "handler", route: "GET /bidang" }, 10, log);
      res.json({ success: true, data: bidang });
    } catch (err) {
      logError(err, "Failed to fetch bidang", { layer: "handler", route: "GET /bidang" }, log);
      next(err);
    }
  };

  const getSubBidang = async (req, res, next) => {
    const log = req?.log;
    try {
      const { bidangId } = req.params;
      const subBidang = await service.getKodeFungsi(bidangId);
      
      logInfo("Sub-bidang fetched", { layer: "handler", route: "GET /sub-bidang/:bidangId", bidangId }, 10, log);
      res.json({ success: true, data: subBidang });
    } catch (err) {
      logError(err, "Failed to fetch sub-bidang", { layer: "handler", route: "GET /sub-bidang/:bidangId", bidangId: req.params.bidangId }, log);
      next(err);
    }
  };

  const getKegiatan = async (req, res, next) => {
    const log = req?.log;
    try {
      const { subBidangId } = req.params;
      const kegiatan = await service.getKegiatanBySubBidang(subBidangId);
      
      logInfo("Kegiatan by sub-bidang fetched", { layer: "handler", route: "GET /kegiatan/:subBidangId", subBidangId }, 10, log);
      res.json({ success: true, data: kegiatan });
    } catch (err) {
      logError(err, "Failed to fetch kegiatan by sub-bidang", { layer: "handler", route: "GET /kegiatan/:subBidangId", subBidangId: req.params.subBidangId }, log);
      next(err);
    }
  };

  const getBKUidByKodeFungsi = async (req, res, next) => {
    const log = req?.log;
    try {
      const { kode } = req.params;
      const bku_id = await service.getBKUidByKodeFungsi(kode);
      
      if (bku_id === null || bku_id === undefined) {
        logInfo("BKU id not found for kode fungsi", { layer: "handler", route: "GET /bku-id/:kode", kode }, 10, log);
        return res.status(404).json({
          success: false,
          message: `Belum ada entry buku kas umum dengan kode fungsi ${kode ? kode : "tersebut"}`
        });
      }
      
      logInfo("BKU id by kode fungsi fetched", { layer: "handler", route: "GET /bku-id/:kode", kode }, 10, log);
      res.json({ success: true, data: { bku_id } });
    } catch (err) {
      logError(err, "Failed to fetch BKU id by kode fungsi", { layer: "handler", route: "GET /bku-id/:kode", kode: req.params.kode }, log);
      next(err);
    }
  }

  return {
    health,
    kegiatan,
    deleteKegiatan,
    createKegiatan,
    getKegiatanById,
    editKegiatan,
    listPanjar,
    deletePanjar,
    createPanjar,
    getPanjarById,
    editPanjar,
    listPajak,
    deletePajak,
    createPajak,
    editPajak,
    getPajakById,
    getBidang,
    getSubBidang,
    getKegiatan,
    getBKUidByKodeFungsi
  };
}