"use server";

import { createClient } from "@/lib/supabase/server";
import { getStudentAttendance } from "@/app/actions/attendance";
import { getStudentResults } from "@/app/actions/exams";
import { getTimetableByClass } from "@/app/actions/timetable";
import type { ActionResult, StudentRecord } from "@/types/database";

export async function getStudentData(studentId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient();

        // 1. Verify if the current user has access to this student's data
        // A user can access data if:
        // - They are the student themselves
        // - They are a parent linked to this student
        // - They are an admin (checked via role in profile)
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { success: false, error: "Unauthorized: User not authenticated." };
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: "Unauthorized: Profile not found." };
        }

        if (profile.role !== 'admin') {
            if (user.id !== studentId) {
                // Check if the user is a parent of this student
                const { data: parentLink, error: linkError } = await supabase
                    .from("guardian_students")
                    .select("id")
                    .eq("guardian_id", user.id)
                    .eq("student_id", studentId)
                    .maybeSingle();

                if (linkError || !parentLink) {
                    return { success: false, error: "Unauthorized: You do not have permission to access this student's data." };
                }
            }
        }

        // 2. Fetch Student Basic Info and Class
        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("*, class:classes(*)")
            .eq("id", studentId)
            .single();

        if (studentError || !student) {
            return { success: false, error: "Student not found." };
        }

        // 3. Fetch Related Data in Parallel
        // Note: We use existing actions but since we are on server, 
        // we can call them or the logic they encapsulate.
        // For consistency with the requested "getStudentData" aggregator:
        
        const [attendanceData, resultsData] = await Promise.all([
            getStudentAttendance(studentId),
            getStudentResults(studentId)
        ]);

        // Timetable requires class_id and academic_year_id
        let timetableData: { success: boolean; data: unknown[] } = { success: false, data: [] };
        if (student.class_id) {
            // We need current academic year. This could be optimized.
            const { data: ay } = await supabase
                .from("academic_years")
                .select("id")
                .eq("is_current", true)
                .maybeSingle();

            if (ay) {
                timetableData = await getTimetableByClass(student.class_id, ay.id);
            }
        }

        return {
            success: true,
            data: {
                student,
                attendance: attendanceData.success ? attendanceData.data : [],
                results: resultsData.success ? resultsData.data : [],
                timetable: timetableData.success ? timetableData.data : []
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message || "An unexpected error occurred." };
    }
}
