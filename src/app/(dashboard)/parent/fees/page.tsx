import { 
  IndianRupee, 
  Receipt, 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  User 
} from "lucide-react";
import Link from "next/link";
import { getParentFeesSummary } from "@/app/actions/parent-portal";

export default async function ParentFeesPage() {
  const result = await getParentFeesSummary();
  const payments = result.success && result.data ? result.data : [];

  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount_paid || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/parent/dashboard" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Family Fee Accounts & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Payment confirmation records, tuition receipts, and transaction history
          </p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-sm shrink-0">
          <IndianRupee className="h-6 w-6" />
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Total Deposited
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{totalPaid.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Across all verified receipts
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Receipt className="h-3.5 w-3.5 text-purple-500" />
            Issued Receipts
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {payments.length}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Official vouchers
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <CreditCard className="h-3.5 w-3.5 text-blue-500" />
            Payment Status
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            Active
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            Online gateways enabled
          </p>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Transaction Ledger
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {payments.length} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-850">
              <tr>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Receipt #
                </th>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Student Name
                </th>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Fee Type
                </th>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Payment Date
                </th>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Mode
                </th>
                <th className="h-12 px-6 text-right align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Amount
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs italic">
                    No payment transactions logged for your children.
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                      {p.receipt_number || `RCP-${p.id.slice(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs text-slate-900 dark:text-white">
                      {p.student?.profile?.full_name || "Student"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 dark:text-slate-300">
                      {p.fee?.name || "Tuition Fee"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {p.payment_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {p.payment_method || "Online"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ₹{p.amount_paid?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 inline-block">
                        {p.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
