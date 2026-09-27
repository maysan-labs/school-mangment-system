require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- SCANNING POLICIES FOR POTENTIAL UUID/TEXT COMPARISONS ---');
  const res = await client.query(`
    SELECT 
        tablename,
        policyname,
        cmd,
        qual,
        with_check
    FROM pg_policies
    WHERE schemaname = 'public';
  `);
  
  for (const row of res.rows) {
    const qual = row.qual || '';
    const withCheck = row.with_check || '';
    
    // Check if qual or withCheck compares something to 'admin'
    // E.g., column = 'admin' where column is a UUID
    // Or auth.uid() = 'admin'
    if (qual.includes("'admin'") || withCheck.includes("'admin'") || qual.includes('"admin"') || withCheck.includes('"admin"')) {
      console.log(`\nTable: ${row.tablename} | Policy: ${row.policyname}`);
      if (qual) console.log(`  Qual: ${qual}`);
      if (withCheck) console.log(`  With Check: ${withCheck}`);
    }
  }

  await client.end();
}

main().catch(console.error);
