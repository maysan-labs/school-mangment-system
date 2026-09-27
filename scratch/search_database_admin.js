require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  await client.connect();

  console.log('--- COLUMN DEFAULTS CONTAINING "admin" ---');
  const resDefaults = await client.query(`
    SELECT 
        c.table_name, 
        c.column_name, 
        c.column_default
    FROM 
        information_schema.columns c
    WHERE 
        c.table_schema = 'public' 
        AND c.column_default LIKE '%admin%';
  `);
  console.table(resDefaults.rows);

  console.log('\n--- CHECK CONSTRAINTS CONTAINING "admin" ---');
  const resConstraints = await client.query(`
    SELECT 
        cc.constraint_name,
        cc.check_clause
    FROM 
        information_schema.check_constraints cc
    WHERE 
        cc.check_clause LIKE '%admin%';
  `);
  console.table(resConstraints.rows);

  await client.end();
}

main().catch(console.error);
