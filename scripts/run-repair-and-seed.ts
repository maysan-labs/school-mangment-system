import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { Client } from "pg";

async function runRepairAndSeed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected successfully!");

    // 1. REPAIR SCHEMA (CLASSES & SUBJECTS)
    console.log("Repairing Classes table schema...");
    await client.query(`
      ALTER TABLE public.classes 
      ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    `);
    
    console.log("Repairing Subjects table schema...");
    await client.query(`
      ALTER TABLE public.subjects 
      ADD COLUMN IF NOT EXISTS credits INT DEFAULT 3,
      ADD COLUMN IF NOT EXISTS syllabus TEXT;
    `);
    console.log("Schema repair complete!");

    // 2. DEDUPLICATE & UPDATE SUBJECTS
    console.log("Cleaning up subjects table...");
    await client.query(`
      -- Deduplicate subjects based on code, keeping the oldest one
      WITH cte AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY code ORDER BY created_at) as rn
        FROM public.subjects
        WHERE code IS NOT NULL
      )
      DELETE FROM public.subjects
      WHERE id IN (SELECT id FROM cte WHERE rn > 1);

      -- Update all credits and descriptions to be highly realistic and complete
      UPDATE public.subjects
      SET credits = 4, description = 'Advanced algebra, geometry, trigonometry, and analytical calculus.'
      WHERE name ILIKE 'Mathematics' OR code ILIKE 'MATH%';

      UPDATE public.subjects
      SET credits = 4, description = 'Comprehensive study of physics, chemistry, and biology with lab work.'
      WHERE name ILIKE 'Science' OR code ILIKE 'SCI%';

      UPDATE public.subjects
      SET credits = 3, description = 'English grammar, vocabulary, literary analysis, and creative writing.'
      WHERE name ILIKE 'English%' OR code ILIKE 'ENG%';

      UPDATE public.subjects
      SET credits = 3, description = 'Analysis of ancient civilizations, world history, and regional geography.'
      WHERE name ILIKE 'History' OR code ILIKE 'HIST%';

      UPDATE public.subjects
      SET credits = 4, description = 'Introduction to coding, logic building, data structures, and computer science basics.'
      WHERE name ILIKE 'Computer%' OR code ILIKE 'CS%';

      -- Ensure default credits/description for other subjects
      UPDATE public.subjects
      SET credits = 3
      WHERE credits IS NULL OR credits = 0;

      UPDATE public.subjects
      SET description = 'Standard academic syllabus following institutional guidelines.'
      WHERE description IS NULL OR description = '';
    `);
    console.log("Subjects cleaned and updated!");

    // 3. POPULATE DEMO FACULTY (HR ATTENDANCE CARD MATCHING NAMES)
    console.log("Populating realistic staff profiles, staff records, and teachers...");
    await client.query(`
      -- Ensure we have realistic profiles for staff/teachers
      INSERT INTO public.profiles (id, full_name, role, email)
      VALUES 
        ('f1111111-1111-4111-f111-111111111111', 'Dr. Aris V.', 'teacher', 'aris@edufox.com'),
        ('f2222222-2222-4222-f222-222222222222', 'Prof. Sarah Jenkins', 'teacher', 'sarah@edufox.com'),
        ('f3333333-3333-4333-f333-333333333333', 'Marcus Thorne', 'teacher', 'marcus@edufox.com'),
        ('f4444444-4444-4444-f444-444444444444', 'Elena Rostova', 'teacher', 'elena@edufox.com'),
        ('f5555555-5555-4555-f555-555555555555', 'Rajesh Kumar', 'teacher', 'rajesh@edufox.com'),
        ('f6666666-6666-4666-f666-666666666666', 'Sanjay Mandal', 'teacher', 'sanjay@edufox.com'),
        ('f7777777-7777-4777-f777-777777777777', 'Amanda B.', 'teacher', 'amanda@edufox.com'),
        ('f8888888-8888-4888-f888-888888888888', 'Vikram Seth', 'teacher', 'vikram@edufox.com')
      ON CONFLICT (id) DO UPDATE SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

      -- Populate the staff table
      INSERT INTO public.staff (id, first_name, last_name, email, staff_type, monthly_salary, status, department_id)
      VALUES
        ('f1111111-1111-4111-f111-111111111111', 'Aris', 'V.', 'aris@edufox.com', 'teaching', 75000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f2222222-2222-4222-f222-222222222222', 'Sarah', 'Jenkins', 'sarah@edufox.com', 'teaching', 68000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f3333333-3333-4333-f333-333333333333', 'Marcus', 'Thorne', 'marcus@edufox.com', 'teaching', 62000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f4444444-4444-4444-f444-444444444444', 'Elena', 'Rostova', 'elena@edufox.com', 'teaching', 58000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f5555555-5555-4555-f555-555555555555', 'Rajesh', 'Kumar', 'rajesh@edufox.com', 'teaching', 52000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f6666666-6666-4666-f666-666666666666', 'Sanjay', 'Mandal', 'sanjay@edufox.com', 'teaching', 65000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f7777777-7777-4777-f777-777777777777', 'Amanda', 'B.', 'amanda@edufox.com', 'teaching', 60000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1)),
        ('f8888888-8888-4888-f888-888888888888', 'Vikram', 'Seth', 'vikram@edufox.com', 'teaching', 55000, 'active', (SELECT id FROM public.departments WHERE name = 'Teaching' LIMIT 1))
      ON CONFLICT (id) DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        monthly_salary = EXCLUDED.monthly_salary,
        status = EXCLUDED.status;

      -- Populate the teachers table for timetable/grading dependencies
      INSERT INTO public.teachers (id, employee_id, specialization, qualification, joining_date)
      VALUES
        ('f1111111-1111-4111-f111-111111111111', 'EMP-001', ARRAY['Mathematics'], 'PhD in Mathematics', '2020-01-15'),
        ('f2222222-2222-4222-f222-222222222222', 'EMP-002', ARRAY['Science'], 'MA in Physics', '2021-06-20'),
        ('f3333333-3333-4333-f333-333333333333', 'EMP-003', ARRAY['Computer Science'], 'M.Tech CSE', '2022-03-10'),
        ('f4444444-4444-4444-f444-444444444444', 'EMP-004', ARRAY['English'], 'MA in English Literature', '2023-01-12')
      ON CONFLICT (id) DO UPDATE SET
        employee_id = EXCLUDED.employee_id;
    `);

    // 4. ASSIGN REASONABLE TEACHERS TO CLASSES
    console.log("Assigning teachers to existing classes...");
    await client.query(`
      UPDATE public.classes SET teacher_id = 'f1111111-1111-4111-f111-111111111111', room_number = 'Room 101' WHERE name = 'Grade 10';
      UPDATE public.classes SET teacher_id = 'f2222222-2222-4222-f222-222222222222', room_number = 'Room 201' WHERE name = 'Grade 11';
      UPDATE public.classes SET teacher_id = 'f3333333-3333-4333-f333-333333333333', room_number = 'Room 301' WHERE name = 'Grade 12';
    `);

    // 5. GENERATE TODAY'S STUDENT ATTENDANCE (REALTIME DEMO FOR CLIENT)
    console.log("Seeding today's student attendance...");
    await client.query(`
      -- Generate 5 unique students if missing
      INSERT INTO public.profiles (id, full_name, role, email)
      VALUES 
        ('d1111111-1111-4111-d111-111111111111', 'Ethan Hunt', 'student', 'ethan@student.com'),
        ('d2222222-2222-4222-d222-222222222222', 'Selina Kyle', 'student', 'selina@student.com'),
        ('d3333333-3333-4333-d333-333333333333', 'Bruce Wayne', 'student', 'bruce@student.com'),
        ('d4444444-4444-4444-d444-444444444444', 'Diana Prince', 'student', 'diana@student.com'),
        ('d5555555-5555-4555-d555-555555555555', 'Clark Kent', 'student', 'clark@student.com')
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.students (id, admission_number, roll_number, class_id, date_of_birth, gender)
      VALUES 
        ('d1111111-1111-4111-d111-111111111111', 'ADM-1001', '1001', 'c1111111-1111-4111-c111-111111111111', '2008-05-12', 'Male'),
        ('d2222222-2222-4222-d222-222222222222', 'ADM-1002', '1002', 'c1111111-1111-4111-c111-111111111111', '2008-09-21', 'Female'),
        ('d3333333-3333-4333-d333-333333333333', 'ADM-1003', '1003', 'c1111111-1111-4111-c111-111111111111', '2007-12-01', 'Male'),
        ('d4444444-4444-4444-d444-444444444444', 'ADM-1004', '1004', 'c2222222-2222-4222-c222-222222222222', '2006-03-15', 'Female'),
        ('d5555555-5555-4555-d555-555555555555', 'ADM-1005', '1005', 'c2222222-2222-4222-c222-222222222222', '2006-11-28', 'Male')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Student Attendance for Today (Present/Absent/Leave stats)
      INSERT INTO public.attendance (student_id, class_id, date, status, marked_by)
      VALUES 
        ('d1111111-1111-4111-d111-111111111111', 'c1111111-1111-4111-c111-111111111111', CURRENT_DATE, 'present', 'f1111111-1111-4111-f111-111111111111'),
        ('d2222222-2222-4222-d222-222222222222', 'c1111111-1111-4111-c111-111111111111', CURRENT_DATE, 'present', 'f1111111-1111-4111-f111-111111111111'),
        ('d3333333-3333-4333-d333-333333333333', 'c1111111-1111-4111-c111-111111111111', CURRENT_DATE, 'present', 'f1111111-1111-4111-f111-111111111111'),
        ('d4444444-4444-4444-d444-444444444444', 'c2222222-2222-4222-c222-222222222222', CURRENT_DATE, 'absent', 'f1111111-1111-4111-f111-111111111111'),
        ('d5555555-5555-4555-d555-555555555555', 'c2222222-2222-4222-c222-222222222222', CURRENT_DATE, 'present', 'f1111111-1111-4111-f111-111111111111')
      ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status;
    `);

    // 6. GENERATE TODAY'S STAFF ATTENDANCE
    console.log("Seeding today's staff attendance...");
    await client.query(`
      INSERT INTO public.staff_attendance (staff_id, date, status, check_in_time)
      VALUES 
        ('f1111111-1111-4111-f111-111111111111', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '8 hours 45 minutes'),
        ('f2222222-2222-4222-f222-222222222222', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '8 hours 50 minutes'),
        ('f3333333-3333-4333-f333-333333333333', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '8 hours 58 minutes'),
        ('f4444444-4444-4444-f444-444444444444', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '9 hours 02 minutes'),
        ('f5555555-5555-4555-f555-555555555555', CURRENT_DATE, 'absent', NULL),
        ('f6666666-6666-4666-f666-666666666666', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '8 hours 40 minutes'),
        ('f7777777-7777-4777-f777-777777777777', CURRENT_DATE, 'present', CURRENT_DATE + INTERVAL '8 hours 52 minutes')
      ON CONFLICT (staff_id, date) DO UPDATE SET status = EXCLUDED.status;
    `);

    // 7. SEED FINANCE TRANSACTIONS (COLLECTIONS & EXPENSES)
    console.log("Seeding collections and expenses...");
    await client.query(`
      -- Ensure we have some active fees
      INSERT INTO public.fees (id, name, amount, due_date, class_id, fee_type)
      VALUES 
        ('fe111111-1111-4111-fe11-111111111111', 'Tuition Fee - Term 1', 15000, CURRENT_DATE + INTERVAL '10 days', 'c1111111-1111-4111-c111-111111111111', 'tuition'),
        ('fe222222-2222-4222-fe22-222222222222', 'Annual Sports Fee', 2500, CURRENT_DATE - INTERVAL '10 days', 'c1111111-1111-4111-c111-111111111111', 'sports')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Payments for collections
      INSERT INTO public.payments (student_id, fee_id, amount_paid, payment_date, payment_method, status, receipt_number)
      VALUES 
        ('d1111111-1111-4111-d111-111111111111', 'fe111111-1111-4111-fe11-111111111111', 15000, CURRENT_DATE, 'online', 'completed', 'RCP-10029'),
        ('d2222222-2222-4222-d222-222222222222', 'fe111111-1111-4111-fe11-111111111111', 15000, CURRENT_DATE - INTERVAL '1 day', 'online', 'completed', 'RCP-10030'),
        ('d3333333-3333-4333-d333-333333333333', 'fe222222-2222-4222-fe22-222222222222', 2500, CURRENT_DATE - INTERVAL '2 days', 'cash', 'completed', 'RCP-10031'),
        ('d4444444-4444-4444-d444-444444444444', 'fe222222-2222-4222-fe22-222222222222', 2500, CURRENT_DATE, 'upi', 'completed', 'RCP-10032')
      ON CONFLICT DO NOTHING;

      -- Create an expenses/outflow simulation (e.g. staff payroll) if missing
      INSERT INTO public.staff_payrolls (staff_id, base_salary, bonuses, deductions, month, year, status, payment_date)
      VALUES 
        ('f1111111-1111-4111-f111-111111111111', 75000, 5000, 2000, EXTRACT(MONTH FROM CURRENT_DATE)::int, EXTRACT(YEAR FROM CURRENT_DATE)::int, 'paid', CURRENT_DATE),
        ('f2222222-2222-4222-f222-222222222222', 68000, 0, 1500, EXTRACT(MONTH FROM CURRENT_DATE)::int, EXTRACT(YEAR FROM CURRENT_DATE)::int, 'paid', CURRENT_DATE)
      ON CONFLICT (staff_id, month, year) DO UPDATE SET status = 'paid', payment_date = CURRENT_DATE;
    `);

    console.log("All repair and showcase seeding successfully completed!");
  } catch (err) {
    console.error("Critical Execution Failure:", err);
  } finally {
    await client.end();
  }
}

runRepairAndSeed();
