import { Router } from "express";
import {verifyAccessToken} from "../../middleware/auth.middleware.js";

export default function kasPembantuRouter(handler) {
  const r = Router();

  r.get("/health", handler.health);

  // export buku-buku ke excel
  r.get("/kegiatan/export", verifyAccessToken, handler.exportBukuKasPembantu);
  r.get("/pajak/export", verifyAccessToken, handler.exportBukuKasPajak);
  r.get("/panjar/export", verifyAccessToken, handler.exportBukuKasPanjar);

  // kode kegiatan
  r.get("/kegiatan/bidang", verifyAccessToken, handler.getBidang);
  r.get("/kegiatan/sub-bidang/:bidangId", verifyAccessToken, handler.getSubBidang);
  r.get("/kegiatan/sub-bidang/kegiatan/:subBidangId", verifyAccessToken, handler.getKegiatan);
  r.get("/kegiatan/get-bku-id-by-kode-fungsi/:kode", verifyAccessToken, handler.getBKUidByKodeFungsi);

  // buku pembantu kegiatan
  r.get("/kegiatan", verifyAccessToken, handler.kegiatan);
  r.get("/kegiatan/:id", verifyAccessToken, handler.getKegiatanById);
  r.delete("/kegiatan/:id", verifyAccessToken, handler.deleteKegiatan);
  r.post("/kegiatan", verifyAccessToken, handler.createKegiatan);
  r.put("/kegiatan/:id", verifyAccessToken, handler.editKegiatan);

  // buku pembantu panjar
  r.get("/panjar", verifyAccessToken, handler.listPanjar);
  r.delete("/panjar/:id", verifyAccessToken, handler.deletePanjar);
  r.post("/panjar", verifyAccessToken, handler.createPanjar);
  r.get("/panjar/:id", verifyAccessToken, handler.getPanjarById);
  r.put("/panjar/:id", verifyAccessToken, handler.editPanjar);

  // buku pembantu pajak
  r.get("/pajak", verifyAccessToken, handler.listPajak);
  r.get("/pajak/:id", verifyAccessToken, handler.getPajakById);
  r.post("/pajak", verifyAccessToken, handler.createPajak);
  r.put("/pajak/:id", verifyAccessToken, handler.editPajak);
  r.delete("/pajak/:id", verifyAccessToken, handler.deletePajak);
  return r;
}
