require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function fixHetal() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    
    // 1. Find the user by partial ID or name
    const { rows } = await client.query("SELECT id FROM public.profiles WHERE full_name ILIKE '%hetal%' LIMIT 1");
    
    if (rows.length === 0) {
      console.log("Hetal not found in profiles!");
      return;
    }

    const userId = rows[0].id;
    console.log("Full User ID Found:", userId);

    // 2. Perform the fix
    const { rowCount } = await client.query(`
      UPDATE public.profiles 
      SET 
        email = 'hetal@maysanlabs.com',
        full_name = 'Hetal',
        role = 'admin',
        updated_at = NOW()
      WHERE id = $1
    `, [userId]);

    if (rowCount > 0) {
      console.log("Profile successfully updated for Hetal.");
    } else {
      console.log("Failed to update profile.");
    }

    // 3. Just in case, update metadata in auth.users if possible
    // (Note: This depends on extensions/permissions, but usually admin can't touch auth.users directly via PG unless using specific functions)
    // We'll trust the server actions to handle sync later if needed.

  } catch (err) {
    console.error("Execution Failure:", err);
  } finally {
    await client.end();
  }
}

fixHetal();
