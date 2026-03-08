import { formatDistanceToNow } from "date-fns";

/**
 * Format a timestamp into a human-friendly relative time string.
 * e.g. "2 minutes ago", "3 hours ago", "5 days ago"
 */
export function relativeTime(timestamp: string | Date): string {
  try {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "just now";
  }
}

/**
 * Returns an appropriate emoji icon for a notification type
 */
export function getNotificationEmoji(type: string): string {
  const map: Record<string, string> = {
    resource_access: "📁",
    feedback_response: "💬",
    exam_reminder: "📅",
    streak_milestone: "🔥",
    streak_reminder: "⚡",
    role_change: "🛡️",
    achievement: "🏆",
    xp_earned: "⭐",
    guild: "⚔️",
    class_reminder: "📚",
    message: "✉️",
    system: "🔔",
  };
  return map[type] || "🔔";
}

/**
 * Group notifications by date (Today, Yesterday, Older)
 */
export function groupNotificationsByDate<T extends { created_at: string }>(
  notifications: T[]
): { label: string; items: T[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: T[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Older", items: [] },
  ];

  notifications.forEach((n) => {
    const d = new Date(n.created_at);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups[0].items.push(n);
    else if (d.getTime() === yesterday.getTime()) groups[1].items.push(n);
    else groups[2].items.push(n);
  });

  return groups.filter((g) => g.items.length > 0);
}
