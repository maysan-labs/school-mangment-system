require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- ALL ROWS IN user_roles ---');
  const res = await client.query(`
    SELECT * FROM public.user_roles;
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
