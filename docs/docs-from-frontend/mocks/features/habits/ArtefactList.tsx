'use client';

import { useMemo } from 'react';
import LevelSection from './ui/LevelSection';
import { LEVELS } from './data/levels.mock';
import { HABITS } from './data/habits.mock';
import { ARTIFACTS } from './data/artifacts.mock';
import { PROGRESS } from './data/progress.mock';

export default function ArtefactList() {
  const levels = useMemo(
    () => [...LEVELS].sort((a, b) => a.order - b.order),
    []
  );

  return (
    <div
      style={{
        display: 'grid',
        gap: 32,
        width: 'min(960px, 100%)',
        margin: '0 auto',
      }}
    >
      {levels.map((level) => {
        const habitsOfLevel = HABITS.filter((habit) => habit.levelId === level.id);
        return (
          <LevelSection
            key={level.id}
            level={level}
            habits={habitsOfLevel}
            progress={PROGRESS}
            artifacts={ARTIFACTS}
          />
        );
      })}
    </div>
  );
}
