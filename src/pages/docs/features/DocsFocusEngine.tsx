import { DocPage, DocCallout } from "@/components/docs/DocPage";

export default function DocsFocusEngine() {
  return (
    <DocPage breadcrumb="Features › Focus Engine" title="Focus Engine" description="Stay productive with Pomodoro timer, distraction blocking, ambient sounds, and session analytics.">
      <h2>Pomodoro Timer</h2>
      <p>The Focus Engine implements the Pomodoro Technique with customizable work/break intervals. Default is 25 minutes work, 5 minutes short break, and 15 minutes long break after 4 sessions.</p>

      <h2>Distraction Blocker</h2>
      <p>Add websites to your block list and activate blocking during focus sessions. The blocker prevents navigation to listed sites while active.</p>

      <h2>Ambient Sounds</h2>
      <p>Play background sounds (rain, cafe, nature, white noise) to enhance concentration. Multiple sounds can be layered and volume-controlled independently.</p>

      <h2>Session Analytics</h2>
      <p>Track your focus sessions over time with charts showing daily/weekly study hours, focus scores, and session completion rates.</p>

      <DocCallout type="info" title="Guest Access">
        The Focus Engine is one of the few features available in guest mode (without authentication). Full analytics require login.
      </DocCallout>
    </DocPage>
  );
}
