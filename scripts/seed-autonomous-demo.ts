import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function seedAutonomousDemo() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully!");

    const engineSqlPath = path.join(process.cwd(), "migrations", "timetable_autonomous_engine.sql");
    const engineSql = fs.readFileSync(engineSqlPath, "utf8");
    console.log("Re-applying autonomous engine (to fix trigger)...");
    await client.query(engineSql);

    const sqlPath = path.join(process.cwd(), "migrations", "20260507_autonomous_demo_data.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Applying autonomous demo data...");
    await client.query(sql);
    console.log("Demo data applied successfully!");

    // Verify proxy assignment
    const proxyCheck = await client.query(`
        SELECT ts.is_proxy, ts.proxy_reason, p.full_name, s.first_name, s.last_name
        FROM timetable_slots ts
        JOIN staff s ON s.id = ts.teacher_id
        LEFT JOIN profiles p ON p.id = s.user_id
        WHERE ts.is_proxy = TRUE
        LIMIT 1;
    `);

    if (proxyCheck.rows.length > 0) {
        const row = proxyCheck.rows[0];
        const teacherName = row.full_name || `${row.first_name} ${row.last_name}`;
        console.log("\nProxy Verification:");
        console.log("- Proxy Teacher:", teacherName);
        console.log("- Reason:", row.proxy_reason);
    } else {
        console.log("\nNote: No active proxy found yet (might depend on today's weekday matching demo).");
    }

  } catch (err) {
    console.error("Seeding Failure:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAutonomousDemo();
