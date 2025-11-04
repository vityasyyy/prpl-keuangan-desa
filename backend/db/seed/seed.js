
import bcrypt from "bcrypt";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const users = [
  { username: "kades", full_name: "Kepala Desa", role: "kades" },
  { username: "sekdes", full_name: "Sekretaris Desa", role: "sekretaris_desa" },
  { username: "kaur_keuangan", full_name: "Kaur Keuangan", role: "kaur_keuangan" },
  { username: "kaur_perencanaan", full_name: "Kaur Perencanaan", role: "kaur_perencanaan" },
  { username: "kaur_tu_umum", full_name: "Kaur TU & Umum", role: "kaur_tu_umum" },
  { username: "kasi_pemerintahan", full_name: "Kasi Pemerintahan", role: "kasi_pemerintahan" },
  { username: "kasi_kesejahteraan", full_name: "Kasi Kesejahteraan", role: "kasi_kesejahteraan" },
  { username: "kasi_pelayanan", full_name: "Kasi Pelayanan", role: "kasi_pelayanan" },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log("🌱 Starting user seed...");
    await client.query("BEGIN");

    for (const u of users) {
      const plainPassword = `${u.role}_desa_6769`;
      const hashed = await bcrypt.hash(plainPassword, 10);

      // Generate a unique ID based on username
      const userId = u.username;

      const result = await client.query(
        `INSERT INTO users (id, username, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             full_name = EXCLUDED.full_name,
             role = EXCLUDED.role
         RETURNING id, username, role;`,
        [userId, u.username, hashed, u.full_name, u.role]
      );

      const row = result.rows[0];
      console.log(`✅ Seeded user: ${row.username} (${row.role})`);
      console.log(`   → password: ${plainPassword}`);
    }

    await client.query("COMMIT");
    console.log("🎉 All users seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
