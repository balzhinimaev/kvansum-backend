import type { Progress } from '../model/types';

export const PROGRESS: Progress = {
  completionByDate: {}, // детальные отметки не нужны для моков в текущем UI
  habitStreak: {
    'h-water': 18,
    'h-bed': 12,
    'h-stretch': 9,
    'h-cold': 4,
    'h-3goals': 26,
    'h-no-phone': 14,
    'h-read10': 8,
    'h-walk15': 11,
    'h-journal': 6,
    'h-no-sugar': 3,
    'h-breath': 10,
    'h-meditate10': 0,
    'h-gratitude': 0,
    'h-digital-sunset': 0,
    'h-plan-evening': 0,
    'h-inbox-zero': 0,
    'h-clean-desk': 0,
    'h-learning': 0,
    'h-network': 0,
    'h-project': 0,
    'h-mentor': 0,
    'h-vision': 0,
    'h-giveback': 0,
  },
  levelUnlockedAt: {
    lvl1: '2025-09-01',
    lvl2: undefined,
    lvl3: undefined,
    lvl4: undefined,
    lvl5: undefined,
    lvl6: undefined,
    lvl7: undefined,
  },
};

