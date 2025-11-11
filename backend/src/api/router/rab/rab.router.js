import express from "express";
import { verifyAccessToken } from "../../middleware/auth.middleware.js";

export default function createRabRouter(rabHandler) {
  const router = express.Router();

  // All routes are protected
//   router.use(verifyAccessToken);

  router.get("/getRAByear", rabHandler.getRAByear.bind(rabHandler));
  router.get("/getRABbyYear", rabHandler.getRABbyYear.bind(rabHandler));
  router.get("/getRAB", rabHandler.getRAB.bind(rabHandler));
  router.get("/getRABline", rabHandler.getRABline.bind(rabHandler));
  router.get("/getRABbyStatus", rabHandler.getRABbyStatus.bind(rabHandler));

  return router;
}
