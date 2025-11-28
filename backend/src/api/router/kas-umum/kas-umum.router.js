// src/api/routes/kas-umum.route.js
import { Router } from "express";
import { verifyAccessToken } from "../../middleware/auth.middleware.js";
import {
  canViewKasUmum,
  canEditKasUmum,
  canApproveKasUmum,
} from "../../middleware/kas-umum.middleware.js";

export default function createKasUmumRouter(kasUmumHandler) {
  const r = Router();

  // Public routes: some resources like RAB and dropdowns could be public or protected depending on app policy.
  r.get("/rab", verifyAccessToken, canViewKasUmum, kasUmumHandler.getRAB);
  r.get("/", verifyAccessToken, canViewKasUmum, kasUmumHandler.getBku);
  r.post("/", verifyAccessToken, canEditKasUmum, kasUmumHandler.createBku);
  r.get("/monthly-saldo", verifyAccessToken, canViewKasUmum, kasUmumHandler.getMonthlySaldo);
  r.get("/export", verifyAccessToken, canViewKasUmum, kasUmumHandler.exportBku);
  r.get("/bidang", verifyAccessToken, canViewKasUmum, kasUmumHandler.getBidang);
  r.get("/sub-bidang", verifyAccessToken, canViewKasUmum, kasUmumHandler.getSubBidang);
  r.get("/kegiatan", verifyAccessToken, canViewKasUmum, kasUmumHandler.getKegiatan);
  r.get("/saldo", verifyAccessToken, canViewKasUmum, kasUmumHandler.getSaldo);
  r.get("/kode-ekonomi", verifyAccessToken, canViewKasUmum, kasUmumHandler.getKodeEkonomi);
  r.get("/akun", verifyAccessToken, canViewKasUmum, kasUmumHandler.getAkun);
  r.get("/jenis", verifyAccessToken, canViewKasUmum, kasUmumHandler.getJenis);
  r.get("/objek", verifyAccessToken, canViewKasUmum, kasUmumHandler.getObjek);
  r.get("/:id", verifyAccessToken, canViewKasUmum, kasUmumHandler.getBkuById);
  r.put("/:id", verifyAccessToken, canEditKasUmum, kasUmumHandler.updateBku);
  r.delete("/:id", kasUmumHandler.deleteBku);
  // Approve endpoint for kepala_desa
  r.post(
    "/:id/approve",
    verifyAccessToken,
    canApproveKasUmum,
    kasUmumHandler.approveBku
  );

  return r;
}
