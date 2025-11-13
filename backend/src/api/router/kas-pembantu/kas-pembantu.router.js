import { Router } from "express";

export default function kasPembantuRouter(handler) {
  const r = Router();

  r.get("/health", handler.health);

  // buku pembantu kegiatan
  r.get("/kegiatan", handler.kegiatan);
  r.get("/kegiatan/:id", handler.getKegiatanById);
  r.delete("/kegiatan/:id", handler.deleteKegiatan);
  r.post("/kegiatan", handler.createKegiatan);
  r.put("/kegiatan/:id", handler.editKegiatan);

  // buku pembantu panjar
  r.get("/panjar", handler.listPanjar);
  r.delete("/panjar/:id", handler.deletePanjar);
  r.post("/panjar", handler.createPanjar);
  r.get("/panjar/:id", handler.getPanjarById);
  r.put("/panjar/:id", handler.editPanjar);

  // buku pembantu pajak
  r.get("/pajak", handler.listPajak);
  r.get("/pajak/:id", handler.getPajakById);
  r.post("/pajak", handler.createPajak);
  r.put("/pajak/:id", handler.editPajak);
  r.delete("/pajak/:id", handler.deletePajak);
  return r;
}
