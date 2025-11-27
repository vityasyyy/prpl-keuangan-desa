import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import createKasUmumRouter from "../../router/kas-umum/kas-umum.router.js";
import createKasUmumHandler from "./kas-umum.handler.js";

// Mock the logging middleware to attach a per-request logger
jest.mock("../../middleware/logging.middleware.js", () => ({
  attachLogging: jest.fn(() => (req, res, next) => {
    req.log = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
    next();
  }),
}));

describe("Kas Umum Router (Integration)", () => {
  let app;
  let mockKasUmumService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockKasUmumService = {
      getBku: jest.fn(),
      createBku: jest.fn(),
      getRAB: jest.fn(),
    };

    const kasUmumHandler = createKasUmumHandler(mockKasUmumService);
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
    app.use("/api/kas-umum", createKasUmumRouter(kasUmumHandler));
  });

  describe("GET /api/kas-umum", () => {
    it("should return 200 and BKU data when query provided", async () => {
      const mockResult = { meta: { month: "2023-01" }, summary: {}, rows: [] };
      mockKasUmumService.getBku.mockResolvedValue(mockResult);

      const res = await request(app).get("/api/kas-umum").query({ month: "2023-01" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      expect(mockKasUmumService.getBku).toHaveBeenCalledWith({ month: "2023-01", year: undefined });
    });

    it("should return error when service throws", async () => {
      mockKasUmumService.getBku.mockRejectedValue({ status: 400, error: "period_required" });

      const res = await request(app).get("/api/kas-umum");

      // middleware in the app under test returns errors via express error handler; since we don't add a global handler here,
      // supertest will receive a 500. We assert that service was called and we got non-200 status.
      expect(mockKasUmumService.getBku).toHaveBeenCalled();
      expect(res.status).not.toBe(200);
    });
  });

  describe("POST /api/kas-umum", () => {
    it("should create a new BKU and return 201", async () => {
      const payload = { tanggal: "2023-01-01", rab_id: 1, kode_ekonomi_id: 1, kegiatan_id: 1, pemasukan: 100 };
      const created = { message: "ok", data: { id: 1 } };
      mockKasUmumService.createBku.mockResolvedValue(created);

      const res = await request(app).post("/api/kas-umum").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(mockKasUmumService.createBku).toHaveBeenCalledWith(payload);
    });

    it("should return error when createBku rejects", async () => {
      mockKasUmumService.createBku.mockRejectedValue({ status: 400, error: "tanggal_required" });

      const res = await request(app).post("/api/kas-umum").send({});

      expect(mockKasUmumService.createBku).toHaveBeenCalled();
      expect(res.status).not.toBe(201);
    });
  });
});
