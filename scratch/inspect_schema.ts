import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";

async function inspectSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Inspect students table columns
    console.log("\n--- Students Table Columns ---");
    const { rows: columns } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
      ORDER BY ordinal_position;
    `);
    columns.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

    // Inspect foreign keys for students
    console.log("\n--- Students Foreign Keys ---");
    const { rows: fks } = await client.query(`
      SELECT
          tc.constraint_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
      FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='students';
    `);
    fks.forEach(fk => console.log(`- ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`));

    // Check if profiles table has first_name, last_name, gender
    console.log("\n--- Profiles Table Columns ---");
    const { rows: profileCols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles'
      AND column_name IN ('first_name', 'last_name', 'gender');
    `);
    profileCols.forEach(c => console.log(`- ${c.column_name} (${c.data_type})`));

  } catch (err) {
    console.error("Inspection Failed:", err);
  } finally {
    await client.end();
  }
}

inspectSchema();
