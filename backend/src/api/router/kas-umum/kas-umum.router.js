// backend/src/api/router/kas-umum/index.js
import { Router } from "express";
import {
  getBku,
  getBidang,
  getSubBidang,
  getKegiatan,
} from "../../handler/kas-umum/kas-umum.handler.js";

const r = Router();

// BKU bulan
r.get("/", getBku);

// dropdown kode fungsi
r.get("/bidang", getBidang);
r.get("/sub-bidang", getSubBidang);
r.get("/kegiatan", getKegiatan);

export default r;
