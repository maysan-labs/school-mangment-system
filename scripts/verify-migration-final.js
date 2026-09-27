require("dotenv").config({ path: ".env.local" });
require("dotenv").config();
/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require("pg");

async function verifyMigration() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    
    const { rows: examCols } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'exams' 
      AND column_name IN ('subject_id', 'class_id', 'date', 'max_marks')
    `);
    
    const { rows: gatewayCount } = await client.query("SELECT count(*) FROM public.payment_gateways");
    const { rows: examCount } = await client.query("SELECT count(*) FROM public.exams");

    console.log("Verification Results:");
    console.log(`- New Exam Columns Found: ${examCols.length}`);
    console.log(`- Total Payment Gateways Seeded: ${gatewayCount[0].count}`);
    console.log(`- Total Exams Seeded: ${examCount[0].count}`);

  } catch (err) {
    console.error("Verification Failure:", err);
  } finally {
    await client.end();
  }
}

verifyMigration();
