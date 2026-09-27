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
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
    FROM pg_policies
    WHERE schemaname = 'public';
  `);
  
  for (const row of res.rows) {
    if (row.qual && row.qual.includes('admin')) {
      console.log(`\nPolicy: ${row.policyname} on ${row.tablename} (qual):`);
      console.log(row.qual);
    }
    if (row.with_check && row.with_check.includes('admin')) {
      console.log(`\nPolicy: ${row.policyname} on ${row.tablename} (with_check):`);
      console.log(row.with_check);
    }
  }

  await client.end();
}

main().catch(console.error);
