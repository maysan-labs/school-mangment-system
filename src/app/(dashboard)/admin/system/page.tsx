"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { 
  Settings, 
  ArrowLeft, 
  Building2, 
  Save, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Loader2 
} from "lucide-react";
import { 
  getAdminSystemOverview, 
  saveSystemConfiguration 
} from "@/app/actions/admin-system";
import { toast } from "sonner";

export default function AdminSystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    school_name: "",
    school_code: "",
    school_email: "",
    school_phone: "",
    address: "",
    academic_year: "",
    currency: "INR (₹)",
    timezone: "Asia/Kolkata (IST)",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getAdminSystemOverview();
      if (res.success && res.data) {
        setFormData({
          school_name: res.data.settings.school_name || "Maysan International Academy",
          school_code: res.data.settings.school_code || "MYS-2026",
          school_email: res.data.settings.school_email || "admin@maysanlabs.com",
          school_phone: res.data.settings.school_phone || "+91 (0) 98765 43210",
          address: res.data.settings.address || "Academic Boulevard, Knowledge Park IV",
          academic_year: res.data.settings.academic_year || "2024-2025",
          currency: res.data.settings.currency || "INR (₹)",
          timezone: res.data.settings.timezone || "Asia/Kolkata (IST)",
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSystemConfiguration(formData);
      if (res.success) {
        toast.success("System configurations updated and broadcasted!");
      } else {
        toast.error(res.error || "Failed to update system configurations.");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/admin/dashboard" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Mission Control
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Institution & System Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Global institution metadata, default academic cycles, and system parameters
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || loading}
          className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 self-start sm:self-center"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Changes
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span>Loading institution profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Institution Identity Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Institution Identity
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Official registered school particulars printed on receipts and report cards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institution Legal Name
                </label>
                <input
                  type="text"
                  value={formData.school_name}
                  onChange={(e) => handleChange("school_name", e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Institution Affiliation / Code
                </label>
                <input
                  type="text"
                  value={formData.school_code}
                  onChange={(e) => handleChange("school_code", e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Administrative Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.school_email}
                    onChange={(e) => handleChange("school_email", e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Helpline / Telephone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.school_phone}
                    onChange={(e) => handleChange("school_phone", e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Campus Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Regional Parameters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Academic Cycle & Currency Defaults
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Default parameters applied across fee billing, reporting, and scheduling
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Active Academic Year
                </label>
                <input
                  type="text"
                  value={formData.academic_year}
                  onChange={(e) => handleChange("academic_year", e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Currency Display
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="w-full h-11 px-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Campus Timezone
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
