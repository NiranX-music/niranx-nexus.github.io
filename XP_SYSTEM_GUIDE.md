# Universal XP System Guide

## Overview
The NiranX StudyVerse app now has a universal XP system where all XP is collected in one central database (`user_profiles` table). This ensures consistency across the entire application.

## Database
- **Table**: `user_profiles`
- **Columns**: 
  - `id` (uuid) - User ID
  - `xp` (integer) - Total XP earned
  - `level` (integer) - Current level
  - `total_study_minutes` (integer)
  - `current_streak` (integer)
  - `longest_streak` (integer)
  - `last_activity_date` (date)

## XP Context
Located at: `src/contexts/XPContext.tsx`

The XP context provides:
- `xp`: Current XP
- `level`: Current level  
- `addXP(amount, reason)`: Add XP with reason
- `getXPForNextLevel()`: XP needed for next level
- `getXPProgress()`: Progress percentage to next level
- `loading`: Loading state

## How to Add XP to Any Page

### Step 1: Import the Hook
```typescript
import { useXPReward } from '@/hooks/useXPReward';
```

### Step 2: Use the Hook
```typescript
const { awardXP, awardCustomXP } = useXPReward();
```

### Step 3: Award XP for Activities
```typescript
// Using predefined rewards
await awardXP('COMPLETE_TASK');
await awardXP('STUDY_30_MIN');
await awardXP('CREATE_BLOG_POST');

// Using custom rewards
await awardCustomXP(100, 'Custom achievement');
```

## Available XP Rewards

### Study Activities
- `COMPLETE_TASK`: 50 XP
- `COMPLETE_POMODORO`: 75 XP
- `STUDY_30_MIN`: 100 XP
- `STUDY_60_MIN`: 200 XP
- `COMPLETE_EXAM_PREP`: 150 XP

### Learning
- `COMPLETE_LAB_EXPERIMENT`: 100 XP
- `COMPLETE_QUIZ`: 80 XP
- `PERFECT_QUIZ_SCORE`: 150 XP
- `READ_STUDY_MATERIAL`: 30 XP
- `WATCH_VIDEO`: 40 XP
- `TAKE_NOTES`: 50 XP

### Social & Community
- `CREATE_BLOG_POST`: 100 XP
- `COMMENT_ON_POST`: 20 XP
- `CREATE_DEBATE`: 100 XP
- `POST_DEBATE_COMMENT`: 30 XP
- `WIN_DEBATE`: 200 XP
- `RECEIVE_UPVOTE`: 10 XP
- `GIVE_HELPFUL_FEEDBACK`: 25 XP

### Gamification
- `COMPLETE_DAILY_CHALLENGE`: 100 XP
- `MAINTAIN_STREAK_7_DAYS`: 250 XP
- `MAINTAIN_STREAK_30_DAYS`: 1000 XP
- `UNLOCK_ACHIEVEMENT`: 150 XP
- `EARN_BADGE`: 100 XP

### Collaboration
- `JOIN_STUDY_GROUP`: 50 XP
- `PARTICIPATE_IN_GROUP`: 40 XP
- `HELP_PEER`: 75 XP
- `SHARE_RESOURCE`: 60 XP

### AI & Technology
- `USE_AI_CHAT`: 20 XP
- `GENERATE_STUDY_PLAN`: 80 XP
- `USE_SCHEDULER`: 30 XP

### Attendance
- `ATTEND_LIVE_CLASS`: 100 XP
- `ASK_QUESTION_IN_CLASS`: 50 XP
- `COMPLETE_HOMEWORK`: 120 XP
- `SUBMIT_ON_TIME`: 50 XP

### Misc
- `DAILY_LOGIN`: 25 XP
- `UPDATE_PROFILE`: 30 XP
- `CUSTOMIZE_THEME`: 40 XP
- `EXPLORE_NEW_FEATURE`: 20 XP

## Example Implementations

### Example 1: Award XP on Task Completion
```typescript
import { useXPReward } from '@/hooks/useXPReward';

function TaskComponent() {
  const { awardXP } = useXPReward();
  
  const handleCompleteTask = async () => {
    // Complete the task logic
    setTaskCompleted(true);
    
    // Award XP
    await awardXP('COMPLETE_TASK');
  };
  
  return <button onClick={handleCompleteTask}>Complete Task</button>;
}
```

### Example 2: Award XP on Study Session
```typescript
import { useXPReward } from '@/hooks/useXPReward';

function PomodoroTimer() {
  const { awardXP } = useXPReward();
  
  const handleSessionComplete = async (duration: number) => {
    // Award based on duration
    if (duration >= 60) {
      await awardXP('STUDY_60_MIN');
    } else if (duration >= 30) {
      await awardXP('STUDY_30_MIN');
    }
    
    // Also award for pomodoro completion
    await awardXP('COMPLETE_POMODORO');
  };
  
  return <div>Pomodoro Timer</div>;
}
```

### Example 3: Award XP on Daily Login
```typescript
import { useXPReward } from '@/hooks/useXPReward';
import { useEffect } from 'react';

function Dashboard() {
  const { awardXP } = useXPReward();
  
  useEffect(() => {
    // Check if user logged in today
    const lastLogin = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
      awardXP('DAILY_LOGIN');
      localStorage.setItem('lastLoginDate', today);
    }
  }, []);
  
  return <div>Dashboard</div>;
}
```

### Example 4: Display XP in UI
```typescript
import { useXP } from '@/contexts/XPContext';

function XPDisplay() {
  const { xp, level, getXPProgress } = useXP();
  
  return (
    <div>
      <div>Level {level}</div>
      <div>{xp} XP</div>
      <ProgressBar value={getXPProgress()} />
    </div>
  );
}
```

## Pages That Should Award XP

### High Priority
- [x] Tasks (`TaskManager.tsx`) - Complete task
- [ ] Focus Engine - Complete focus session
- [ ] Pomodoro - Complete pomodoro session
- [ ] AI Chat - Use AI assistance
- [ ] Labs - Complete experiments
- [ ] Exams - Complete exam prep
- [ ] Debates - Create debate, post comment
- [ ] Study Groups - Join group, participate
- [ ] Blogs - Create post, comment

### Medium Priority
- [ ] Video Library - Watch video
- [ ] Library - Read material
- [ ] Notes - Take notes
- [ ] Analytics - View stats
- [ ] Scheduler - Use scheduler
- [ ] Whiteboard - Use whiteboard

### Low Priority
- [ ] Settings - Update profile, customize theme
- [ ] File Hub - Upload file, share resource
- [ ] Music Player - Use music player
- [ ] Games - Play educational games

## Best Practices

1. **Always use the universal system**: Don't create separate XP tracking
2. **Use predefined rewards**: Stick to the rewards in `xpRewards.ts`
3. **Provide context**: Use descriptive reasons when awarding XP
4. **Be consistent**: Award similar amounts for similar activities
5. **Test thoroughly**: Ensure XP is properly saved to database
6. **Handle errors**: Wrap XP awards in try-catch blocks
7. **Avoid double-awarding**: Check if action was already rewarded

## Troubleshooting

### XP Not Saving
- Check if user is logged in (`useAuth`)
- Verify database connection
- Check browser console for errors
- Ensure `user_profiles` table exists

### XP Not Displaying
- Verify XPContext is wrapped around app
- Check if `loading` state is handled
- Ensure XPDisplay component is importing from context

### Level Not Updating
- Level is calculated as: `floor(xp / 1000) + 1`
- 1000 XP = 1 level
- Check if XP is being added correctly

## Adding New XP Rewards

To add a new XP reward:

1. Add to `src/lib/xpRewards.ts`:
```typescript
export const XP_REWARDS = {
  // ... existing rewards
  NEW_ACTIVITY: 50,
} as const;
```

2. Add description:
```typescript
const descriptions: Record<XPRewardKey, string> = {
  // ... existing descriptions
  NEW_ACTIVITY: 'for completing new activity',
};
```

3. Use in component:
```typescript
await awardXP('NEW_ACTIVITY');
```

## Migration from Old Systems

If a page has its own XP tracking:

1. Remove local XP state
2. Remove XP calculations
3. Import `useXPReward` hook
4. Replace XP awards with `awardXP()` calls
5. Remove XP storage/loading logic
6. Test thoroughly

## Summary

The universal XP system makes it easy to reward users consistently across the entire app. Simply import the hook, call `awardXP()` with the appropriate activity, and the system handles everything else including database storage, level calculation, and UI updates.
