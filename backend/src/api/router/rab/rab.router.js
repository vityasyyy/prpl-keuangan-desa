import express from "express";
import { verifyAccessToken } from "../../middleware/auth.middleware.js";

export default function createRabRouter(rabHandler) {
  const router = express.Router();

  // All routes are protected
   router.use(verifyAccessToken);

  // ==================== RAB ROUTES ====================

  // Get list tahun available RAB
  router.get("/years", rabHandler.getRAByear.bind(rabHandler));

  // Get RAB by tahun
  router.get("/year/:year", rabHandler.getRABbyYear.bind(rabHandler));

  // Get RAB by status
  router.get("/status/:status", rabHandler.getRABbyStatus.bind(rabHandler));

  // Create new RAB - HAPUS DUPLIKASI
  router.post("/", rabHandler.createRAB.bind(rabHandler));

  // ==================== KODE REKENING ROUTES ====================

  // Get kode fungsi hierarchy
  router.get(
    "/kode-rekening/bidang",
    rabHandler.getKodeRekeningBidang.bind(rabHandler)
  );
  router.get(
    "/kode-rekening/bidang/:bidangId/sub-bidang",
    rabHandler.getKodeRekeningSubBidang.bind(rabHandler)
  );
  router.get(
    "/kode-rekening/sub-bidang/:subBidangId/kegiatan",
    rabHandler.getKodeRekeningKegiatan.bind(rabHandler)
  );

  // Get kode ekonomi hierarchy
  router.get(
    "/kode-ekonomi/akun",
    rabHandler.getKodeEkonomiAkun.bind(rabHandler)
  );
  router.get(
    "/kode-ekonomi/akun/:akunId/kelompok",
    rabHandler.getKodeEkonomiKelompok.bind(rabHandler)
  );
  router.get(
    "/kode-ekonomi/kelompok/:kelompokId/jenis",
    rabHandler.getKodeEkonomiJenis.bind(rabHandler)
  );
  router.get(
    "/kode-ekonomi/jenis/:jenisId/objek",
    rabHandler.getKodeEkonomiObjek.bind(rabHandler)
  );

  // ==================== UTILITY ROUTES ====================

  // Validate RAB data
  router.post("/validate", rabHandler.validateRABData.bind(rabHandler));

  // ==================== RAB LINE ROUTES (SPECIFIC) ====================

  // Update RAB line - PASTIKAN SEBELUM WILDCARD
  router.put("/lines/:rabLineId", rabHandler.updateRABLine.bind(rabHandler));

  // Delete RAB line - PASTIKAN SEBELUM WILDCARD
  router.delete("/lines/:rabLineId", rabHandler.deleteRABLine.bind(rabHandler));

  // ==================== RAB-SPECIFIC ROUTES (WILDCARDS) ====================

  // Update RAB status
  router.put("/:rabId/status", rabHandler.updateRABStatus.bind(rabHandler));

  // Get RAB by ID
  router.get("/:rabId", rabHandler.getRABbyId.bind(rabHandler));

  // Get RAB lines by RAB ID
  router.get("/:rabId/lines", rabHandler.getRABline.bind(rabHandler));

  // Create new RAB line
  router.post("/:rabId/lines", rabHandler.createRABLine.bind(rabHandler));

  // Calculate RAB total (manual verification)
  router.get(
    "/:rabId/calculate-total",
    rabHandler.calculateRABTotal.bind(rabHandler)
  );

  return router;
}
