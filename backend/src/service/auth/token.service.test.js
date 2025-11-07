import { RefreshTokenService } from "./token.service.js";
import { AuthRepository } from "../../repository/auth/auth.repo.js";
import { RefreshTokenRepository } from "../../repository/auth/token.repo.js";
import { User, RefreshToken } from "../../model/auth/auth.model.js";
import * as authUtils from "../../../utils/auth.js"; // Import all to mock

// Mock all dependencies
jest.mock("../../repository/auth/auth.repo.js");
jest.mock("../../repository/auth/token.repo.js");
jest.mock("../../../utils/auth.js"); // Mock JWT/crypto utils

const mockLog = { info: jest.fn(), error: jest.fn(), debug: jest.fn() };
const mockUser = new User({ user_id: 1, username: "kades", role: "kepala_desa" });

describe("RefreshTokenService (Unit)", () => {
  let tokenService;
  let mockTokenRepo;
  let mockAuthRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenRepo = new RefreshTokenRepository();
    mockAuthRepo = new AuthRepository();
    tokenService = new RefreshTokenService(mockTokenRepo, mockAuthRepo);
  });

  describe("generateAccessAndRefreshToken", () => {
    it("should generate, store, and return new tokens", async () => {
      // Arrange
      authUtils.generateAccessToken.mockReturnValue("new-access-token");
      authUtils.generateRefreshToken.mockReturnValue("new-refresh-token");
      mockAuthRepo.getUserByID.mockResolvedValue(mockUser);
      mockTokenRepo.storeRefreshToken.mockResolvedValue(new RefreshToken());

      // Act
      const result = await tokenService.generateAccessAndRefreshToken(1, mockLog);

      // Assert
      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
      expect(mockAuthRepo.getUserByID).toHaveBeenCalledWith(1, mockLog);
      expect(authUtils.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(mockTokenRepo.storeRefreshToken).toHaveBeenCalled();
    });

    it("should throw if user not found", async () => {
      mockAuthRepo.getUserByID.mockResolvedValue(null);
      await expect(tokenService.generateAccessAndRefreshToken(999, mockLog)).rejects.toThrow("User not found");
    });
  });

  describe("validateAndReRefreshToken", () => {
    it("should revoke old token and return new pair if valid", async () => {
      const oldToken = "valid-old-token";
      const mockValidToken = new RefreshToken({ user_id: 1, refresh_token: oldToken });

      // Mock the entire generate function since we just tested it
      const newPair = { accessToken: "new-access", refreshToken: "new-refresh" };
      jest.spyOn(tokenService, 'generateAccessAndRefreshToken').mockResolvedValue(newPair);

      mockTokenRepo.getValidRefreshToken.mockResolvedValue(mockValidToken);
      mockTokenRepo.revokeRefreshToken.mockResolvedValue();

      // Act
      const result = await tokenService.validateAndReRefreshToken(oldToken, mockLog);

      // Assert
      expect(result).toEqual(newPair);
      expect(mockTokenRepo.getValidRefreshToken).toHaveBeenCalledWith(oldToken, mockLog);
      expect(mockTokenRepo.revokeRefreshToken).toHaveBeenCalledWith(oldToken, mockLog);
      expect(tokenService.generateAccessAndRefreshToken).toHaveBeenCalledWith(1);
    });

    it("should throw if old token is invalid", async () => {
      mockTokenRepo.getValidRefreshToken.mockResolvedValue(null);
      await expect(tokenService.validateAndReRefreshToken("invalid-token", mockLog)).rejects.toThrow("Invalid refresh token");
    });
  });
});
