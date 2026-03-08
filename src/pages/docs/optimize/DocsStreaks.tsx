import { DocPage } from "@/components/docs/DocPage";

export default function DocsStreaks() {
  return (
    <DocPage
      breadcrumb="Optimize › Streaks & Badges"
      title="Streaks & Badges Guide"
      description="How streaks work, badge earning, and equipping badges on your profile picture."
    >
      <h2>How Streaks Work</h2>
      <p>
        Your study streak builds automatically every time you use the app. Simply opening and using
        any feature — browsing pages, completing tasks, using the Pomodoro timer, or chatting with AI —
        counts as activity for the day. Your streak tracks consecutive days of activity.
      </p>

      <h2>Streak Tracking</h2>
      <ul>
        <li><strong>Auto-tracking:</strong> Activity is recorded automatically when you use the app. No manual action needed.</li>
        <li><strong>Daily reset:</strong> Each calendar day (midnight in your timezone) starts a new activity window.</li>
        <li><strong>Streak break:</strong> Missing an entire day without any app usage will reset your streak to 0.</li>
        <li><strong>Streak reminders:</strong> Enable streak reminders in Notification Settings to get alerts before your streak breaks.</li>
      </ul>

      <h2>Streak Milestones</h2>
      <p>Hit these milestones to earn bonus XP rewards:</p>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4">Milestone</th>
            <th className="text-left py-2 pr-4">XP Reward</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border/50"><td className="py-2 pr-4">7 days</td><td className="py-2">500 XP</td></tr>
          <tr className="border-b border-border/50"><td className="py-2 pr-4">14 days</td><td className="py-2">1,000 XP</td></tr>
          <tr className="border-b border-border/50"><td className="py-2 pr-4">30 days</td><td className="py-2">2,500 XP</td></tr>
          <tr className="border-b border-border/50"><td className="py-2 pr-4">60 days</td><td className="py-2">5,000 XP</td></tr>
          <tr className="border-b border-border/50"><td className="py-2 pr-4">100 days</td><td className="py-2">10,000 XP</td></tr>
          <tr><td className="py-2 pr-4">365 days</td><td className="py-2">25,000 XP</td></tr>
        </tbody>
      </table>

      <h2>Streak Badges</h2>
      <p>
        Badges are automatically earned when you reach streak milestones. Each badge has a rarity tier:
      </p>
      <ul>
        <li>🔥 <strong>First Flame</strong> (Common) — 1-day streak</li>
        <li>⚡ <strong>Week Warrior</strong> (Uncommon) — 7-day streak</li>
        <li>🌟 <strong>Fortnight Fighter</strong> (Uncommon) — 14-day streak</li>
        <li>👑 <strong>Monthly Master</strong> (Rare) — 30-day streak</li>
        <li>💎 <strong>Diamond Dedication</strong> (Epic) — 60-day streak</li>
        <li>🏆 <strong>Century Scholar</strong> (Legendary) — 100-day streak</li>
        <li>🌌 <strong>Year of Mastery</strong> (Mythic) — 365-day streak</li>
      </ul>

      <h2>Equipping Badges on Your Profile</h2>
      <p>
        Once earned, badges can be equipped to display on your profile picture across the platform.
        Click your avatar in the sidebar or settings to open the badge manager. Select any earned
        badge to equip it — it will appear as an icon overlay on your profile picture. Only one
        badge can be equipped at a time.
      </p>

      <h2>Badge Visibility</h2>
      <p>
        Equipped badges are visible to all users across the platform: in leaderboards, debates,
        community chat, study rooms, and anywhere your avatar appears. Show off your dedication!
      </p>
    </DocPage>
  );
}
