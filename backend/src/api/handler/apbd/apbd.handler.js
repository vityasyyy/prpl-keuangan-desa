// src/api/handler/apbd/apbd.handler.js
export default function createApbdHandler(ApbdService) {
  //create
  const createApbdesRincian = async (req, res, next) => {
    try {
      const result = await ApbdService.createApbdesRincian(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  //get
  const getBapbd = async (req, res, next) => {
    try {
      const { id, tahun, status } = req.query;
      const result = await ApbdService.getBapbd({ id, tahun, status });
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
  const getKodeFungsi = async (_req, res, next) => {
    try {
      const data = await ApbdService.getKodeFungsi();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getBidang = async (_req, res, next) => {
    try {
      const data = await ApbdService.getBidang();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getSubBidang = async (req, res, next) => {
    try {
      const { bidangId } = req.query;
      const data = await ApbdService.getSubBidang(bidangId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getKegiatan = async (req, res, next) => {
    try {
      const { subBidangId } = req.query;
      const data = await ApbdService.getKegiatan(subBidangId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getKodeEkonomi = async (_req, res, next) => {
    try {
      const data = await ApbdService.getKodeEkonomi();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getAkun = async (_req, res, next) => {
    try {
      const data = await ApbdService.getAkun();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getUraian = async (_req, res, next) => {
    try {
      const data = await ApbdService.getUraian();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getSumberDana = async (_req, res, next) => {
    try {
      const data = await ApbdService.getSumberDana();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getDraftApbdesList = async (_req, res, next) => {
    try {
      const data = await ApbdService.getDraftApbdesList();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getDraftApbdesById = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "id_required" });
      }
      const data = await ApbdService.getDraftApbdesById(id);
      if (!data) {
        return res
          .status(404)
          .json({ success: false, message: "draft_not_found" });
      }
      res.json({ success: true, data });
    } catch (e) {
      console.error("Error getDraftApbdesById:", e);
      res
        .status(500)
        .json({ success: false, message: e.message || "internal_error" });
    }
  };

  const getApbdesSummary = async (_req, res, next) => {
    try {
      const data = await ApbdService.getApbdesSummary();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const updateApbdesItem = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await ApbdService.updateApbdesItem(id, data);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  // Hapus satu entri data APBDes
  const deleteApbdesItem = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await ApbdService.deleteApbdesItem(id);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  return {
    createApbdesRincian, //create buku apbdes
    getBapbd, //buku apbdes
    getKodeFungsi, //form input kode fungsi
    getBidang, //form input bidang
    getSubBidang, //form input sub-bidang
    getKegiatan, //form input kegiatan
    getKodeEkonomi, //form input kode ekonomi
    getAkun,
    getUraian, //form input uraian
    getSumberDana, //form input sumber dana
    getDraftApbdesList,
    getDraftApbdesById,
    getApbdesSummary,
    updateApbdesItem,
    deleteApbdesItem,
  };
}
