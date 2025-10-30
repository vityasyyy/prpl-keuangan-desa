export default function createKasPembantuHandler(service) {
  const health = async (req, res) => {
    res.send("test kas pembantu router ok");
  };

  const kegiatan = async (req, res, next) => {
    console.log("type of req:", typeof req, "req.query:", req && req.query);
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const bulan = req.query.bulan ? parseInt(req.query.bulan) : 1;
      const tahun = req.query.tahun ? parseInt(req.query.tahun) : 2024;
      const type_enum = req.query.type_enum || "";
      const search = req.query.search || "";
      console.log(page, limit, bulan, tahun, type_enum, search);
      const result = await service.getKegiatan({ bulan, tahun, type_enum, search, page, limit });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  return { health, kegiatan };
}
