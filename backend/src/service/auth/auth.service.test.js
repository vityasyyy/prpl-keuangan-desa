import { AuthService } from "./auth.service.js";
import { RefreshTokenService } from "./token.service.js";
import { AuthRepository } from "../../repository/auth/auth.repo.js";
import { User } from "../../model/auth/auth.model.js";
import { comparePasswords } from "../../../utils/auth.js";

// Mock all dependencies
jest.mock("./token.service.js");
jest.mock("../../repository/auth/auth.repo.js");
jest.mock("../../../utils/auth.js");

// Mock the logger
const mockLog = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe("AuthService (Unit)", () => {
  let authService;
  let mockAuthRepo;
  let mockTokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthRepo = new AuthRepository();
    mockTokenService = new RefreshTokenService();
    authService = new AuthService(mockAuthRepo, mockTokenService);
  });

  describe("loginUser", () => {
    it("should return tokens for a valid user and password", async () => {
      const mockUser = new User({
        user_id: 123,
        username: "kades",
        password_hash: "hashedpassword",
      });
      const mockTokens = { accessToken: "access", refreshToken: "refresh" };

      mockAuthRepo.getUserByUsername.mockResolvedValue(mockUser);
      comparePasswords.mockResolvedValue(true);
      mockTokenService.generateAccessAndRefreshToken.mockResolvedValue(mockTokens);

      const result = await authService.loginUser("kades", "password123", mockLog);

      expect(result).toEqual(mockTokens);
      expect(mockAuthRepo.getUserByUsername).toHaveBeenCalledWith("kades", mockLog);
      expect(comparePasswords).toHaveBeenCalledWith("password123", "hashedpassword");
      expect(mockTokenService.generateAccessAndRefreshToken).toHaveBeenCalledWith(123, mockLog);
    });

    it("should throw 'User not found' if user does not exist", async () => {
      mockAuthRepo.getUserByUsername.mockResolvedValue(null);
      await expect(authService.loginUser("unknown", "password123", mockLog)).rejects.toThrow("User not found");
      expect(comparePasswords).not.toHaveBeenCalled();
    });

    it("should throw 'Invalid credentials' for a valid user but wrong password", async () => {
      const mockUser = new User({ user_id: 123, password_hash: "hashedpassword" });
      mockAuthRepo.getUserByUsername.mockResolvedValue(mockUser);
      comparePasswords.mockResolvedValue(false); // Password check fails

      await expect(authService.loginUser("kades", "wrongpassword", mockLog)).rejects.toThrow("Invalid credentials");
      expect(mockTokenService.generateAccessAndRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("logoutUser", () => {
    it("should call tokenService.blacklistRefreshToken", async () => {
      const refreshToken = "some-refresh-token";
      mockTokenService.blacklistRefreshToken.mockResolvedValue();
      await authService.logoutUser(refreshToken, mockLog);
      expect(mockTokenService.blacklistRefreshToken).toHaveBeenCalledWith(refreshToken, mockLog);
    });
  });

  describe("refreshUserToken", () => {
    it("should call tokenService.validateAndReRefreshToken", async () => {
      const oldToken = "old-refresh-token";
      const newTokens = { accessToken: "new-access", refreshToken: "new-refresh" };
      mockTokenService.validateAndReRefreshToken.mockResolvedValue(newTokens);

      const result = await authService.refreshUserToken(oldToken, mockLog);

      expect(result).toEqual(newTokens);
      expect(mockTokenService.validateAndReRefreshToken).toHaveBeenCalledWith(oldToken, mockLog);
    });
  });
});
