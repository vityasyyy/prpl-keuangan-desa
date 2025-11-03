// src/api/routes/apbd.route.js
import { Router } from "express";

export default function createApbdRouter(apbdHandler) {
  const r = Router();

  //get
  r.get("/", apbdHandler.getApbdes);
  r.get("/kode-fungsi", apbdHandler.getKodeFungsi);
  r.get("/bidang", apbdHandler.getBidang);
  r.get("/sub-bidang", apbdHandler.getSubBidang);
  r.get("/kegiatan", apbdHandler.getKegiatan);
  r.get("/kode-ekonomi", apbdHandler.getKodeEkonomi);
  r.get("/akun", apbdHandler.getAkun);
  r.get("/uraian", apbdHandler.getUraian);
  r.get("/sumber-dana", apbdHandler.getSumberDana);
  r.get("/drafts", apbdHandler.getDraftApbdesList); // GET /api/apbd/drafts
  r.get("/drafts/:id", apbdHandler.getDraftApbdesById); // GET /api/apbd/drafts/:id
  r.get("/summary", apbdHandler.getApbdesSummary); // GET /api/apbd/summary
  r.get("/status/:id", apbdHandler.getApbdesStatus); // GET /api/apbd/status/:id

  //post
  r.post("/drafts", apbdHandler.createApbdesRincian);
  r.post("/drafts/:id/post", apbdHandler.postApbdesDraft); // POST /api/apbd/drafts/:id/post

  // Update dan delete
  r.put("/drafts/:id", apbdHandler.updateApbdesItem); // PUT /api/apbd/drafts/:id
  r.delete("/drafts/:id", apbdHandler.deleteApbdesItem); // DELETE /api/apbd/drafts/:id

  return r;
}
