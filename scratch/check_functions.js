require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- CUSTOM RBAC FUNCTIONS ---');
  const res = await client.query(`
    SELECT 
        routine_name,
        routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND (routine_name LIKE '%role%' OR routine_name LIKE '%admin%' OR routine_name LIKE '%permission%');
  `);
  
  for (const row of res.rows) {
    console.log(`\nFunction: ${row.routine_name}`);
    console.log(row.routine_definition);
  }

  await client.end();
}

main().catch(console.error);
