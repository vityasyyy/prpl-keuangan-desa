import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule("../../../utils/auth.js", () => ({
  __esModule: true,
  comparePasswords: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

const { AuthService } = await import("./auth.service.js");
const { RefreshTokenService } = await import("./token.service.js");
const { AuthRepository } = await import("../../repository/auth/auth.repo.js");
const { User } = await import("../../model/auth/auth.model.js");
const authUtils = await import("../../../utils/auth.js");

const mockLog = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };

describe("AuthService (Unit)", () => {
  let authService;
  let mockAuthRepo;
  let mockTokenService;

  beforeEach(() => {
    mockAuthRepo = new AuthRepository();
    mockTokenService = new RefreshTokenService();
    authService = new AuthService(mockAuthRepo, mockTokenService);

    // Clear mock call history
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("loginUser", () => {
    it("should return tokens for a valid user and password", async () => {
      // Arrange
      const mockUser = new User({
        user_id: 123,
        username: "kades",
        password_hash: "hashedpassword",
      });
      const mockTokens = { accessToken: "access", refreshToken: "refresh" };

      jest.spyOn(mockAuthRepo, 'getUserByUsername').mockResolvedValue(mockUser);
      authUtils.comparePasswords.mockResolvedValue(true);
      jest.spyOn(mockTokenService, 'generateAccessAndRefreshToken').mockResolvedValue(mockTokens);

      // Act
      const result = await authService.loginUser("kades", "password123", mockLog);

      // Assert
      expect(result).toEqual(mockTokens);
      expect(mockAuthRepo.getUserByUsername).toHaveBeenCalledWith("kades", mockLog);
      expect(authUtils.comparePasswords).toHaveBeenCalledWith("password123", "hashedpassword");
    });

    it("should throw 'User not found' if user does not exist", async () => {
      // Arrange
      jest.spyOn(mockAuthRepo, 'getUserByUsername').mockResolvedValue(null);

      // Act & Assert
      await expect(authService.loginUser("unknown", "password123", mockLog)).rejects.toThrow("User not found");
    });

    it("should throw 'Invalid credentials' for a valid user but wrong password", async () => {
      // Arrange
      const mockUser = new User({ username: "kades", password_hash: "hashedpassword" });

      jest.spyOn(mockAuthRepo, 'getUserByUsername').mockResolvedValue(mockUser);
      authUtils.comparePasswords.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.loginUser("kades", "wrongpassword", mockLog)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logoutUser", () => {
    it("should call tokenService.blacklistRefreshToken", async () => {
      // Arrange
      const refreshToken = "some-refresh-token";
      jest.spyOn(mockTokenService, 'blacklistRefreshToken').mockResolvedValue();

      // Act
      await authService.logoutUser(refreshToken, mockLog);

      // Assert
      expect(mockTokenService.blacklistRefreshToken).toHaveBeenCalledWith(refreshToken, mockLog);
    });
  });

  describe("refreshUserToken", () => {
    it("should call tokenService.validateAndReRefreshToken", async () => {
      // Arrange
      const oldToken = "old-refresh-token";
      const newTokens = { accessToken: "new-access", refreshToken: "new-refresh" };

      jest.spyOn(mockTokenService, 'validateAndReRefreshToken').mockResolvedValue(newTokens);

      // Act
      const result = await authService.refreshUserToken(oldToken, mockLog);

      // Assert
      expect(result).toEqual(newTokens);
    });
  });
});
