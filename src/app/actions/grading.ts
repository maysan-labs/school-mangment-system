"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAudit } from "./audit";

/**
 * Grading Scale definition
 * Type: { grade: 'A', min_score: 90, max_score: 100, points: 4 }
 */
export async function updateGradingScale(scales: any[]) {
    try {
        const supabase = createAdminClient();
        
        // Use a transaction-like approach by deleting existing and inserting new
        // For a production system, we might want to use a proper table for grading_scales
        // but since we are using school_settings (KV store), we will store it as a JSON string.
        
        const jsonScales = JSON.stringify(scales);
        const { error } = await supabase
            .from("school_settings")
            .upsert({ key: "grading_scales", value: jsonScales, category: "academic" }, { onConflict: 'key' });

        if (error) throw error;

        await logAudit("UPDATE", "school_settings", "grading_scales", "Updated grading scales");
        
        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating grading scale:", error);
        return { success: false, error: error.message || "Failed to update grading scale" };
    }
}

export async function getGradingScale() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("school_settings")
            .select("value")
            .eq("key", "grading_scales")
            .single();

        if (error) throw error;
        return { data: data.value ? JSON.parse(data.value) : [] };
    } catch (error) {
        console.error("Error fetching grading scale:", error);
        return { data: [], error: "Failed to fetch grading scale" };
    }
}
