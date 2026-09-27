import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

async function syncDatabase() {
  // Using individual config to avoid URL parsing errors with special chars in password
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully!");

    // 1. Repair Schema
    console.log("Applying schema repairs...");
    const repairSql = `
      -- 1. REPAIR CLASS SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='capacity') THEN ALTER TABLE public.classes ADD COLUMN capacity INT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='room_number') THEN ALTER TABLE public.classes ADD COLUMN room_number TEXT; END IF;
      END $$;

      -- 2. REPAIR PROFILE SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN ALTER TABLE public.profiles ADD COLUMN full_name TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN ALTER TABLE public.profiles ADD COLUMN role TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(); END IF;
      END $$;

      -- 3. REPAIR ATTENDANCE SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='marked_by') THEN ALTER TABLE public.attendance ADD COLUMN marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL; END IF;
      END $$;

      -- 4. REPAIR TRANSPORT SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bus_routes' AND column_name='route_number') THEN ALTER TABLE public.bus_routes ADD COLUMN route_number TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bus_routes' AND column_name='driver_name') THEN ALTER TABLE public.bus_routes ADD COLUMN driver_name TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bus_routes' AND column_name='driver_phone') THEN ALTER TABLE public.bus_routes ADD COLUMN driver_phone TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bus_routes' AND column_name='plate_number') THEN ALTER TABLE public.bus_routes ADD COLUMN plate_number TEXT; END IF;
      END $$;

      -- 5. REPAIR FEES & PAYMENTS SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='fee_type') THEN ALTER TABLE public.fees ADD COLUMN fee_type TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='receipt_number') THEN ALTER TABLE public.payments ADD COLUMN receipt_number TEXT; END IF;
      END $$;

      -- 6. REPAIR LIBRARY & INVENTORY SCHEMA
      DO $$ BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library_books' AND column_name='total_copies') THEN ALTER TABLE public.library_books ADD COLUMN total_copies INT DEFAULT 1; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library_books' AND column_name='available_copies') THEN ALTER TABLE public.library_books ADD COLUMN available_copies INT DEFAULT 1; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='library_books' AND column_name='shelf_location') THEN ALTER TABLE public.library_books ADD COLUMN shelf_location TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='category') THEN ALTER TABLE public.inventory_items ADD COLUMN category TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='sku') THEN ALTER TABLE public.inventory_items ADD COLUMN sku TEXT; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='quantity_in_stock') THEN ALTER TABLE public.inventory_items ADD COLUMN quantity_in_stock INT DEFAULT 0; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='unit_price') THEN ALTER TABLE public.inventory_items ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0; END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='min_stock_level') THEN ALTER TABLE public.inventory_items ADD COLUMN min_stock_level INT DEFAULT 0; END IF;
      END $$;

      -- 7. DECOUPLE PROFILES FROM AUTH.USERS (CRITICAL FOR SHOWCASE)
      ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
      
      -- 8. ENSURE UNIQUE CONSTRAINTS (FOR SEEDING)
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'academic_years_name_key') THEN ALTER TABLE public.academic_years ADD CONSTRAINT academic_years_name_key UNIQUE (name); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key') THEN ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teachers_employee_id_key') THEN ALTER TABLE public.teachers ADD CONSTRAINT teachers_employee_id_key UNIQUE (employee_id); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_admission_number_key') THEN ALTER TABLE public.students ADD CONSTRAINT students_admission_number_key UNIQUE (admission_number); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subjects_code_key') THEN ALTER TABLE public.subjects ADD CONSTRAINT subjects_code_key UNIQUE (code); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_sku_key') THEN ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_sku_key UNIQUE (sku); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_student_date_key') THEN ALTER TABLE public.attendance ADD CONSTRAINT attendance_student_date_key UNIQUE (student_id, date); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marks_exam_student_subject_key') THEN ALTER TABLE public.marks ADD CONSTRAINT marks_exam_student_subject_key UNIQUE (exam_id, student_id, subject_id); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_payrolls_staff_month_year_key') THEN ALTER TABLE public.staff_payrolls ADD CONSTRAINT staff_payrolls_staff_month_year_key UNIQUE (staff_id, month, year); END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bus_routes_route_number_key') THEN ALTER TABLE public.bus_routes ADD CONSTRAINT bus_routes_route_number_key UNIQUE (route_number); END IF;
      END $$;
    `;
    await client.query(repairSql);
    console.log("Schema repair complete.");

    // 2. High-Level Dependency Seeding (Academic Years + Classes)
    console.log("Seeding core dependencies (Years & Classes)...");
    const coreSeedSql = `
      DO $$ 
      DECLARE 
          ay_23_id UUID;
          ay_24_id UUID;
      BEGIN
          -- Clear existing "Current" flags to prevent index violations
          UPDATE public.academic_years SET is_current = false;

          -- Upsert Academic Year 2023-24
          INSERT INTO public.academic_years (name, start_date, end_date, is_current)
          VALUES ('Academic Year 2023-24', '2023-04-01', '2024-03-31', false)
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id INTO ay_23_id;

          -- Upsert Academic Year 2024-25
          INSERT INTO public.academic_years (name, start_date, end_date, is_current)
          VALUES ('Academic Year 2024-25', '2024-04-01', '2025-03-31', true)
          ON CONFLICT (name) DO UPDATE SET is_current = true
          RETURNING id INTO ay_24_id;

          -- Seed Classes
          INSERT INTO public.classes (id, name, capacity, room_number, academic_year_id)
          VALUES 
              ('c1111111-1111-4111-c111-111111111111', 'Grade 10', 40, 'R-101', ay_24_id),
              ('c2222222-2222-4222-c222-222222222222', 'Grade 11', 35, 'R-201', ay_24_id),
              ('c3333333-3333-4333-c333-333333333333', 'Grade 12', 30, 'R-301', ay_24_id)
          ON CONFLICT (id) DO NOTHING;
      END $$;
    `;
    await client.query(coreSeedSql);

    // 3. Batch Seeding from seed-data.sql (Everything after line 31)
    console.log("Loading base demo data...");
    const seedFilePath = path.join(process.cwd(), "seed-data.sql");
    const fullSeedSql = fs.readFileSync(seedFilePath, "utf8");
    const lines = fullSeedSql.split("\n");
    const filteredSeedSql = lines.slice(30).join("\n"); 
    await client.query(filteredSeedSql);

    // 4. DYNAMIC "SHOWCASE" DATA (LIVE LOOKING)
    console.log("Generating dynamic showcase data (Today's Attendance, Recent Transactions)...");
    const dynamicSeedSql = `
      -- 1. Ensure Today's Attendance exists for Grade 10
      INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
      SELECT 
          s.id,
          s.class_id,
          CURRENT_DATE,
          CASE WHEN random() > 0.05 THEN 'present' ELSE 'absent' END,
          'f1111111-1111-4111-f111-111111111111'
      FROM public.students s
      WHERE s.class_id = 'c1111111-1111-4111-c111-111111111111'
      ON CONFLICT (student_id, date) DO NOTHING;

      -- 2. Generate Library Transactions in the last 7 days
      INSERT INTO public.library_transactions (book_id, student_id, issue_date, due_date, status)
      SELECT 
          b.id,
          s.id,
          CURRENT_DATE - (floor(random() * 7))::int,
          CURRENT_DATE + 14,
          'issued'
      FROM 
          (SELECT id FROM public.library_books LIMIT 3) b,
          (SELECT id FROM public.students LIMIT 3) s
      ON CONFLICT DO NOTHING;

      -- 3. Add some Timetable Slots for Today if missing
      DO $$
      DECLARE
          tt_id UUID;
      BEGIN
          -- Ensure a timetable exists for Grade 10
          INSERT INTO public.timetables (class_id, academic_year_id, day_of_week)
          SELECT 
              'c1111111-1111-4111-c111-111111111111',
              (SELECT id FROM public.academic_years WHERE is_current = true),
              trim(to_char(CURRENT_DATE, 'Day'))
          ON CONFLICT DO NOTHING
          RETURNING id INTO tt_id;

          -- If not returned (already exists), fetch it
          IF tt_id IS NULL THEN
              SELECT id INTO tt_id FROM public.timetables 
              WHERE class_id = 'c1111111-1111-4111-c111-111111111111' 
              AND day_of_week = trim(to_char(CURRENT_DATE, 'Day'));
          END IF;

          IF tt_id IS NOT NULL THEN
              INSERT INTO public.timetable_slots (timetable_id, subject_id, teacher_id, start_time, end_time, room_number)
              SELECT 
                  tt_id,
                  sub.id,
                  'f1111111-1111-4111-f111-111111111111',
                  '09:00',
                  '10:00',
                  'R-101'
              FROM (SELECT id FROM public.subjects WHERE code = 'MATH101') sub
              ON CONFLICT DO NOTHING;
          END IF;
      END $$;
    `;
    await client.query(dynamicSeedSql);
    console.log("Seeding complete!");

    // Verification
    const { rows: profileCount } = await client.query("SELECT count(*) FROM public.profiles");
    const { rows: studentCount } = await client.query("SELECT count(*) FROM public.students");
    console.log(`\nVerification:\n- Profiles: ${profileCount[0].count}\n- Students: ${studentCount[0].count}`);

  } catch (err) {
    console.error("Critical Sync Failure:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

syncDatabase();
