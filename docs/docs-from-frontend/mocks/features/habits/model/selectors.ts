import type { Artifact, Habit, Progress } from './types';

export const WINDOW_DAYS = 60;
export const THRESHOLD = 0.3;
export const MIN_GAP_DAYS = 21;
export const LEVEL_UNLOCK_REQUIRED_STREAK = 30;
export const LEVEL_UNLOCK_REQUIRED_HABITS = 2;

const DAY_MS = 86_400_000;

const sumHabitWindow = (habitId: string, progress: Progress, end: Date, windowDays: number) => {
  const byDate = progress.completionByDate[habitId] ?? {};
  let total = 0;
  const cursor = new Date(end);
  for (let i = 0; i < windowDays; i += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    total += byDate[iso] ?? 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
};

export const isHabitMilestoneUnlocked = (habitId: string, days: number, progress: Progress) =>
  (progress.habitStreak[habitId] ?? 0) >= days;

export const levelCompletionRate = (
  levelId: string,
  habits: Habit[],
  progress: Progress,
  now: Date = new Date()
) => {
  if (habits.length === 0) return 0;
  const earned = habits
    .map((habit) => sumHabitWindow(habit.id, progress, now, WINDOW_DAYS))
    .reduce((acc, value) => acc + value, 0);
  const possible = WINDOW_DAYS * habits.length;
  return possible === 0 ? 0 : earned / possible;
};

export const canUnlockNextLevel = (
  prevLevelId: string,
  habitsOfPrevLevel: Habit[],
  progress: Progress,
  now: Date = new Date()
) => {
  const qualifyingHabits = habitsOfPrevLevel.filter(
    (habit) => (progress.habitStreak[habit.id] ?? 0) >= LEVEL_UNLOCK_REQUIRED_STREAK
  ).length;
  if (qualifyingHabits < LEVEL_UNLOCK_REQUIRED_HABITS) return false;

  const unlockedAt = progress.levelUnlockedAt[prevLevelId];
  if (!unlockedAt) return true;

  const daysSinceUnlock = (now.getTime() - new Date(unlockedAt).getTime()) / DAY_MS;
  return daysSinceUnlock >= MIN_GAP_DAYS;
};

export const byUnlockedFirst = (unlockedIds: Set<string>) =>
  (a: Artifact, b: Artifact) => Number(!unlockedIds.has(a.id)) - Number(!unlockedIds.has(b.id));

