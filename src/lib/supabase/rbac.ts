import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ProfileRecord } from "@/types/database";

export type UserRole = ProfileRecord['role'];

export async function getUserRole(): Promise<{ role: UserRole | null; userId: string | null }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { role: null, userId: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { role: null, userId: user.id };
    }

    return { role: profile.role as UserRole, userId: user.id };
  } catch (e) {
    console.error("[RBAC] Error fetching user role:", e);
    return { role: null, userId: null };
  }
}

export async function authorize(requiredRoles: UserRole[]) {
  const { role, userId } = await getUserRole();

  if (!userId) {
    throw new Error("Unauthorized: User not authenticated");
  }

  if (!role || !requiredRoles.includes(role)) {
    throw new Error(`Forbidden: Insufficient permissions. Required: ${requiredRoles.join(' or ')}`);
  }

  return { userId, role };
}

export async function authorizeAdmin() {
  return authorize(['admin']);
}
