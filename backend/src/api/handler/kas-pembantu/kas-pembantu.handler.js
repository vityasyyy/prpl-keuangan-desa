export default function createKasPembantuHandler(service) {
  const health = async (req, res) => {
    res.send("test kas pembantu router ok");
  };

  const kegiatan = async (req, res, next) => {
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
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
  const getKegiatanById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const kegiatan = await service.getKegiatanById(id);
      if (!kegiatan || kegiatan.message) {
        return res.status(404).json({
          success: false,
          message: kegiatan?.message || "Data tidak ditemukan",
        });
      }
      res.json({ success: true, data: kegiatan });
    } catch (err) {
      next(err);
    }
  };

  const deleteKegiatan = async (req, res, next) => {
    try {
      const { id } = req.params;
      const success = await service.deleteKegiatanById(id);
      if (success) {
        res.json({ message: `Entry dengan id ${id} berhasil dihapus.` });
      } else {
        res
          .status(404)
          .json({ message: `Entry dengan id ${id} tidak ditemukan.` });
      }
    } catch (err) {
      next(err);
    }
  };
  const createKegiatan = async (req, res, next) => {
    try {
      const payload = req.body;
      const result = await service.createKegiatan(payload);
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  const editKegiatan = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editKegiatan(id, updates);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      // jika service melempar object {status, message}, gunakan itu
      if (err && err.status)
        return res
          .status(err.status)
          .json({ success: false, message: err.message });
      next(err);
    }
  };

  const listPanjar = async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const per_page = req.query.per_page
        ? parseInt(req.query.per_page, 10)
        : 20;
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
      res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const deletePanjar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await service.deletePanjar(id);
      return res.status(200).json({ message });
    } catch (err) {
      if (err && err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const createPanjar = async (req, res, next) => {
    try {
      const payload = req.body || {};
      const created = await service.createPanjar(payload);
      // set Location header sesuai spec
      res.setHeader("Location", `/api/kas-pembantu/panjar/${created.id}`);
      return res.status(201).json({ data: created });
    } catch (err) {
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const getPanjarById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const panjar = await service.getPanjarById(id);
      if (!panjar || panjar.message) {
        return res.status(404).json({
          success: false,
          message: panjar?.message || "Data tidak ditemukan",
        });
      }
      res.json({ success: true, data: panjar });
    } catch (err) {
      next(err);
    }
  };

  const editPanjar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editPanjar(id, updates);
      return res.status(200).json({ data: updated });
    } catch (err) {
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const listPajak = async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      const per_page = req.query.per_page
        ? parseInt(req.query.per_page, 10)
        : 20;
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
      res.status(200).json(result);
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const getPajakById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const pajak = await service.getPajakById(id);
      if (!pajak || pajak.message) {
        return res.status(404).json({
          success: false,
          message: pajak?.message || "Data tidak ditemukan",
        });
      }
      res.json({ success: true, data: pajak });
    } catch (err) {
      next(err);
    }
  };

  const deletePajak = async (req, res, next) => {
    try {
      const { id } = req.params;
      const message = await service.deletePajak(id);
      return res.status(200).json({ message });
    } catch (err) {
      if (err && err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  };

  const createPajak = async (req, res, next) => {
    try {
      const payload = req.body || {};
      const created = await service.createPajak(payload);
      // Location header
      res.setHeader("Location", `/api/kas-pembantu/pajak/${created.id}`);
      return res.status(201).json({ data: created });
    } catch (err) {
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  const editPajak = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body || {};
      const updated = await service.editPajak(id, updates);
      return res.status(200).json({ data: updated });
    } catch (err) {
      if (err && err.status)
        return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };

  // Category handlers
  const getBidang = async (req, res, next) => {
    try {
      const bidang = await service.getKodeFungsi(null);
      res.json({ success: true, data: bidang });
    } catch (err) {
      next(err);
    }
  };

  const getSubBidang = async (req, res, next) => {
    try {
      const { bidangId } = req.params;
      const subBidang = await service.getKodeFungsi(bidangId);
      res.json({ success: true, data: subBidang });
    } catch (err) {
      next(err);
    }
  };

  const getKegiatan = async (req, res, next) => {
    try {
      const { subBidangId } = req.params;
      const kegiatan = await service.getKegiatanBySubBidang(subBidangId);
      res.json({ success: true, data: kegiatan });
    } catch (err) {
      next(err);
    }
  };

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
  };
}
