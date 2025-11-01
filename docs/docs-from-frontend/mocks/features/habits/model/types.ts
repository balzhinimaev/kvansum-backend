export type TimeOfDay = 'morning' | 'day' | 'evening' | 'summary';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface HabitStage {
  days: number;
  title: string;
  description: string;
}

export interface Habit {
  id: string;
  levelId: string;
  title: string;
  difficulty: Difficulty;
  timeOfDay: TimeOfDay;
  days: ('daily' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  emoji?: string;
  summary?: string;
  stages: HabitStage[];
}

export interface Level {
  id: string;
  order: number;
  title: string;
  description?: string;
  emoji?: string;
  nextLevelId?: string;
  unlockAfterDays?: number;
}

export type ArtifactUnlock =
  | { type: 'habit_stage'; habitId: string; days: number }
  | { type: 'level_progress'; levelId: string; threshold: number };

export interface Artifact {
  id: string;
  title: string;
  body: string;
  unlock: ArtifactUnlock;
}

export interface Progress {
  completionByDate: Record<string, Record<string, 0 | 1>>;
  habitStreak: Record<string, number>;
  levelUnlockedAt: Record<string, string | undefined>;
}

