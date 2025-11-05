import { Router } from "express";

export default function kasPembantuRouter(handler) {
  const r = Router();
  r.get("/health", handler.health);
  r.get("/kegiatan", handler.kegiatan);
  r.delete("/kegiatan/:id", handler.deleteKegiatan);
  return r;
}
