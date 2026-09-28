import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    // Create an unmodified response
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();


    // Prevent redirect loops on /login
    if (error && error.name === 'AuthApiError' && !request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      
      // Cleanup cookies on redirect
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith('sb-')) {
          response.cookies.delete(cookie.name);
        }
      });
      return response;
    }

    // Authentication check: redirect to /login if no user and path is not a public route
    const isPublicPath = 
      request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/unauthorized') ||
      request.nextUrl.pathname.startsWith('/reset-password');

    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Role-based redirection logic (Ported from hardened middleware)
    const impersonationId = request.cookies.get("impersonation_user_id")?.value;
    
    if (user && !request.nextUrl.pathname.startsWith('/unauthorized')) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const realRole = profile?.role;

        if (impersonationId) {
            if (realRole !== 'admin') {
                const response = NextResponse.redirect(new URL('/unauthorized', request.url));
                supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie.name, cookie.value, cookie));
                response.cookies.delete("impersonation_user_id");
                return response;
            }
        }
    }

    return supabaseResponse;
  } catch (e) {
    // Fail safe: If middleware errors out on a protected route, redirect to login
    if (!request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
};
