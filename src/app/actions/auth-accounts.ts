"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface DatabaseAccount {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url?: string | null;
  status?: string | null;
}

/**
 * Returns count of actual accounts per role registered in the database.
 */
export async function getDatabaseAccountCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("role");

    if (error || !data) {
      return { admin: 0, teacher: 0, student: 0, parent: 0 };
    }

    const counts: Record<string, number> = { admin: 0, teacher: 0, student: 0, parent: 0 };
    for (const row of data) {
      if (row.role && counts[row.role] !== undefined) {
        counts[row.role]++;
      }
    }
    return counts;
  } catch (err) {
    console.error("Error fetching account counts:", err);
    return { admin: 0, teacher: 0, student: 0, parent: 0 };
  }
}

/**
 * Fetches actual registered database accounts for a specific role.
 */
export async function getDatabaseAccountsByRole(role: string): Promise<DatabaseAccount[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url, status")
      .eq("role", role)
      .order("full_name", { ascending: true, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error("Error querying profiles for role:", role, error);
      return [];
    }

    return (data || []).map((p: any) => ({
      id: p.id,
      email: p.email || "",
      full_name: p.full_name || (p.email ? p.email.split("@")[0] : "Unnamed User"),
      role: p.role,
      avatar_url: p.avatar_url,
      status: p.status,
    }));
  } catch (err) {
    console.error("Exception in getDatabaseAccountsByRole:", err);
    return [];
  }
}

/**
 * Generates an OTP token hash for instant 1-click verification of an actual database account.
 * If the user exists in profiles but doesn't have an auth record, creates one on the fly.
 */
export async function generateAccountLoginToken(email: string): Promise<{ token_hash?: string; error?: string }> {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { error: "Email is required" };

    const supabase = createAdminClient();

    // Verify account exists in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("email", trimmedEmail)
      .maybeSingle();

    // Check if auth user exists, if not create one with confirmed email
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: trimmedEmail,
    });

    if (linkErr) {
      // If user does not exist in auth, create it
      if (linkErr.message?.toLowerCase().includes("user not found") || linkErr.code === "user_not_found") {
        const { error: createErr } = await supabase.auth.admin.createUser({
          email: trimmedEmail,
          password: "password123",
          email_confirm: true,
          user_metadata: {
            full_name: profile?.full_name || trimmedEmail.split("@")[0],
            role: profile?.role || "student",
          },
        });

        if (createErr) {
          return { error: createErr.message };
        }

        // Try generating link again
        const { data: retryLink, error: retryErr } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: trimmedEmail,
        });

        if (retryErr || !retryLink) {
          return { error: retryErr?.message || "Failed to generate login token" };
        }

        return { token_hash: retryLink.properties.hashed_token };
      }

      return { error: linkErr.message };
    }

    return { token_hash: linkData.properties.hashed_token };
  } catch (err: any) {
    console.error("generateAccountLoginToken error:", err);
    return { error: err?.message || "Failed to generate authentication token" };
  }
}
