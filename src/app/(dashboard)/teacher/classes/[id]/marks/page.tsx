"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  ArrowLeft, 
  Calendar, 
  Save, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Loader2
} from "lucide-react";
import { 
  getClassExamsAndMarks, 
  saveClassMarks 
} from "@/app/actions/teacher-portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeacherClassMarksPage() {
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, number | string>>({});
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getClassExamsAndMarks(classId, selectedExamId || undefined);
      if (res.success && res.data) {
        setClassData(res.data.classData);
        setExams(res.data.exams);
        setSelectedExam(res.data.selectedExam);
        setStudents(res.data.students);

        const initialMarks: Record<string, number | string> = {};
        res.data.students.forEach((s: any) => {
          if (s.marks_obtained !== null && s.marks_obtained !== undefined) {
            initialMarks[s.id] = s.marks_obtained;
          }
        });
        setMarks(initialMarks);

        if (!selectedExamId && res.data.selectedExam) {
          setSelectedExamId(res.data.selectedExam.id);
        }
      } else {
        toast.error(res.error || "Failed to load examination sheet.");
      }
      setLoading(false);
    }
    if (classId) {
      loadData();
    }
  }, [classId, selectedExamId]);

  const handleMarkChange = (studentId: string, value: string) => {
    const num = Number(value);
    const max = selectedExam?.max_marks || 100;
    if (value !== "" && num > max) {
      toast.error(`Marks cannot exceed maximum marks (${max})`);
      return;
    }
    setMarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleSave = () => {
    if (!selectedExam) {
      toast.error("Please select an active examination first.");
      return;
    }

    startTransition(async () => {
      const records = Object.entries(marks)
        .filter(([_, val]) => val !== "" && !isNaN(Number(val)))
        .map(([studentId, val]) => ({
          student_id: studentId,
          marks_obtained: Number(val),
        }));

      const res = await saveClassMarks({
        exam_id: selectedExam.id,
        subject_id: selectedExam.subject_id || selectedExam.subject?.id || "sub-default",
        class_id: classId,
        records,
      });

      if (res.success) {
        toast.success("Marks saved and published successfully!");
      } else {
        toast.error(res.error || "Failed to save student marks.");
      }
    });
  };

  const maxMarks = selectedExam?.max_marks || 100;
  const passingMarks = selectedExam?.passing_marks || 40;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/teacher/classes" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Classrooms
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {classData?.name || "Class"} Gradebook Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section {classData?.section || "A"} • {students.length} Enrolled Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {exams.length > 0 && (
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.subject?.name || "Subject"})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || loading || !selectedExam}
            className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Marks
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Info Banner */}
      {selectedExam && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assessment</p>
              <p className="text-base font-black text-slate-900 dark:text-white">{selectedExam.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</p>
              <p className="text-base font-black text-indigo-600 dark:text-indigo-400">{selectedExam.subject?.name || "General"}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">
              Max Marks: <strong className="text-slate-900 dark:text-white">{maxMarks}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Pass Criteria: <strong className="text-emerald-600 dark:text-emerald-400">{passingMarks}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Exam Date: <strong className="text-slate-900 dark:text-white">{selectedExam.date || "Scheduled"}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Roster & Marks Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span>Loading evaluation sheet...</span>
          </div>
        ) : !selectedExam ? (
          <div className="py-16 text-center text-slate-400 text-xs italic">
            No exams created for this classroom yet. Create an exam in the Exams Center to begin entering marks.
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs italic">
            No students enrolled in this section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 dark:bg-slate-850">
                <tr>
                  <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Student Details
                  </th>
                  <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Marks Obtained (Max: {maxMarks})
                  </th>
                  <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => {
                  const val = marks[student.id];
                  const hasVal = val !== undefined && val !== "" && !isNaN(Number(val));
                  const isPass = hasVal && Number(val) >= passingMarks;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {student.roll_number !== "—" ? student.roll_number : student.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                              {student.full_name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {student.admission_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={maxMarks}
                            value={val ?? ""}
                            onChange={(e) => handleMarkChange(student.id, e.target.value)}
                            placeholder="0"
                            className="w-24 h-10 px-3 text-center font-mono font-black text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {hasVal ? (
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1",
                            isPass
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          )}>
                            {isPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {isPass ? "PASS" : "FAIL"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
