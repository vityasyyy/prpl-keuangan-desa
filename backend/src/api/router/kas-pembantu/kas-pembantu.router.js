import { Router } from "express";

export default function kasPembantuRouter(handler) {
  const r = Router();
  r.get("/health", handler.health);
  r.get("/kegiatan", handler.kegiatan);
  r.get("/kegiatan/:id", handler.getKegiatanById);
  r.delete("/kegiatan/:id", handler.deleteKegiatan);
  r.post("/kegiatan", handler.createKegiatan);
  r.put("/kegiatan/:id", handler.editKegiatan);
  return r;
}
