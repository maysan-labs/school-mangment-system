import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function applyMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully!");

    // 1. Apply Migration Script (update-db-v2.sql)
    console.log("Reading update-db-v2.sql...");
    const migrationPath = path.join(process.cwd(), "update-db-v2.sql");
    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, "utf8");
      console.log("Applying update-db-v2.sql...");
      await client.query(migrationSql);
      console.log("Migration v2 applied successfully.");
    } else {
      console.error("Migration file not found: update-db-v2.sql");
    }

    // 2. Refresh Seed Data (seed-data.sql)
    console.log("Reading seed-data.sql...");
    const seedFilePath = path.join(process.cwd(), "seed-data.sql");
    if (fs.existsSync(seedFilePath)) {
      const fullSeedSql = fs.readFileSync(seedFilePath, "utf8");
      console.log("Applying seed-data.sql...");
      // We wrap it in a transaction-like block or just execute
      // Note: seed-data.sql has ON CONFLICT DO NOTHING, so it's safe to re-run
      await client.query(fullSeedSql);
      console.log("Seed data refreshed successfully.");
    } else {
      console.error("Seed data file not found: seed-data.sql");
    }

    console.log("\nAll database updates completed successfully!");

  } catch (err) {
    console.error("Migration Failure:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
