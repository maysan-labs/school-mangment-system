import InsightsDashboard from "@/components/insights/InsightsDashboard";
import { getSystemMetrics, getAtRiskStudents } from "@/lib/services/insights";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const metrics = await getSystemMetrics();
  const atRiskStudents = await getAtRiskStudents();

  return (
    <div className="p-6">
      <InsightsDashboard systemMetrics={metrics} atRiskStudents={atRiskStudents} />
    </div>
  );
}