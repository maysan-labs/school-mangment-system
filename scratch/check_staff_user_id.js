require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- ALL user_id VALUES IN staff TABLE ---');
  const res = await client.query(`
    SELECT id, staff_id, first_name, last_name, user_id 
    FROM public.staff;
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
