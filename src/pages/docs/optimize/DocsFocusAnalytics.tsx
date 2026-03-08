import { DocPage } from "@/components/docs/DocPage";
export default function DocsFocusAnalytics() {
  return (
    <DocPage breadcrumb="Optimize › Focus Analytics" title="Focus Analytics" description="Detailed analytics for your focus sessions, Pomodoro stats, and productivity trends.">
      <h2>Session Tracking</h2>
      <p>Every focus session is logged with duration, completion status, and distraction events. View session history and identify your most productive times.</p>
      <h2>Pomodoro Stats Dashboard</h2>
      <p>Dedicated dashboard showing Pomodoro-specific metrics: sessions per day, average focus time, break patterns, and long-term trends.</p>
      <h2>Study Timer Analytics</h2>
      <p>Visual charts showing when you study, how long, and how consistently. Identify patterns and optimize your schedule.</p>
    </DocPage>
  );
}
