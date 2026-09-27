async function isCurrentUserDemo(supabaseClient?: any): Promise<boolean> {
  const allowWrites = process.env.NEXT_PUBLIC_ALLOW_DEMO_WRITES;
  if (allowWrites === 'true') {
    return false;
  }
  if (allowWrites === 'false') {
    // Proceed to check if user is demo
  } else if (process.env.NODE_ENV === 'development') {
    return false; // Allowed in local dev by default
  }

  // Client-side environment check
  if (typeof window !== 'undefined') {
    if (!supabaseClient) return false;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user || !user.email) return false;
      const email = user.email.toLowerCase().trim();
      return email.endsWith('@edufox.com') || email === 'riya@maysanlabs.com';
    } catch {
      return false;
    }
  }

  // Server-side environment check
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const { createServerClient } = await import('@supabase/ssr');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) return false;
    
    const client = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {}
      }
    });
    
    const { data: { user } } = await client.auth.getUser();
    if (!user || !user.email) return false;
    const email = user.email.toLowerCase().trim();
    return email.endsWith('@edufox.com') || email === 'riya@maysanlabs.com';
  } catch (e) {
    // Outside of a request context (CLI seeding, background tasks, static builds, testing), allow operations
    return false;
  }
}

export function wrapWithDemoProtection<T extends object>(client: T): T {
  return new Proxy(client, {
    get(target, prop, receiver) {
      // Intercept database queries
      if (prop === 'from') {
        const originalFrom = (target as any).from;
        return function (relation: string) {
          const queryBuilder = originalFrom.apply(target, [relation]);
          const methodsToWrap = ['insert', 'update', 'delete', 'upsert'];
          
          return new Proxy(queryBuilder, {
            get(qbTarget, qbProp, qbReceiver) {
              if (methodsToWrap.includes(qbProp as string)) {
                const originalMethod = qbTarget[qbProp as keyof typeof qbTarget] as (...args: any[]) => any;
                
                return function (...args: any[]) {
                  const resultBuilder = originalMethod.apply(qbTarget, args);
                  const originalThen = resultBuilder.then;
                  
                  resultBuilder.then = function (onfulfilled: any, onrejected: any) {
                    return isCurrentUserDemo(target).then((isDemo) => {
                      if (isDemo) {
                        console.warn(`[DEMO PROTECT] Intercepted and blocked mutation '${qbProp as string}' on table '${relation}'`);
                        const mockResult = {
                          data: null,
                          error: {
                            message: "Demo Mode Protection: Database mutations are disabled for demo accounts to protect data integrity.",
                            code: "DEMO_BLOCKED",
                            details: `Write operation blocked on table: ${relation}`
                          },
                          count: null,
                          status: 403,
                          statusText: "Forbidden"
                        };
                        return Promise.resolve(mockResult).then(onfulfilled, onrejected);
                      }
                      return originalThen.apply(resultBuilder, [onfulfilled, onrejected]);
                    });
                  };
                  return resultBuilder;
                };
              }
              return Reflect.get(qbTarget, qbProp, qbReceiver);
            }
          });
        };
      }
      
      // Intercept RPC function calls
      if (prop === 'rpc') {
        const originalRpc = (target as any).rpc;
        return function (fn: string, args?: any, options?: any) {
          const resultBuilder = originalRpc.apply(target, [fn, args, options]);
          const originalThen = resultBuilder.then;
          
          resultBuilder.then = function (onfulfilled: any, onrejected: any) {
            return isCurrentUserDemo(target).then((isDemo) => {
              if (isDemo) {
                console.warn(`[DEMO PROTECT] Intercepted and blocked RPC call '${fn}'`);
                const mockResult = {
                  data: null,
                  error: {
                    message: "Demo Mode Protection: Remote function calls are disabled for demo accounts to protect data integrity.",
                    code: "DEMO_BLOCKED",
                    details: `RPC blocked: ${fn}`
                  },
                  status: 403,
                  statusText: "Forbidden"
                };
                return Promise.resolve(mockResult).then(onfulfilled, onrejected);
              }
              return originalThen.apply(resultBuilder, [onfulfilled, onrejected]);
            });
          };
          return resultBuilder;
        };
      }
      
      return Reflect.get(target, prop, receiver);
    }
  });
}
