import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";

jest.unstable_mockModule("../../../utils/auth.js", () => ({
  __esModule: true,
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

const authUtils = await import("../../../utils/auth.js");

const { RefreshTokenService } = await import("./token.service.js");
const { AuthRepository } = await import("../../repository/auth/auth.repo.js");
const { RefreshTokenRepository } = await import("../../repository/auth/token.repo.js");
const { User, RefreshToken } = await import("../../model/auth/auth.model.js");

const mockLog = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
const mockUser = new User({ user_id: 1, username: "kades", role: "kepala_desa" });

describe("RefreshTokenService (Unit)", () => {
  let tokenService;
  let mockTokenRepo;
  let mockAuthRepo;

  beforeEach(() => {
    mockAuthRepo = new AuthRepository();
    mockTokenRepo = new RefreshTokenRepository();

    tokenService = new RefreshTokenService(mockTokenRepo, mockAuthRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("generateAccessAndRefreshToken", () => {
    it("should generate, store, and return new tokens", async () => {
      // Arrange
      authUtils.generateAccessToken.mockReturnValue("new-access-token");
      authUtils.generateRefreshToken.mockReturnValue("new-refresh-token");
      jest.spyOn(mockAuthRepo, 'getUserByID').mockResolvedValue(mockUser);
      jest.spyOn(mockTokenRepo, 'storeRefreshToken').mockResolvedValue(new RefreshToken());

      // Act
      const result = await tokenService.generateAccessAndRefreshToken(1, mockLog);

      // Assert
      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(mockAuthRepo.getUserByID).toHaveBeenCalledWith(1, mockLog);
      expect(authUtils.generateAccessToken).toHaveBeenCalledWith(mockUser);
    });

    it("should throw if user not found", async () => {
      // Arrange
      jest.spyOn(mockAuthRepo, 'getUserByID').mockResolvedValue(null);

      // Act & Assert
      await expect(tokenService.generateAccessAndRefreshToken(999, mockLog)).rejects.toThrow("User not found");
    });
  });

  describe("validateAndReRefreshToken", () => {
    it("should revoke old token and return new pair if valid", async () => {
      // Arrange
      const oldToken = "valid-old-token";
      const mockValidToken = new RefreshToken({ user_id: 1, refresh_token: oldToken });
      const newPair = { accessToken: "new-access", refreshToken: "new-refresh" };

      // Spy on the service's *own* method to stub its behavior
      jest.spyOn(tokenService, 'generateAccessAndRefreshToken').mockResolvedValue(newPair);
      jest.spyOn(mockTokenRepo, 'getValidRefreshToken').mockResolvedValue(mockValidToken);
      jest.spyOn(mockTokenRepo, 'revokeRefreshToken').mockResolvedValue();

      // Act
      const result = await tokenService.validateAndReRefreshToken(oldToken, mockLog);

      // Assert
      expect(result).toEqual(newPair);
      expect(mockTokenRepo.getValidRefreshToken).toHaveBeenCalledWith(oldToken, mockLog);
    });

    it("should throw if old token is invalid", async () => {
      // Arrange
      jest.spyOn(mockTokenRepo, 'getValidRefreshToken').mockResolvedValue(null);

      // Act & Assert
      await expect(tokenService.validateAndReRefreshToken("invalid-token", mockLog)).rejects.toThrow("Invalid refresh token");
    });
  });
});
