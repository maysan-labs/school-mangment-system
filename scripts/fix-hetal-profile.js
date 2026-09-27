require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function fixUser() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    
    // 1. Find the user by partial ID or name
    const { rows } = await client.query("SELECT * FROM public.profiles WHERE full_name ILIKE '%hetal%' OR id::text LIKE '6386ba1d%'");
    
    if (rows.length === 0) {
      console.log("User not found!");
      return;
    }

    const user = rows[0];
    console.log("Current User Record:", JSON.stringify(user, null, 2));

    // 2. Update the record with correct data
    // The user said: hetal@maysanlabs.com, name Hetal, Role Admin
    const updateResult = await client.query(`
      UPDATE public.profiles 
      SET 
        email = 'hetal@maysanlabs.com',
        full_name = 'Hetal',
        role = 'admin',
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [user.id]);

    console.log("Updated User Record:", JSON.stringify(updateResult.rows[0], null, 2));

  } catch (err) {
    console.error("Fix Failure:", err);
  } finally {
    await client.end();
  }
}

fixUser();
