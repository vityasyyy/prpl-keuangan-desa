// src/api/routes/kas-umum.route.js
import { Router } from "express";

export default function createKasUmumRouter(kasUmumHandler) {
  const r = Router();

  r.get("/", kasUmumHandler.getBku);
  r.post("/", kasUmumHandler.createBku);
  r.get("/bidang", kasUmumHandler.getBidang);
  r.get("/sub-bidang", kasUmumHandler.getSubBidang);
  r.get("/kegiatan", kasUmumHandler.getKegiatan);
  r.get("/kode-ekonomi", kasUmumHandler.getKodeEkonomi);

  return r;
}
