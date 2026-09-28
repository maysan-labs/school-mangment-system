"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  GraduationCap, 
  Loader2, 
  User, 
  Shield, 
  Heart, 
  ArrowRight, 
  Sun, 
  Moon, 
  Sparkles, 
  CheckCircle,
  Database,
  Search,
  Zap,
  KeyRound,
  LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { 
  getDatabaseAccountsByRole, 
  getDatabaseAccountCounts, 
  generateAccountLoginToken,
  DatabaseAccount 
} from "@/app/actions/auth-accounts";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const roleOptions = [
  { 
    id: "admin", 
    label: "Admin", 
    icon: Shield, 
    description: "School management & settings",
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    hoverAccent: "hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/[0.03]"
  },
  { 
    id: "teacher", 
    label: "Teacher", 
    icon: User, 
    description: "Teaching & grade management",
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    hoverAccent: "hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:bg-blue-500/[0.02] dark:hover:bg-blue-500/[0.03]"
  },
  { 
    id: "student", 
    label: "Student", 
    icon: GraduationCap, 
    description: "View grades & attendance",
    accent: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
    hoverAccent: "hover:border-violet-500/40 dark:hover:border-violet-500/40 hover:bg-violet-500/[0.02] dark:hover:bg-violet-500/[0.03]"
  },
  { 
    id: "parent", 
    label: "Parent", 
    icon: Heart, 
    description: "Monitor child progress",
    accent: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    hoverAccent: "hover:border-amber-500/40 dark:hover:border-amber-500/40 hover:bg-amber-500/[0.02] dark:hover:bg-amber-500/[0.03]"
  },
];

const SHOW_DEMO_LOGINS = process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGINS !== 'false';

// Verified operational demo credentials
const DEMO_CREDENTIALS: Record<string, { email: string; password: string; name: string }> = {
  admin: { email: 'admin.demo@edufox.com', password: 'password123', name: 'Demo Admin' },
  teacher: { email: 'aris@edufox.com', password: 'password123', name: 'Dr. Aris V.' },
  student: { email: 'std.myra.khan.0@edufox.com', password: 'password123', name: 'Myra Khan' },
  parent: { email: 'parent.demo@edufox.com', password: 'password123', name: 'Demo Parent' },
};

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  
  // Database accounts state
  const [dbAccounts, setDbAccounts] = useState<DatabaseAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"accounts" | "manual">("accounts");

  // Auth flow states
  const [existingUser, setExistingUser] = useState<{ email?: string; name?: string; role?: string } | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoggingIn, setDemoLoggingIn] = useState<string | null>(null);
  const [accountLoggingIn, setAccountLoggingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Fetch initial counts of database accounts and check existing session
  useEffect(() => {
    getDatabaseAccountCounts().then(counts => setRoleCounts(counts)).catch(() => {});

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.email) {
        supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            setExistingUser({
              email: user.email,
              name: data?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0],
              role: data?.role || "user",
            });
          });
      }
    }).catch(() => {});
  }, []);

  // When a role is selected, load the actual registered accounts from the database
  const handleSelectRole = async (roleId: string) => {
    setSelectedRole(roleId);
    setError(null);
    setAccountSearch("");
    setActiveTab("accounts");
    setLoadingAccounts(true);
    form.reset();

    try {
      const accounts = await getDatabaseAccountsByRole(roleId);
      setDbAccounts(accounts);
      // Default to manual form if no accounts exist in DB
      if (accounts.length === 0) {
        setActiveTab("manual");
      }
    } catch (e) {
      console.error("Failed to load accounts for role:", e);
      setDbAccounts([]);
      setActiveTab("manual");
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSignOutExisting = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setExistingUser(null);
    toast.info("Signed out of active session");
  };

  const handleFillDemoCredentials = () => {
    if (!selectedRole) return;
    const creds = DEMO_CREDENTIALS[selectedRole];
    if (creds) {
      form.setValue("email", creds.email);
      form.setValue("password", creds.password);
      toast.info(`Filled credentials for ${creds.name}`);
    }
  };

  // Instant login using an actual database account
  const handleDirectDbAccountLogin = async (account: DatabaseAccount) => {
    setAccountLoggingIn(account.email);
    setError(null);

    try {
      const { token_hash, error: tokenErr } = await generateAccountLoginToken(account.email);
      if (tokenErr || !token_hash) {
        // Fallback: autofill the form so the user can enter their password
        form.setValue("email", account.email);
        setActiveTab("manual");
        const msg = tokenErr || "Could not generate direct token. Please enter password.";
        setError(msg);
        toast.error(msg);
        return;
      }

      const supabase = createClient();
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash,
        type: "magiclink",
      });

      if (verifyErr) {
        form.setValue("email", account.email);
        setActiveTab("manual");
        setError(verifyErr.message);
        toast.error(verifyErr.message);
      } else {
        toast.success(`Welcome back, ${account.full_name || account.email}!`);
        window.location.replace("/portal");
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setAccountLoggingIn(null);
    }
  };

  // 1-Click Quick Demo Login
  const handleDemoLogin = async (role: string) => {
    const creds = DEMO_CREDENTIALS[role];
    if (!creds) return;

    setDemoLoggingIn(role);
    setError(null);
    const supabase = createClient();

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password,
      });

      if (signInErr) {
        const msg = `Demo sign-in failed: ${signInErr.message}`;
        setError(msg);
        toast.error(msg);
      } else {
        toast.success(`Welcome, ${creds.name}! Launching portal...`);
        window.location.replace("/portal");
      }
    } catch (e: any) {
      const msg = e?.message || "An unexpected error occurred during demo login.";
      setError(msg);
      toast.error(msg);
    } finally {
      setDemoLoggingIn(null);
    }
  };

  // Standard password submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInErr) {
        setError(signInErr.message);
        toast.error(signInErr.message);
      } else {
        toast.success("Signed in successfully!");
        window.location.replace("/portal");
      }
    } catch (e: any) {
      const msg = e?.message || "An unexpected error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  // Password reset handler
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) {
        setError(resetErr.message);
        toast.error(resetErr.message);
      } else {
        setResetSent(true);
        toast.success("Password reset instructions dispatched");
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to send reset instructions.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const filteredAccounts = dbAccounts.filter((acc) => {
    const query = accountSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      acc.email.toLowerCase().includes(query) ||
      (acc.full_name && acc.full_name.toLowerCase().includes(query))
    );
  });

  const currentRoleConfig = roleOptions.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-slate-50 text-slate-900 dark:bg-[#03050d] dark:text-white transition-colors duration-350 font-sans relative md:h-screen md:max-h-screen md:overflow-hidden overflow-y-auto">
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer z-50 animate-fade-in"
        aria-label="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
      </button>

      {/* Left Panel: High-Tech Brand Showcase (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#02050d] dark:bg-[#020308] relative flex-col justify-between p-8 lg:p-12 overflow-hidden border-r border-slate-200/20 dark:border-white/5 select-none z-10">
        
        {/* Glow Spheres */}
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-float-1" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[90%] h-[90%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-float-2" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_80%,transparent_100%)] z-1" />

        {/* Top Logo branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-9 w-9 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/20">
            <GraduationCap className="h-4.5 w-4.5 text-slate-950 font-bold" />
          </div>
          <span className="text-sm font-black tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 uppercase">
            Edu Maysan
          </span>
        </div>

        {/* Center Showcase content */}
        <div className="space-y-4 relative z-10 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" /> Unified School ERP
          </div>
          
          <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-white">
            Modernize your <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
              School Operations
            </span>
          </h1>
          
          <p className="text-xs lg:text-sm text-slate-400 leading-relaxed font-medium max-w-md">
            A state-of-the-art analytical workspace managing students, classes, attendance records, payroll, fees, and comprehensive academic reports in real-time.
          </p>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-2 gap-4 pt-4 max-w-md">
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-emerald-500/20 transition-all duration-350">
              <div className="flex items-center gap-2 mb-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xl font-black text-white">99.8%</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">System Accuracy</p>
            </div>
            
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md hover:border-emerald-500/20 transition-all duration-355">
              <div className="flex items-center gap-2 mb-0.5">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xl font-black text-white">Live DB</span>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Actual Accounts Sync</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 Maysan Labs.</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">School Site</Link>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-500 font-semibold">Local & Cloud Ready</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Dual Option Interface */}
      <div className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 relative overflow-y-auto w-full max-w-full">
        
        {/* Glow Spheres for light mode and mobile */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 dark:bg-emerald-500/[0.015] rounded-full blur-[110px] pointer-events-none z-0 animate-float-2" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-blue-500/5 dark:bg-blue-500/[0.015] rounded-full blur-[110px] pointer-events-none z-0 animate-float-1" />

        <div className="w-full max-w-md space-y-3 relative z-10 py-2">
          
          {/* Logo on Mobile */}
          <div className="flex flex-col items-center md:hidden mb-2">
            <div className="h-14 w-auto rounded-xl overflow-hidden bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-center p-2 shadow-sm">
              <Image 
                src="/logo-rounded-v2.png" 
                alt="Edu Maysan" 
                width={140} 
                height={45} 
                className="object-contain" 
                priority 
              />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-white/40 mt-2">Edu Maysan</span>
          </div>

          {/* Desktop header title */}
          <div className="hidden md:block pb-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Workspace Authentication</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Select a role to access database accounts or choose quick demo.</p>
          </div>

          <Card className="w-full border border-slate-200/80 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-emerald-500/40 z-20" />
            
            {/* Sliding animation container */}
            <div 
              className={cn(
                "flex w-[200%] transition-transform duration-500 ease-out",
                selectedRole ? "-translate-x-1/2" : "translate-x-0"
              )}
            >
              
              {/* SLIDE 1: Workspace Authentication & Quick Demo */}
              <div className="w-1/2 flex flex-col shrink-0">
                <CardHeader className="pb-3 border-b border-slate-200/80 dark:border-white/[0.06] text-center pt-4 bg-slate-50/20 dark:bg-white/[0.01]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-500" />
                    <CardTitle className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Workspace Authentication
                    </CardTitle>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-white/40">Select an account type or jump in with 1-click demo</p>
                </CardHeader>
                
                <CardContent className="pt-3 pb-4 space-y-3 px-3.5 sm:px-5">
                  {/* Active session banner if any */}
                  {existingUser && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 truncate">
                          Active: {existingUser.name}
                        </p>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                          {existingUser.email} ({existingUser.role})
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => { window.location.href = "/portal"; }}
                          className="h-7 px-2.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        >
                          Open Portal →
                        </Button>
                        <button
                          type="button"
                          onClick={handleSignOutExisting}
                          className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-white underline cursor-pointer p-1"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Visible error message if any */}
                  {error && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium leading-tight">
                      {error}
                    </div>
                  )}

                  {/* Section 1: Quick 1-Click Demo Login */}
                  {SHOW_DEMO_LOGINS && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          <Sparkles className="h-3 w-3 animate-pulse" /> 1-Click Quick Demo
                        </div>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-white/40">Verified accounts</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {roleOptions.map((role) => {
                          const isLoggingIn = demoLoggingIn === role.id;
                          const creds = DEMO_CREDENTIALS[role.id];
                          return (
                            <button
                              key={`demo-${role.id}`}
                              onClick={() => handleDemoLogin(role.id)}
                              disabled={demoLoggingIn !== null || loading}
                              className="p-2 rounded-xl border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.015] hover:bg-white dark:hover:bg-white/[0.04] hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 text-left group disabled:opacity-50 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "p-1.5 rounded-lg shrink-0",
                                  role.accent
                                )}>
                                  {isLoggingIn ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                                  ) : (
                                    <role.icon className="h-3 w-3" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {role.label}
                                    </p>
                                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                                      Demo
                                    </span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 dark:text-white/40 truncate font-mono">
                                    {creds?.email.split('@')[0]}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Account Types & Database Explorer */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                        Explore Database Accounts
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-white/40">Click to browse</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {roleOptions.map((role) => {
                        const count = roleCounts[role.id];
                        return (
                          <button
                            key={role.id}
                            onClick={() => handleSelectRole(role.id)}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-xl border border-slate-200/80 dark:border-white/[0.05] bg-white/55 dark:bg-white/[0.01] hover:border-emerald-500/30 transition-all text-left group cursor-pointer",
                              role.hoverAccent
                            )}
                          >
                            <div className={cn("p-1.5 rounded-lg border", role.accent)}>
                              <role.icon className="h-3 w-3" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-[11px] truncate">
                                {role.label}
                              </p>
                              {count !== undefined && count > 0 && (
                                <p className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  {count} registered
                                </p>
                              )}
                            </div>
                            <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-500 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1 text-center">
                    <Link href="/" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors uppercase tracking-widest">
                      View School Website
                    </Link>
                  </div>
                </CardContent>
              </div>

              {/* SLIDE 2: Actual Accounts in DB & Login Form */}
              <div className="w-1/2 flex flex-col shrink-0">
                <CardHeader className="pb-2.5 border-b border-slate-200/80 dark:border-white/[0.06] pt-4 bg-slate-50/20 dark:bg-white/[0.01]">
                  <button 
                    onClick={() => {
                      if (isForgotPassword) {
                        setIsForgotPassword(false);
                        setResetSent(false);
                        setError(null);
                      } else {
                        setSelectedRole(null);
                      }
                    }}
                    className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 mb-1.5 text-left flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
                  >
                    ← {isForgotPassword ? "Back to Login" : "Back to Account Types"}
                  </button>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      {currentRoleConfig?.icon && <currentRoleConfig.icon className="h-4 w-4 text-emerald-500" />}
                      {isForgotPassword 
                        ? "Password Recovery" 
                        : `${currentRoleConfig?.label} Accounts`}
                    </CardTitle>
                    {!isForgotPassword && dbAccounts.length > 0 && (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-white/70">
                        {dbAccounts.length} in DB
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-3 pb-5 px-3.5 sm:px-5 flex-1 flex flex-col overflow-hidden">
                  {isForgotPassword ? (
                    <div className="space-y-4">
                      {resetSent ? (
                        <div className="space-y-3 py-4 text-center">
                          <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Recovery Email Sent</h4>
                          <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed">
                            If an account matches <span className="font-semibold text-emerald-500">{resetEmail}</span>, a secure password reset link has been dispatched to your inbox.
                          </p>
                          <Button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(false);
                              setResetSent(false);
                              setError(null);
                            }}
                            className="w-full h-9 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-[10px] uppercase tracking-wider hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                          >
                            Return to Login
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                          <p className="text-[11px] text-slate-500 dark:text-white/60 leading-relaxed">
                            Enter your account's registered email address and we'll send a secure password reset link.
                          </p>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                              Email Address
                            </label>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all duration-300 h-10 text-xs"
                              required
                            />
                          </div>
                          {error && (
                            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-medium leading-tight">
                              {error}
                            </div>
                          )}
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/25 transition-all duration-300 cursor-pointer"
                          >
                            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                            Send Reset Instructions
                          </Button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 flex-1 flex flex-col">
                      {/* Role-Specific Quick Demo Banner */}
                      {selectedRole && DEMO_CREDENTIALS[selectedRole] && (
                        <div className="p-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.04] dark:bg-amber-500/[0.02] flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                              <span className="text-[11px] font-bold text-slate-800 dark:text-white truncate">
                                {DEMO_CREDENTIALS[selectedRole].name}
                              </span>
                              <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                1-Click Demo
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-white/40 truncate font-mono mt-0.5">
                              {DEMO_CREDENTIALS[selectedRole].email}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleDemoLogin(selectedRole)}
                            disabled={demoLoggingIn !== null}
                            className="h-7 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] uppercase tracking-wider cursor-pointer shrink-0 shadow-sm"
                          >
                            {demoLoggingIn === selectedRole ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Instant Login"
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Sub-Tabs: Actual Accounts vs Direct Password */}
                      <div className="flex rounded-xl bg-slate-100 dark:bg-white/[0.03] p-1 border border-slate-200/80 dark:border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => setActiveTab("accounts")}
                          className={cn(
                            "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                            activeTab === "accounts"
                              ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                              : "text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white"
                          )}
                        >
                          <Database className="h-3 w-3" />
                          Actual Accounts ({dbAccounts.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("manual")}
                          className={cn(
                            "flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                            activeTab === "manual"
                              ? "bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                              : "text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white"
                          )}
                        >
                          <KeyRound className="h-3 w-3" />
                          Direct Credentials
                        </button>
                      </div>

                      {error && (
                        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-medium leading-tight">
                          {error}
                        </div>
                      )}

                      {/* TAB 1: Actual Database Accounts List */}
                      {activeTab === "accounts" ? (
                        <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                          {/* Search Accounts */}
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 dark:text-white/30" />
                            <Input
                              placeholder={`Filter ${currentRoleConfig?.label.toLowerCase()} accounts...`}
                              value={accountSearch}
                              onChange={(e) => setAccountSearch(e.target.value)}
                              className="pl-8 h-8 text-[11px] rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08]"
                            />
                          </div>

                          {/* Accounts Scrollable Container */}
                          <div className="flex-1 overflow-y-auto max-h-[260px] sm:max-h-[300px] space-y-1.5 pr-1 scrollbar-thin">
                            {loadingAccounts ? (
                              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                                <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                                <span>Loading database accounts...</span>
                              </div>
                            ) : filteredAccounts.length === 0 ? (
                              <div className="py-6 text-center text-slate-400 dark:text-white/40 text-xs space-y-2">
                                <p>No registered accounts match your search.</p>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setActiveTab("manual")}
                                  className="text-[10px] h-7"
                                >
                                  Enter credentials manually
                                </Button>
                              </div>
                            ) : (
                              filteredAccounts.map((account) => {
                                const isThisLoggingIn = accountLoggingIn === account.email;
                                return (
                                  <div
                                    key={account.id}
                                    className="p-2 rounded-xl border border-slate-200/70 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.01] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all flex items-center justify-between gap-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                        {account.full_name}
                                      </p>
                                      <p className="text-[10px] text-slate-500 dark:text-white/40 truncate font-mono">
                                        {account.email}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        size="sm"
                                        onClick={() => handleDirectDbAccountLogin(account)}
                                        disabled={accountLoggingIn !== null}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold cursor-pointer"
                                      >
                                        {isThisLoggingIn ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <>
                                            <Zap className="h-2.5 w-2.5 mr-1 fill-current" /> Sign In
                                          </>
                                        )}
                                      </Button>
                                      <button
                                        type="button"
                                        title="Use this email in manual form"
                                        onClick={() => {
                                          form.setValue("email", account.email);
                                          setActiveTab("manual");
                                        }}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer text-[10px]"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ) : (
                        /* TAB 2: Direct Password Input Form */
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <FormLabel className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                                      Email Address
                                    </FormLabel>
                                    {dbAccounts.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setActiveTab("accounts")}
                                        className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                      >
                                        <Database className="h-2.5 w-2.5" /> Pick from DB
                                      </button>
                                    )}
                                  </div>
                                  <FormControl>
                                    <Input 
                                      placeholder="registered@school.com" 
                                      {...field} 
                                      className="rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all duration-300 h-9 text-xs"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[10px] text-red-500 dark:text-red-400" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <FormLabel className="text-[10px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-wider">
                                      Password
                                    </FormLabel>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setResetEmail(form.getValues('email') || "");
                                        setIsForgotPassword(true);
                                        setError(null);
                                      }}
                                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                    >
                                      Forgot?
                                    </button>
                                  </div>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="••••••••"
                                      {...field}
                                      className="rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] focus:border-emerald-500/50 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/20 transition-all duration-300 h-9 text-xs"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-[10px] text-red-500 dark:text-red-400" />
                                </FormItem>
                              )}
                            />
                            {selectedRole && DEMO_CREDENTIALS[selectedRole] && (
                              <button
                                type="button"
                                onClick={handleFillDemoCredentials}
                                className="w-full py-1.5 px-2 rounded-lg border border-dashed border-amber-500/35 bg-amber-500/[0.04] text-amber-600 dark:text-amber-400 hover:bg-amber-500/[0.08] transition-colors text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="h-3 w-3" /> Fill Demo ({DEMO_CREDENTIALS[selectedRole].email})
                              </button>
                            )}

                            <Button 
                              type="submit" 
                              className="w-full h-9 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.01] cursor-pointer" 
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                              ) : null}
                              Sign In as {currentRoleConfig?.label}
                            </Button>
                          </form>
                        </Form>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}