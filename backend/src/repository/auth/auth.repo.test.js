import { Pool } from "pg";
import { AuthRepository } from "./auth.repo.js";
import { hashPassword } from "../../../utils/auth.js";

// This URL is loaded from .env.test by the `dotenv-cli` command in package.json
const TEST_DB_URL = process.env.DB_URL;

if (!TEST_DB_URL) {
  throw new Error("Missing DB_URL environment variable. Did you run with `pnpm test:integration:repo`?");
}

describe("AuthRepository (Integration)", () => {
  let pool;
  let client;
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
    await client.query("BEGIN"); // Start transaction
    authRepo = new AuthRepository(client); // Use the transaction client

    // Seed a user for tests
    const hashedPassword = await hashPassword("password123");
    const res = await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id`,
      ["testuser", hashedPassword, "Test User", "kepala_desa"]
    );
    testUserId = res.rows[0].user_id;
  });

  afterEach(async () => {
    await client.query("ROLLBACK"); // Undo all changes
    client.release();
  });

  describe("getUserByUsername", () => {
    it("should return a user if one exists", async () => {
      const user = await authRepo.getUserByUsername("testuser");
      expect(user).toBeDefined();
      expect(user.username).toBe("testuser");
      expect(user.role).toBe("kepala_desa");
    });

    it("should return null if user does not exist", async () => {
      const user = await authRepo.getUserByUsername("nonexistent");
      expect(user).toBeNull();
    });
  });

  describe("getUserByID", () => {
    it("should return a user by their ID", async () => {
      const user = await authRepo.getUserByID(testUserId);
      expect(user).toBeDefined();
      expect(user.user_id).toBe(testUserId);
      expect(user.username).toBe("testuser");
    });

    it("should return null if user ID does not exist", async () => {
      const user = await authRepo.getUserByID(999999);
      expect(user).toBeNull();
    });
  });
});
