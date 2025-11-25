/**
 * Universal XP Reward System
 * All XP rewards are defined here for consistency across the application
 */

export const XP_REWARDS = {
  // Study Activities
  COMPLETE_TASK: 50,
  COMPLETE_POMODORO: 75,
  STUDY_30_MIN: 100,
  STUDY_60_MIN: 200,
  COMPLETE_EXAM_PREP: 150,
  
  // Learning Activities
  COMPLETE_LAB_EXPERIMENT: 100,
  COMPLETE_QUIZ: 80,
  PERFECT_QUIZ_SCORE: 150,
  READ_STUDY_MATERIAL: 30,
  WATCH_VIDEO: 40,
  TAKE_NOTES: 50,
  
  // Social & Community
  CREATE_BLOG_POST: 100,
  COMMENT_ON_POST: 20,
  CREATE_DEBATE: 100,
  POST_DEBATE_COMMENT: 30,
  WIN_DEBATE: 200,
  RECEIVE_UPVOTE: 10,
  GIVE_HELPFUL_FEEDBACK: 25,
  
  // Gamification
  COMPLETE_DAILY_CHALLENGE: 100,
  MAINTAIN_STREAK_7_DAYS: 250,
  MAINTAIN_STREAK_30_DAYS: 1000,
  UNLOCK_ACHIEVEMENT: 150,
  EARN_BADGE: 100,
  
  // Collaboration
  JOIN_STUDY_GROUP: 50,
  PARTICIPATE_IN_GROUP: 40,
  HELP_PEER: 75,
  SHARE_RESOURCE: 60,
  
  // AI & Technology
  USE_AI_CHAT: 20,
  GENERATE_STUDY_PLAN: 80,
  USE_SCHEDULER: 30,
  
  // Attendance & Participation
  ATTEND_LIVE_CLASS: 100,
  ASK_QUESTION_IN_CLASS: 50,
  COMPLETE_HOMEWORK: 120,
  SUBMIT_ON_TIME: 50,
  
  // Misc
  DAILY_LOGIN: 25,
  UPDATE_PROFILE: 30,
  CUSTOMIZE_THEME: 40,
  EXPLORE_NEW_FEATURE: 20,
} as const;

export type XPRewardKey = keyof typeof XP_REWARDS;

/**
 * Get XP reward amount for a specific activity
 */
export function getXPReward(activity: XPRewardKey): number {
  return XP_REWARDS[activity];
}

/**
 * Get a human-readable description for XP reward
 */
export function getXPDescription(activity: XPRewardKey): string {
  const descriptions: Record<XPRewardKey, string> = {
    COMPLETE_TASK: 'for completing a task',
    COMPLETE_POMODORO: 'for finishing a Pomodoro session',
    STUDY_30_MIN: 'for studying 30 minutes',
    STUDY_60_MIN: 'for studying 1 hour',
    COMPLETE_EXAM_PREP: 'for completing exam preparation',
    COMPLETE_LAB_EXPERIMENT: 'for completing a lab experiment',
    COMPLETE_QUIZ: 'for completing a quiz',
    PERFECT_QUIZ_SCORE: 'for acing the quiz',
    READ_STUDY_MATERIAL: 'for reading study material',
    WATCH_VIDEO: 'for watching educational content',
    TAKE_NOTES: 'for taking notes',
    CREATE_BLOG_POST: 'for creating a blog post',
    COMMENT_ON_POST: 'for commenting',
    CREATE_DEBATE: 'for starting a debate',
    POST_DEBATE_COMMENT: 'for contributing to debate',
    WIN_DEBATE: 'for winning a debate',
    RECEIVE_UPVOTE: 'for receiving an upvote',
    GIVE_HELPFUL_FEEDBACK: 'for helping others',
    COMPLETE_DAILY_CHALLENGE: 'for completing daily challenge',
    MAINTAIN_STREAK_7_DAYS: 'for 7-day streak',
    MAINTAIN_STREAK_30_DAYS: 'for 30-day streak',
    UNLOCK_ACHIEVEMENT: 'for unlocking achievement',
    EARN_BADGE: 'for earning a badge',
    JOIN_STUDY_GROUP: 'for joining a study group',
    PARTICIPATE_IN_GROUP: 'for group participation',
    HELP_PEER: 'for helping a classmate',
    SHARE_RESOURCE: 'for sharing resources',
    USE_AI_CHAT: 'for using AI assistance',
    GENERATE_STUDY_PLAN: 'for creating a study plan',
    USE_SCHEDULER: 'for organizing your schedule',
    ATTEND_LIVE_CLASS: 'for attending class',
    ASK_QUESTION_IN_CLASS: 'for asking a question',
    COMPLETE_HOMEWORK: 'for completing homework',
    SUBMIT_ON_TIME: 'for timely submission',
    DAILY_LOGIN: 'for daily login',
    UPDATE_PROFILE: 'for updating profile',
    CUSTOMIZE_THEME: 'for customizing theme',
    EXPLORE_NEW_FEATURE: 'for exploring new features',
  };
  
  return descriptions[activity];
}

/**
 * Helper to award XP with description
 */
export function createXPReward(activity: XPRewardKey) {
  return {
    amount: getXPReward(activity),
    description: getXPDescription(activity),
  };
}
