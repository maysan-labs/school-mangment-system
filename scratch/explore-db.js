require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
const { Client } = require('pg');

async function exploreDB() {
  const connectionString = process.env.DATABASE_URL;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    for (const table of ['transactions', 'staff_attendance']) {
        console.log(`\n--- COLUMNS: ${table} ---`);
        const colsRes = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = '${table}'
        `);
        console.log(colsRes.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

exploreDB();
