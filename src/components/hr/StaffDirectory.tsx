"use client";

import { useState } from "react";
import { 
    Search, 
    MoreHorizontal, 
    Eye, 
    Edit, 
    IdCard, 
    Users,
    Briefcase,
    Building2,
    Mail,
    Phone,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { useRouter } from "next/navigation";

import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { cn } from "@/lib/utils";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";

export function StaffDirectory({ initialData, departments, userRole }: { initialData: any[], departments: any[], userRole: string | null }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const filteredStaff = initialData.filter((staff) => {
        const matchesSearch = 
            staff.first_name?.toLowerCase().includes(search.toLowerCase()) || 
            staff.last_name?.toLowerCase().includes(search.toLowerCase()) ||
            staff.staff_id?.toLowerCase().includes(search.toLowerCase());
        
        const matchesDept = deptFilter === "all" || staff.department_id === deptFilter;
        const matchesType = typeFilter === "all" || staff.staff_type === typeFilter;

        return matchesSearch && matchesDept && matchesType;
    });

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const isAdmin = userRole === "admin";

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Filter Hub */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                        placeholder="Search staff by name or ID..." 
                        className="w-full h-11 pl-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 outline-none"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select 
                        value={typeFilter} 
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 flex-1 sm:flex-initial px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
                    >
                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Types</option>
                        <option value="teaching" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Teaching</option>
                        <option value="non_teaching" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Non-Teaching</option>
                    </select>
                    <select 
                        value={deptFilter} 
                        onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                        className="h-11 flex-1 sm:flex-initial px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
                    >
                        <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Departments</option>
                        {departments.map((d: any) => (
                            <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d.name}</option>
                        ))}
                    </select>
                    <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
                        <button 
                            className={cn(
                                "h-10 w-10 flex items-center justify-center transition-all",
                                viewMode === "table" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"
                            )}
                            onClick={() => setViewMode("table")}
                        >
                            <ListIcon className="h-4 w-4" />
                        </button>
                        <button 
                            className={cn(
                                "h-10 w-10 flex items-center justify-center transition-all",
                                viewMode === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"
                            )}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Staff" value={initialData.length} icon={Users} color="emerald" description="All personnel" />
                <DashboardStatCard title="Teaching" value={initialData.filter(s => s.staff_type === 'teaching').length} icon={Briefcase} color="blue" description="Teaching staff" />
                <DashboardStatCard title="Non-Teaching" value={initialData.filter(s => s.staff_type === 'non_teaching').length} icon={Building2} color="amber" description="Admin staff" />
                <DashboardStatCard title="Departments" value={departments.length} icon={LayoutGrid} color="purple" description="Total departments" />
            </div>

            {/* Main Content Area */}
            {viewMode === "table" ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                        <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Staff List</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Complete staff and employee records</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Personnel</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">ID & Type</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Designation</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Contact</th>
                                    {isAdmin && <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Monthly Salary</th>}
                                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                                            No personnel found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStaff.map((staff) => (
                                        <tr key={staff.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-sm text-emerald-600 group-hover:rotate-3 transition-transform flex-shrink-0">
                                                        {staff.photo_url ? (
                                                            <img src={staff.photo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                                                        ) : (
                                                            staff.first_name[0]?.toUpperCase() + (staff.last_name?.[0]?.toUpperCase() || "")
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">
                                                            {staff.first_name} {staff.last_name}
                                                        </div>
                                                        <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                                                            {staff.highest_qualification}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-mono text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                                                    {staff.staff_id}
                                                </div>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    staff.staff_type === 'teaching' 
                                                        ? "bg-indigo-50 text-indigo-600" 
                                                        : "bg-slate-100 text-slate-500"
                                                )}>
                                                    {staff.staff_type === 'teaching' ? 'Teaching' : 'Admin'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Briefcase className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{staff.designation?.name || "N/A"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{staff.department?.name || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{staff.mobile}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{staff.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-5 text-center">
                                                    <div className="font-black text-emerald-600 text-sm tracking-tighter">
                                                        ₹{staff.monthly_salary?.toLocaleString() || "0"}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-5 text-right relative">
                                                <button 
                                                    className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center"
                                                    onClick={() => setMenuOpen(menuOpen === staff.id ? null : staff.id)}
                                                >
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                </button>
                                                {menuOpen === staff.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                                                        <div className="absolute right-4 top-full mt-1 w-56 z-50 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 backdrop-blur-xl">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Operations</div>
                                                            <button className="w-full flex items-center gap-3 rounded-xl py-3 px-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all" onClick={() => { router.push(`/hr/staff/${staff.id}`); setMenuOpen(null); }}>
                                                                <Eye className="h-4 w-4 text-blue-500" /> View Profile
                                                            </button>
                                                            <button className="w-full flex items-center gap-3 rounded-xl py-3 px-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all" onClick={() => { router.push(`/hr/staff/${staff.id}/edit`); setMenuOpen(null); }}>
                                                                <Edit className="h-4 w-4 text-amber-500" /> Edit Details
                                                            </button>
                                                            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                                                            <button className="w-full flex items-center gap-3 rounded-xl py-3 px-3 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-emerald-600">
                                                                <IdCard className="h-4 w-4" /> Generate ID Card
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <UnifiedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStaff.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        itemName="personnel"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedStaff.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <Users className="h-12 w-12 text-slate-200 mb-4" />
                                <p className="text-sm text-slate-400 font-bold">No personnel found</p>
                            </div>
                        ) : (
                            paginatedStaff.map((staff) => (
                                <div 
                                    key={staff.id} 
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden group relative p-6 text-center hover:scale-[1.02] transition-all cursor-pointer"
                                    onClick={() => router.push(`/hr/staff/${staff.id}`)}
                                >
                                    <div className="absolute top-4 right-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                            staff.staff_type === 'teaching' 
                                                ? "bg-indigo-50 text-indigo-600" 
                                                : "bg-slate-100 text-slate-500"
                                        )}>
                                            {staff.staff_type === 'teaching' ? 'Teaching' : 'Admin'}
                                        </span>
                                    </div>
                                    <div className="h-20 w-20 mx-auto rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 shadow-sm group-hover:rotate-6 transition-transform flex items-center justify-center overflow-hidden">
                                        {staff.photo_url ? (
                                            <img src={staff.photo_url} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-black text-emerald-600">{staff.first_name[0]?.toUpperCase()}{staff.last_name?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{staff.first_name} {staff.last_name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{staff.designation?.name || "N/A"}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Staff ID</p>
                                                <p className="text-[10px] font-black font-mono text-slate-600 dark:text-slate-400">{staff.staff_id}</p>
                                            </div>
                                            <div className="h-6 w-px bg-slate-100 dark:bg-slate-800" />
                                            <div className="flex flex-col items-center">
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Dept</p>
                                                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 truncate max-w-[60px]">{staff.department?.name || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <UnifiedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStaff.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        itemName="personnel"
                    />
                </div>
            )}
        </div>
    );
}