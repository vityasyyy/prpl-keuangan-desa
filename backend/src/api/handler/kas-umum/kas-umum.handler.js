// src/api/handler/kas-umum/kas-umum.handler.js
export default function createKasUmumHandler(kasUmumService) {
  const getRAB = async (_req, res, next) => {
    try {
      const data = await kasUmumService.getRAB();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
  const getBku = async (req, res, next) => {
    try {
      const { month, year } = req.query;

      const result = await kasUmumService.getBku({ month, year });

      res.json(result);
    } catch (e) {
      next(e);
    }
  };
  const getMonthlySaldo = async (req, res, next) => {
    try {
      const { year } = req.query;
      const result = await kasUmumService.getMonthlySaldo({ year });
      res.json(result);
    } catch (e) {
      next(e);
    }
  };
  const exportBku = async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const { filename, buffer } = await kasUmumService.exportBku({
        month,
        year,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.send(buffer);
    } catch (e) {
      next(e);
    }
  };

  const getBidang = async (_req, res, next) => {
    try {
      const data = await kasUmumService.getBidang();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getSubBidang = async (req, res, next) => {
    try {
      const { bidangId } = req.query;
      const data = await kasUmumService.getSubBidang(bidangId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getKegiatan = async (req, res, next) => {
    try {
      const { subBidangId } = req.query;
      const data = await kasUmumService.getKegiatan(subBidangId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const createBku = async (req, res, next) => {
    try {
      const result = await kasUmumService.createBku(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  };

  const getSaldo = async (req, res, next) => {
    try {
      const { rabId } = req.query;
      const result = await kasUmumService.getLastSaldo(rabId);
      res.json(result);
    } catch (e) {
      next(e);
    }
  };

  const getKodeEkonomi = async (_req, res, next) => {
    try {
      const data = await kasUmumService.getKodeEkonomi();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };
  const getAkun = async (_req, res, next) => {
    try {
      const data = await kasUmumService.getAkun();
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getJenis = async (req, res, next) => {
    try {
      const { akunId } = req.query;
      const data = await kasUmumService.getJenis(akunId);
      res.json(data);
    } catch (e) {
      next(e);
    }
  };

  const getObjek = async (req, res, next) => {
    try {
      const { jenisId } = req.query;
      const data = await kasUmumService.getObjek(jenisId);
      res.json(data);
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
  };
}
