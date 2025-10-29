// src/api/routes/apbd.route.js
import { Router } from "express";

export default function createApbdRouter(apbdHandler) {
  const r = Router();

  //get
  r.get("/", apbdHandler.getBapbd);
  r.get("/kode-fungsi", apbdHandler.getKodeFungsi);
  r.get("/bidang", apbdHandler.getBidang);
  r.get("/sub-bidang", apbdHandler.getSubBidang);
  r.get("/kegiatan", apbdHandler.getKegiatan);
  r.get("/kode-ekonomi", apbdHandler.getKodeEkonomi);
  r.get("/akun", apbdHandler.getAkun);
  r.get("/uraian", apbdHandler.getUraian);
  r.get("/sumber-dana", apbdHandler.getSumberDana);
  
  //post
  r.post("/", apbdHandler.createBapbd);

  return r;
}