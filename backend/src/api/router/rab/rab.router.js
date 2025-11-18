import express from "express";
import { verifyAccessToken } from "../../middleware/auth.middleware.js";

export default function createRabRouter(rabHandler) {
  const router = express.Router();

  // All routes are protected
  //   router.use(verifyAccessToken);

  // ==================== RAB ROUTES ====================

  router.post("/", rabHandler.createRAB.bind(rabHandler)); // Create Root
  // Get list tahun available RAB
  router.get("/years", rabHandler.getRAByear.bind(rabHandler));

  // Get RAB by tahun
  router.get("/year/:year", rabHandler.getRABbyYear.bind(rabHandler));

  // Get RAB by status
  router.get("/status/:status", rabHandler.getRABbyStatus.bind(rabHandler));

  // Create new RAB
  router.post("/", rabHandler.createRAB.bind(rabHandler));

  // ==================== RAB LINE ROUTES ====================

  // Update RAB line
  router.put("/lines/:rabLineId", rabHandler.updateRABLine.bind(rabHandler));

  // Delete RAB line
  router.delete("/lines/:rabLineId", rabHandler.deleteRABLine.bind(rabHandler));

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
    "/kode-ekonomi/akun/:akunId/jenis",
    rabHandler.getKodeEkonomiJenis.bind(rabHandler)
  );
  router.get(
    "/kode-ekonomi/jenis/:jenisId/objek",
    rabHandler.getKodeEkonomiObjek.bind(rabHandler)
  );

  // ==================== UTILITY ROUTES ====================

  // Validate RAB data
  router.post("/validate", rabHandler.validateRABData.bind(rabHandler));

  // ==================== UID-BASED ROUTES (WILDCARDS) ====================

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
