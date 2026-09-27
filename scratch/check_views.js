require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- ALL VIEWS ---');
  const res = await client.query(`
    SELECT 
        table_name,
        view_definition
    FROM information_schema.views
    WHERE table_schema = 'public';
  `);
  
  for (const row of res.rows) {
    console.log(`\nView: ${row.table_name}`);
    console.log(row.view_definition);
  }

  await client.end();
}

main().catch(console.error);
