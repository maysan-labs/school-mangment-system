import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";

async function inspectProfiles() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Inspect profiles table columns
    console.log("\n--- Profiles Table Columns ---");
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error("Inspection Failed:", err);
  } finally {
    await client.end();
  }
}

inspectProfiles();
