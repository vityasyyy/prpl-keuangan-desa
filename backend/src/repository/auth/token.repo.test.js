import { Pool } from "pg";
import { RefreshTokenRepository } from "./token.repo.js";
import { AuthRepository } from "./auth.repo.js";
import { RefreshToken } from "../../model/auth/auth.model.js";
import { hashPassword } from "../../../utils/auth.js";
import { configDotenv } from "dotenv";
configDotenv({ path: ".env.test" });
const TEST_DB_URL = process.env.DB_URL_TEST;

if (!TEST_DB_URL) {
  throw new Error("Missing DB_URL environment variable. Did you run with `pnpm test:integration:repo`?");
}

describe("RefreshTokenRepository (Integration)", () => {
  let pool;
  let client;
  let tokenRepo;
  let authRepo;
  let testUserId;

  beforeAll(() => {
    pool = new Pool({ connectionString: TEST_DB_URL });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    client = await pool.connect();
    await client.query("BEGIN");
    tokenRepo = new RefreshTokenRepository(client);
    authRepo = new AuthRepository(client); // Need this to create a user first

    const hashedPassword = await hashPassword("password123");
    const res = await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('tokenuser', $1, 'Token User', 'sekretaris_desa')
       RETURNING user_id`,
      [hashedPassword]
    );
    testUserId = res.rows[0].user_id;
  });

  afterEach(async () => {
    await client.query("ROLLBACK");
    client.release();
  });

  describe("storeRefreshToken and getValidRefreshToken", () => {
    it("should store a token and retrieve it", async () => {
      const token = new RefreshToken({
        refresh_token: "test-token-123",
        user_id: testUserId,
        expiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      });

      await tokenRepo.storeRefreshToken(token);

      const retrieved = await tokenRepo.getValidRefreshToken("test-token-123");

      expect(retrieved).toBeDefined();
      expect(retrieved.user_id).toBe(testUserId);
      expect(retrieved.refresh_token).toBe("test-token-123");
    });
  });

  describe("revokeRefreshToken", () => {
    it("should revoke a valid token", async () => {
      const token = new RefreshToken({
        refresh_token: "token-to-revoke",
        user_id: testUserId,
        expiry: new Date(Date.now() + 1000 * 60 * 60),
      });
      await tokenRepo.storeRefreshToken(token);

      let retrieved = await tokenRepo.getValidRefreshToken("token-to-revoke");
      expect(retrieved).not.toBeNull(); // Ensure it exists first

      await tokenRepo.revokeRefreshToken("token-to-revoke");

      retrieved = await tokenRepo.getValidRefreshToken("token-to-revoke");
      expect(retrieved).toBeNull(); // Should be null now
    });
  });
});
