require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  const res = await client.query(`
    SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
    FROM 
        information_schema.table_constraints tc
    WHERE 
        tc.constraint_name = '2200_25895_2_not_null';
  `);
  console.table(res.rows);

  await client.end();
}

main().catch(console.error);
