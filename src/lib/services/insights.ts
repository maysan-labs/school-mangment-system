"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getSchoolWideInsights() {
  try {
    const supabase = createAdminClient();

    const { data: marksData, error: marksError } = await supabase
      .from("marks")
      .select("marks_obtained, created_at, subject_id")
      .limit(1000);

    if (marksError) throw marksError;

    const { data: attendanceData, error: attendError } = await supabase
      .from("attendance")
      .select("student_id, status")
      .limit(1000);

    if (attendError) throw attendError;

    const marks = marksData ?? [];
    const avg =
      marks.length > 0
        ? marks.reduce((acc, m) => acc + (m.marks_obtained ?? 0), 0) / marks.length
        : 0;

    const bySubject: Record<string, { total: number; count: number }> = {};
    for (const m of marks) {
      const key = m.subject_id ?? "unknown";
      if (!bySubject[key]) bySubject[key] = { total: 0, count: 0 };
      bySubject[key].total += m.marks_obtained ?? 0;
      bySubject[key].count += 1;
    }
    const subjectHeatmap = Object.entries(bySubject).map(([subject_id, v]) => ({
      subject_id,
      average: v.count > 0 ? Math.round(v.total / v.count) : 0,
      count: v.count,
    }));

    const present = (attendanceData ?? []).filter((a) => a.status === "Present").length;
    const totalAtt = (attendanceData ?? []).length;
    const attendanceRate = totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0;

    return {
      success: true,
      data: {
        schoolAverage: Math.round(avg),
        totalMarks: marks.length,
        attendanceRate,
        attendanceSample: totalAtt,
        gpaTrends: marksData,
        attendanceStats: attendanceData,
        subjectHeatmap,
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to load insights" };
  }
}

export async function calculateStudentRisk(studentId: string) {
  try {
    const supabase = createAdminClient();

    const { data: marks, error: marksError } = await supabase
      .from("marks")
      .select("marks_obtained")
      .eq("student_id", studentId);

    const { data: attendance, error: attError } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId);

    if (marksError || attError) throw new Error("Data fetch error");

    const avgMarks =
      marks && marks.length > 0
        ? marks.reduce((acc, m) => acc + (m.marks_obtained ?? 0), 0) / marks.length
        : 0;

    const attendanceRate =
      attendance && attendance.length > 0
        ? (attendance.filter((a) => a.status === "Present").length / attendance.length) * 100
        : 100;

    // Predictive logic: weighted average
    // Score = (Avg Marks * 0.7) + (Attendance Rate * 0.3)
    const predictedScore = avgMarks * 0.7 + attendanceRate * 0.3;
    const trend = Math.round(predictedScore - avgMarks);
    const risk = predictedScore < 50 ? "High" : predictedScore < 75 ? "Medium" : "Low";

    return {
      success: true,
      data: {
        score: Math.round(predictedScore),
        trend,
        risk,
        attendanceRate: Math.round(attendanceRate),
        avgMarks: Math.round(avgMarks),
      },
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Risk calculation failed" };
  }
}

export async function handleAIQuery(query: string) {
  try {
    const supabase = createAdminClient();
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("risk") || lowerQuery.includes("failing") || lowerQuery.includes("fail")) {
      const { data: students, error } = await supabase
        .from("marks")
        .select("student_id, marks_obtained")
        .lt("marks_obtained", 40);

      if (error) throw error;
      const uniqueStudents = [...new Set((students ?? []).map((s) => s.student_id))];
      return {
        success: true,
        answer: `I found ${uniqueStudents.length} students who are currently at risk of failing based on marks below 40.`,
        data: uniqueStudents,
      };
    }

    if (lowerQuery.includes("attendance") || lowerQuery.includes("absent") || lowerQuery.includes("low attendance")) {
      const { data, error } = await supabase
        .from("attendance")
        .select("student_id, status")
        .limit(2000);

      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const present = rows.filter((r) => r.status === "Present").length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;
      return {
        success: true,
        answer: `Overall attendance is ${rate}% across ${total} records. ${rate < 80 ? "This needs attention - consider parent reminders." : "Attendance looks healthy."}`,
        data: { rate, total },
      };
    }

    if (lowerQuery.includes("average") || lowerQuery.includes("grade") || lowerQuery.includes("performance") || lowerQuery.includes("academic")) {
      const { data: avg, error } = await supabase.from("marks").select("marks_obtained").limit(2000);

      if (error) throw error;
      const rows = avg ?? [];
      if (rows.length === 0) {
        return { success: true, answer: "No marks data available yet to compute an average.", data: { average: 0 } };
      }
      const schoolAvg = rows.reduce((acc, m) => acc + (m.marks_obtained ?? 0), 0) / rows.length;
      return {
        success: true,
        answer: `The overall average grade across the school is ${Math.round(schoolAvg)}% based on ${rows.length} marks.`,
        data: { average: Math.round(schoolAvg) },
      };
    }

    if (lowerQuery.includes("fee") || lowerQuery.includes("payment") || lowerQuery.includes("collection")) {
      const { data, error } = await supabase.from("fee_payments").select("amount_paid").limit(2000);
      if (error) {
        return {
          success: true,
          answer: "Fee module: focus on pending >5000 reminders, early-payment discount, and payment plans.",
          data: null,
        };
      }
      const total = (data ?? []).reduce((acc, r) => acc + Number(r.amount_paid ?? 0), 0);
      return {
        success: true,
        answer: `Total collected in sample is ${total}. Send reminders to pending families and offer early-payment incentives.`,
        data: { total },
      };
    }

    return {
      success: true,
      answer: "I can help with 'students at risk', 'average grades', 'low attendance', or 'fee collection'. Try one of those.",
      data: null,
    };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "AI query failed" };
  }
}

export async function getSystemMetrics() {
  try {
    const supabase = createAdminClient();
    const [{ count: studentCount }, { count: teacherCount }, { data: payments }] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("staff").select("*", { count: "exact", head: true }),
      supabase.from("fee_payments").select("amount_paid").limit(2000),
    ]);
    const totalRevenue = (payments ?? []).reduce((acc, r) => acc + Number(r.amount_paid ?? 0), 0);
    return {
      studentCount: studentCount ?? 0,
      teacherCount: teacherCount ?? 0,
      totalRevenue,
      metrics: [],
    };
  } catch {
    return { studentCount: 0, teacherCount: 0, totalRevenue: 0, metrics: [] };
  }
}

export async function getAtRiskStudents() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("marks").select("student_id, marks_obtained").lt("marks_obtained", 40).limit(100);
    const seen = new Map<string, number>();
    for (const row of data ?? []) {
      seen.set(row.student_id, (seen.get(row.student_id) ?? 0) + 1);
    }
    return [...seen.entries()].map(([id, count], i) => ({
      id,
      name: `Student ${id.slice(0, 6)}`,
      className: "—",
      rollNumber: `${i + 1}`,
      riskScore: Math.min(95, 50 + count * 10),
      status: "At Risk",
    }));
  } catch {
    return [];
  }
}
