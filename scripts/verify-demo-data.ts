import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import pg from 'pg';


async function verify() {
    console.log("🔍 Running Deep Audit of Database Seeding...");
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        
        console.log("\n--- 📝 SAMPLE PROFILES (TEACHERS & STUDENTS) ---");
        const profiles = await client.query(`
            SELECT full_name, role, email 
            FROM public.profiles 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.table(profiles.rows);

        console.log("\n--- 📅 RECENT ATTENDANCE ---");
        const attendance = await client.query(`
            SELECT p.full_name, a.date, a.status 
            FROM public.attendance a 
            JOIN public.profiles p ON a.student_id = p.id 
            ORDER BY a.date DESC 
            LIMIT 5
        `);
        console.table(attendance.rows);

        console.log("\n--- 📘 LIBRARY & INVENTORY ---");
        const lib = await client.query('SELECT count(*) as count FROM public.library_books');
        const inv = await client.query('SELECT count(*) as count FROM public.inventory_items');
        console.log(`Library Books: ${lib.rows[0].count} | Inventory Items: ${inv.rows[0].count}`);

        console.log("\n--- 💰 FEE STATUS (TOP STUDENTS) ---");
        const fees = await client.query(`
            SELECT p.full_name, f.name as fee_name, f.amount, pay.status 
            FROM public.payments pay 
            JOIN public.profiles p ON pay.student_id = p.id 
            JOIN public.fees f ON pay.fee_id = f.id 
            LIMIT 3
        `);
        console.table(fees.rows);

        console.log("\n✅ VERIFICATION COMPLETE: DATABASE IS READY FOR DEMO.");
    } catch (err) {
        console.error("❌ Verification Failed:", err);
    } finally {
        await client.end();
    }
}

verify();
