// src/api/handler/kas-umum/kas-umum.handler.js
export default function createKasUmumHandler(kasUmumService) {
  const getBku = async (req, res, next) => {
    try {
      const { month, rabId, rkkId } = req.query;
      const result = await kasUmumService.getBku({ month, rabId, rkkId });
      res.json(result);
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

  return {
    getBku,
    getBidang,
    getSubBidang,
    getKegiatan,
    createBku,
    getKodeEkonomi,
    getSaldo,
  };
}
