import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
})

async function main() {
  await client.connect()
  console.log("Connected to Supabase Postgres.")

  const tables = ['profiles', 'user_roles', 'staff', 'students']
  
  for (const table of tables) {
    console.log(`\n--- ${table} Columns ---`)
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table])
    res.rows.forEach(col => console.log(`- ${col.column_name} (${col.data_type})`))
  }

  await client.end()
}

main()
