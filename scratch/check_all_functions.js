require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- ALL FUNCTIONS CONTAINING "admin" ---');
  const res = await client.query(`
    SELECT 
        routine_name,
        routine_definition
    FROM information_schema.routines
    WHERE routine_schema = 'public';
  `);
  
  for (const row of res.rows) {
    if (row.routine_definition && row.routine_definition.toLowerCase().includes('admin')) {
      console.log(`\nFunction: ${row.routine_name}`);
      console.log(row.routine_definition);
    }
  }

  await client.end();
}

main().catch(console.error);
