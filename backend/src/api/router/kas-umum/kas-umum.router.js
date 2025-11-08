// src/api/routes/kas-umum.route.js
import { Router } from "express";

export default function createKasUmumRouter(kasUmumHandler) {
  const r = Router();

  r.get("/rab", kasUmumHandler.getRAB);
  r.get("/", kasUmumHandler.getBku);
  r.post("/", kasUmumHandler.createBku);
  r.get("/bidang", kasUmumHandler.getBidang);
  r.get("/sub-bidang", kasUmumHandler.getSubBidang);
  r.get("/kegiatan", kasUmumHandler.getKegiatan);
  r.get("/saldo", kasUmumHandler.getSaldo);
  r.get("/kode-ekonomi", kasUmumHandler.getKodeEkonomi);
  r.get("/akun", kasUmumHandler.getAkun);
  r.get("/jenis", kasUmumHandler.getJenis);
  r.get("/objek", kasUmumHandler.getObjek);

  return r;
}
