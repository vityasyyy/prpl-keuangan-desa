import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import createApbdRouter from "../../router/apbd/apbd.router.js";
import createApbdHandler from "./apbd.handler.js";

// Custom mock service
const createMockApbdService = () => ({
  createApbdesDraft: jest.fn(),
  getApbdes: jest.fn(),
  getApbdesStatus: jest.fn(),
  getKodeFungsi: jest.fn(),
  getBidang: jest.fn(),
  getSubBidang: jest.fn(),
  getKegiatan: jest.fn(),
  getKodeEkonomi: jest.fn(),
  getAkun: jest.fn(),
  getKelompok: jest.fn(),
  getJenis: jest.fn(),
  getObjek: jest.fn(),
  getDraftApbdesList: jest.fn(),
  getDraftApbdesById: jest.fn(),
  getRincianListForPenjabaran: jest.fn(),
  getDraftApbdesSummary: jest.fn(),
  createApbdesRincian: jest.fn(),
  updateDraftApbdesItem: jest.fn(),
  deleteDraftApbdesItem: jest.fn(),
  postDraftApbdes: jest.fn(),
  createApbdesRincianPenjabaran: jest.fn(),
  getDraftPenjabaranApbdesList: jest.fn(),
  getDraftPenjabaranApbdesById: jest.fn(),
  getDraftPenjabaranByRincianId: jest.fn(),
  getDraftPenjabaranApbdesSummary: jest.fn(),
  updatePenjabaranApbdesItem: jest.fn(),
  deletePenjabaranApbdesItem: jest.fn(),
  postDraftPenjabaranApbdes: jest.fn(),
  postPenjabaranWithParent: jest.fn(),
  getDropdownOptionsByKodeRekening: jest.fn(),
  getAllDropdownOptions: jest.fn(),
});

// Custom mock middleware for auth
const mockVerifyAccessToken = (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  if (token === "valid-token") {
    req.user = { user_id: 123, username: "kades", role: "kades" };
    return next();
  }

  return res.status(401).json({ error: "Unauthorized: Invalid token" });
};

// Custom mock logging middleware
const mockAttachLogging = (req, res, next) => {
  req.log = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
  next();
};

describe("APBD Router (Integration)", () => {
  let app;
  let mockApbdService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockApbdService = createMockApbdService();
    const apbdHandler = createApbdHandler(mockApbdService);
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(mockAttachLogging);
    app.use(mockVerifyAccessToken);
    app.use("/api/apbd", createApbdRouter(apbdHandler));
  });

  describe("POST /api/apbd/draft (Create Draft)", () => {
    it("should return 200 and create draft APBDes", async () => {
      const mockDraft = {
        message: "Draft APBDes berhasil dibuat",
        data: {
          id: "apbdes_2025",
          tahun: 2025,
          status: "draft",
        },
      };
      jest.spyOn(mockApbdService, "createApbdesDraft").mockResolvedValue(mockDraft);

      const response = await request(app)
        .post("/api/apbd/draft")
        .set("Authorization", "Bearer valid-token")
        .send({ tahun: 2025 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDraft);
      expect(mockApbdService.createApbdesDraft).toHaveBeenCalledWith(2025);
    });
  });

  describe("GET /api/apbd/ (Get APBDes)", () => {
    it("should return APBDes with filters", async () => {
      const mockData = {
        meta: { tahun: 2025 },
        rows: [{ id: "rincian001", tahun: 2025, status: "draft" }],
      };
      jest.spyOn(mockApbdService, "getApbdes").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd?tahun=2025&status=draft")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/status/:id (Get APBDes Status)", () => {
    it("should return apbdes status", async () => {
      const mockStatus = { apbdes_id: "apbdes_2025", apbdes_status: "draft" };
      jest.spyOn(mockApbdService, "getApbdesStatus").mockResolvedValue(mockStatus);

      const response = await request(app)
        .get("/api/apbd/status/apbdes_2025")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStatus);
    });
  });

  describe("GET dropdown endpoints", () => {
    it("should get kode fungsi", async () => {
      const mockData = [{ id: "kf001", full_code: "1", uraian: "Pendidikan" }];
      jest.spyOn(mockApbdService, "getKodeFungsi").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/kode-fungsi")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it("should get bidang", async () => {
      const mockData = [{ id: "kf001", full_code: "1", uraian: "Pendidikan" }];
      jest.spyOn(mockApbdService, "getBidang").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/bidang")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });

    it("should get kode ekonomi", async () => {
      const mockData = [{ id: "ke001", full_code: "4", uraian: "Belanja" }];
      jest.spyOn(mockApbdService, "getKodeEkonomi").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/kode-ekonomi")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/rincian (Draft Rincian List)", () => {
    it("should return draft rincian list", async () => {
      const mockData = [{ id: "rincian001", tahun: 2025, status: "draft" }];
      jest.spyOn(mockApbdService, "getDraftApbdesList").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/rincian")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/rincian/:id (Draft Rincian By ID)", () => {
    it("should return draft rincian by id", async () => {
      const mockData = { id: "rincian001", tahun: 2025, status: "draft" };
      jest.spyOn(mockApbdService, "getDraftApbdesById").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/rincian/rincian001")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockData });
    });

    it("should return 404 if rincian not found", async () => {
      jest.spyOn(mockApbdService, "getDraftApbdesById").mockResolvedValue(null);

      const response = await request(app)
        .get("/api/apbd/draft/rincian/notfound")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ success: false, message: "draft_not_found" });
    });
  });

  describe("GET /api/apbd/rincian-for-penjabaran", () => {
    it("should return rincian for penjabaran", async () => {
      const mockData = [{ id: "rincian001", tahun: 2025 }];
      jest.spyOn(mockApbdService, "getRincianListForPenjabaran").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/rincian-for-penjabaran")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/rincian/summary", () => {
    it("should return draft rincian summary", async () => {
      const mockData = { Belanja: 5000000 };
      jest.spyOn(mockApbdService, "getDraftApbdesSummary").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/rincian/summary")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("POST /api/apbd/draft/rincian (Create Rincian)", () => {
    it("should create rincian", async () => {
      const mockRincian = { id: "rincian001", tahun: 2025, jumlah_anggaran: 1000000 };
      jest.spyOn(mockApbdService, "createApbdesRincian").mockResolvedValue(mockRincian);

      const response = await request(app)
        .post("/api/apbd/draft/rincian")
        .set("Authorization", "Bearer valid-token")
        .send({ jumlah_anggaran: 1000000 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockRincian);
    });
  });

  describe("PUT /api/apbd/draft/rincian/:id (Update Rincian)", () => {
    it("should update rincian", async () => {
      const mockUpdated = { id: "rincian001", jumlah_anggaran: 2000000 };
      jest.spyOn(mockApbdService, "updateDraftApbdesItem").mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put("/api/apbd/draft/rincian/rincian001")
        .set("Authorization", "Bearer valid-token")
        .send({ jumlah_anggaran: 2000000 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
    });
  });

  describe("DELETE /api/apbd/draft/rincian/:id (Delete Rincian)", () => {
    it("should delete rincian", async () => {
      const mockDeleted = { deletedItem: { id: "rincian001" }, total: 5 };
      jest.spyOn(mockApbdService, "deleteDraftApbdesItem").mockResolvedValue(mockDeleted);

      const response = await request(app)
        .delete("/api/apbd/draft/rincian/rincian001")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Data berhasil dihapus",
        deletedItem: mockDeleted.deletedItem,
        total: mockDeleted.total,
      });
    });
  });

  describe("POST /api/apbd/draft/rincian/post (Post Rincian)", () => {
    it("should post rincian", async () => {
      const mockResult = { message: "Rincian berhasil diposting" };
      jest.spyOn(mockApbdService, "postDraftApbdes").mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/apbd/draft/rincian/post")
        .set("Authorization", "Bearer valid-token")
        .send({ id: "rincian001" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("GET /api/apbd/draft/penjabaran (Penjabaran List)", () => {
    it("should return penjabaran list", async () => {
      const mockData = [{ id: "penjabaran001", rincian_id: "rincian001" }];
      jest.spyOn(mockApbdService, "getDraftPenjabaranApbdesList").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/penjabaran")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/penjabaran/:id", () => {
    it("should return penjabaran by id", async () => {
      const mockData = { id: "penjabaran001", rincian_id: "rincian001" };
      jest.spyOn(mockApbdService, "getDraftPenjabaranApbdesById").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/penjabaran/penjabaran001")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/penjabaran/by-rincian/:rincian_id", () => {
    it("should return penjabaran by rincian id", async () => {
      const mockData = [{ id: "penjabaran001", rincian_id: "rincian001" }];
      jest.spyOn(mockApbdService, "getDraftPenjabaranByRincianId").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/penjabaran/by-rincian/rincian001")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("GET /api/apbd/draft/penjabaran/summary", () => {
    it("should return penjabaran summary", async () => {
      const mockData = { "Belanja Operasional": 5000000 };
      jest.spyOn(mockApbdService, "getDraftPenjabaranApbdesSummary").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/draft/penjabaran/summary")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  });

  describe("POST /api/apbd/draft/penjabaran/:id/penjabaran (Create Penjabaran)", () => {
    it("should create penjabaran", async () => {
      const mockPenjabaran = { id: "penjabaran001", rincian_id: "rincian001", volume: 100 };
      jest.spyOn(mockApbdService, "createApbdesRincianPenjabaran").mockResolvedValue(mockPenjabaran);

      const response = await request(app)
        .post("/api/apbd/draft/penjabaran/rincian001/penjabaran")
        .set("Authorization", "Bearer valid-token")
        .send({ volume: 100 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPenjabaran);
    });
  });

  describe("PUT /api/apbd/draft/penjabaran/:id (Update Penjabaran)", () => {
    it("should update penjabaran", async () => {
      const mockUpdated = { id: "penjabaran001", volume: 150 };
      jest.spyOn(mockApbdService, "updatePenjabaranApbdesItem").mockResolvedValue(mockUpdated);

      const response = await request(app)
        .put("/api/apbd/draft/penjabaran/penjabaran001")
        .set("Authorization", "Bearer valid-token")
        .send({ volume: 150 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdated);
    });
  });

  describe("DELETE /api/apbd/draft/penjabaran/:id (Delete Penjabaran)", () => {
    it("should delete penjabaran", async () => {
      const mockDeleted = { id: "penjabaran001", rincian_id: "rincian001" };
      jest.spyOn(mockApbdService, "deletePenjabaranApbdesItem").mockResolvedValue(mockDeleted);

      const response = await request(app)
        .delete("/api/apbd/draft/penjabaran/penjabaran001")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDeleted);
    });
  });

  describe("POST /api/apbd/draft/penjabaran/:id/penjabaran/post (Post Penjabaran)", () => {
    it("should post penjabaran", async () => {
      const mockResult = { message: "Penjabaran berhasil diposting" };
      jest.spyOn(mockApbdService, "postDraftPenjabaranApbdes").mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/apbd/draft/penjabaran/penjabaran001/penjabaran/post")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("POST /api/apbd/draft/penjabaran/post-with-parent", () => {
    it("should post penjabaran with parent", async () => {
      const mockResult = {
        message: "Penjabaran dan parent berhasil diposting",
        data: { posted_count: 2 },
      };
      jest.spyOn(mockApbdService, "postPenjabaranWithParent").mockResolvedValue(mockResult);

      const response = await request(app)
        .post("/api/apbd/draft/penjabaran/post-with-parent")
        .set("Authorization", "Bearer valid-token")
        .send({ penjabaran_ids: [1, 2] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
    });
  });

  describe("GET /api/apbd/dropdown-options", () => {
    it("should return dropdown options for kode rekening", async () => {
      const mockData = { bidang: [] };
      jest.spyOn(mockApbdService, "getDropdownOptionsByKodeRekening").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/dropdown-options?kodeRekening=1")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockData });
    });

    it("should return 400 if kodeRekening missing", async () => {
      const response = await request(app)
        .get("/api/apbd/dropdown-options")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false, message: "kodeRekening_required" });
    });
  });

  describe("GET /api/apbd/all-dropdown-options", () => {
    it("should return all dropdown options", async () => {
      const mockData = { bidang: [], kegiatan: [] };
      jest.spyOn(mockApbdService, "getAllDropdownOptions").mockResolvedValue(mockData);

      const response = await request(app)
        .get("/api/apbd/all-dropdown-options")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockData });
    });
  });

  describe("Authentication", () => {
    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/apbd/bidang");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized: Missing token" });
    });

    it("should return 401 with invalid token", async () => {
      const response = await request(app)
        .get("/api/apbd/bidang")
        .set("Authorization", "Bearer invalid-token");
      expect(response.status).toBe(401);
    });
  });
});
