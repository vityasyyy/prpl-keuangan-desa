import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

import createAuthRouter from "../../router/auth/auth.router.js";
import { AuthHandler } from "./auth.handler.js";
import { AuthService } from "../../../service/auth/auth.service.js";

// --- Mock Dependencies ---
jest.mock("../../../service/auth/auth.service.js");

// Mock the auth.middleware.js
jest.mock("../../middleware/auth.middleware.js", () => ({
  verifyAccessToken: jest.fn((req, res, next) => {
    if (req.headers["authorization"] === "Bearer valid-token") {
      req.user = { user_id: 123, username: "testuser", role: "kades" };
      return next();
    }
    if (req.path === "/me" || req.path === "/logout") {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    return next(); // Allow public routes
  }),
}));

// Mock the logging middleware
jest.mock("../../middleware/logging.middleware.js", () => ({
  attachLogging: jest.fn(() => (req, res, next) => {
    req.log = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
    next();
  }),
}));

describe("Auth Router (Integration)", () => {
  let app;
  let mockAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = new AuthService();
    const authHandler = new AuthHandler(mockAuthService);
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(jest.requireMock("../../middleware/logging.middleware.js").attachLogging());
    app.use("/api/auth", createAuthRouter(authHandler));
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 and set cookies on successful login", async () => {
      const mockTokens = { accessToken: "abc", refreshToken: "xyz" };
      mockAuthService.loginUser.mockResolvedValue(mockTokens);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "kades", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Login successful" });
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("access_token=abc;"),
          expect.stringContaining("refresh_token=xyz;"),
        ])
      );
    });

    it("should return 401 on failed login", async () => {
      mockAuthService.loginUser.mockRejectedValue(new Error("Invalid credentials"));
      const response = await request(app)
        .post("/api/auth/login")
        .send({ username: "kades", password: "wrong" });
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid credentials" });
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should return 200 and set new cookies on successful refresh", async () => {
      const newTokens = { accessToken: "new-abc", refreshToken: "new-xyz" };
      mockAuthService.refreshUserToken.mockResolvedValue(newTokens);

      const response = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", "refresh_token=old-token");

      expect(response.status).toBe(200);
      expect(response.headers["set-cookie"]).toEqual(
        expect.arrayContaining([
          expect.stringContaining("access_token=new-abc;"),
          expect.stringContaining("refresh_token=new-xyz;"),
        ])
      );
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return 200 and user data if token is valid", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", "access_token=valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: { user_id: 123, username: "testuser", role: "kades" },
      });
    });

    it("should return 401 if token is invalid or missing", async () => {
      const response = await request(app).get("/api/auth/me");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Unauthorized: Invalid token" });
    });
  });
});
