require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

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
