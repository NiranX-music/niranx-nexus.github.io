import { DocPage } from "@/components/docs/DocPage";
export default function DocsAnalytics() {
  return (
    <DocPage breadcrumb="Optimize › Analytics" title="Analytics Dashboard" description="Track study progress, productivity metrics, and learning patterns with comprehensive analytics.">
      <h2>Dashboard Metrics</h2>
      <ul>
        <li>Total study hours (daily, weekly, monthly)</li>
        <li>Focus score and session completion rate</li>
        <li>Tasks completed and overdue</li>
        <li>Pomodoro sessions and streaks</li>
        <li>Subject breakdown by time spent</li>
      </ul>
      <h2>Advanced Analytics</h2>
      <p>The Advanced Dashboard provides deeper insights with heat maps, trend lines, comparison charts, and AI-generated study recommendations.</p>
    </DocPage>
  );
}
