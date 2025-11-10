export default function createKasPembantuHandler(service) {
  const health = async (req, res) => {
    res.send("test kas pembantu router ok");
  };

  const kegiatan = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const bulan = req.query.bulan ? parseInt(req.query.bulan) : 1;
      const tahun = req.query.tahun ? parseInt(req.query.tahun) : 2024;
      const type_enum = req.query.type_enum || "";
      const search = req.query.search || "";
      const result = await service.getKegiatan({ bulan, tahun, type_enum, search, page, limit });
      res.json(result);
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
        res.status(404).json({ message: `Entry dengan id ${id} tidak ditemukan.` });
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

  return { health, kegiatan, deleteKegiatan, createKegiatan };
}
