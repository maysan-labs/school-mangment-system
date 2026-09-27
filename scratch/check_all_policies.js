require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- ALL RLS POLICIES ---');
  const res = await client.query(`
    SELECT 
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
  `);
  
  for (const row of res.rows) {
    console.log(`\nTable: ${row.tablename} | Policy: ${row.policyname}`);
    console.log(`Command: ${row.cmd}`);
    console.log(`Qual (USING): ${row.qual}`);
    console.log(`With Check: ${row.with_check}`);
  }

  await client.end();
}

main().catch(console.error);
