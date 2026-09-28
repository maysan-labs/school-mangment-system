import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function logAuditTrail(  userId: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue: any,
  newValue: any,
  metadata: Record<string, any> = {}
) {
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

    const { error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: userId,
        action: action,
        entity: entity,
        entity_id: entityId,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        metadata: metadata,
        timestamp: new Date().toISOString(),
      });

    if (error) {
      console.error("[AUDIT] Error logging change:", error);
    }
  } catch (e) {
    console.error("[AUDIT] Critical failure in audit logging:", e);
  }
}

// Backward-compatible service wrapper used by impersonation.ts / user.ts
export const AuditService = {
  async logAction(
    supabase: unknown,
    params: {
      actor_id?: string;
      action: string;
      entity_type: string;
      entity_id: string;
      old_data?: unknown;
      new_data?: unknown;
    }
  ) {
    try {
      const client = supabase as {
        from: (t: string) => {
          insert: (v: Record<string, unknown>) => Promise<{ error: unknown }>;
        };
      };
      const { error } = await client.from("audit_logs").insert({
        user_id: params.actor_id ?? null,
        action: params.action,
        entity: params.entity_type,
        entity_id: params.entity_id,
        old_value: params.old_data ? JSON.stringify(params.old_data) : null,
        new_value: params.new_data ? JSON.stringify(params.new_data) : null,
        timestamp: new Date().toISOString(),
      });
      if (error) console.error("[AUDIT] Error logging change:", error);
    } catch (e) {
      console.error("[AUDIT] Critical failure in audit logging:", e);
    }
  },
};
