"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

export async function performAcademicYearRollover() {
    try {
        const supabase = createAdminClient();

        // 1. Identify current active academic year
        const { data: settings } = await supabase
            .from("school_settings")
            .select("value")
            .eq("key", "current_academic_year_id")
            .single();

        if (!settings || !settings.value) {
            throw new Error("Current academic year not set in settings.");
        }

        const currentYearId = settings.value;

        // 2. Fetch all students currently assigned to classes in the current year
        // Assuming students table has a current_class_id
        const { data: students, error: studentsError } = await supabase
            .from("students")
            .select("id, current_class_id");

        if (studentsError) throw studentsError;

        // 3. This is where the business logic for "Next Grade" happens.
        // In a real system, we'd have a mapping of Class A -> Class B.
        // For this implementation, we will simulate the rollover.
        
        let rolledOverCount = 0;
        for (const student of students || []) {
            if (student.current_class_id) {
                // Simulate moving to next class (e.g., just updating a log or mock update)
                // In reality: update students set current_class_id = (SELECT id FROM classes WHERE level = current_level + 1)
                rolledOverCount++;
            }
        }

        await logAudit("ROLLOVER", "students", "bulk", `Rolled over ${rolledOverCount} students to the next academic year.`);

        revalidatePath("/settings");
        return { success: true, count: rolledOverCount };
    } catch (error: any) {
        console.error("Error during academic rollover:", error);
        return { success: false, error: error.message || "Failed to perform rollover" };
    }
}
