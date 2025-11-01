'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Artifact, Habit, Level, Progress } from '../model/types';
import {
  LEVEL_UNLOCK_REQUIRED_HABITS,
  LEVEL_UNLOCK_REQUIRED_STREAK,
  levelCompletionRate,
} from '../model/selectors';

interface LevelSectionProps {
  level: Level;
  habits: Habit[];
  progress: Progress;
  artifacts: Artifact[];
}

const difficultyConfig: Record<
  Habit['difficulty'],
  { label: string; background: string; color: string }
> = {
  easy: { label: 'Легко', background: 'rgba(68,207,132,.18)', color: '#7bf0b6' },
  medium: { label: 'Средне', background: 'rgba(84,155,255,.18)', color: '#a9c8ff' },
  hard: { label: 'Сложно', background: 'rgba(255,174,94,.18)', color: '#ffd6a8' },
};

const StageTimeline = dynamic(() => import('./HabitStageTimeline'), { ssr: false });

export default function LevelSection({ level, habits, progress, artifacts }: LevelSectionProps) {
  const [openedHabitId, setOpenedHabitId] = useState<string | null>(null);

  const completionRate = useMemo(
    () => levelCompletionRate(level.id, habits, progress),
    [habits, level.id, progress]
  );
  const completionPercent = Math.round(completionRate * 100);
  const qualifiedHabits = useMemo(
    () =>
      habits.filter(
        (habit) => (progress.habitStreak[habit.id] ?? 0) >= LEVEL_UNLOCK_REQUIRED_STREAK
      ).length,
    [habits, progress.habitStreak]
  );

  const isUnlocked = level.order === 1 || Boolean(progress.levelUnlockedAt[level.id]);

  const habitArtifactsMap = useMemo(() => {
    const record: Record<string, Artifact> = {};
    artifacts.forEach((artifact) => {
      if (artifact.unlock.type === 'habit_stage') {
        record[`${artifact.unlock.habitId}-${artifact.unlock.days}`] = artifact;
      }
    });
    return record;
  }, [artifacts]);

  const openedHabit = useMemo(
    () => habits.find((habit) => habit.id === openedHabitId),
    [habits, openedHabitId]
  );

  const openedStreak = openedHabit ? progress.habitStreak[openedHabit.id] ?? 0 : 0;

  const handleOpenHabit = (habitId: string) => {
    if (!isUnlocked) return;
    setOpenedHabitId(habitId);
  };

  const handleCloseHabit = useCallback(() => {
    setOpenedHabitId(null);
  }, []);

  return (
    <>
      <section
        style={{
          borderRadius: 28,
          padding: '28px clamp(18px, 3vw, 32px)',
          background: 'linear-gradient(180deg, rgba(16,18,20,.94), rgba(10,12,14,.94))',
          border: '1px solid rgba(53,213,175,.18)',
          boxShadow: '0 24px 42px rgba(4,12,10,.6)',
          display: 'grid',
          gap: 20,
        }}
      >
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: '#f4fdf9',
                letterSpacing: 0.2,
              }}
            >
              Уровень {level.order}: {level.title}
            </h2>
            {level.description ? (
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'rgba(223,244,236,.72)',
                  maxWidth: 520,
                }}
              >
                {level.description}
              </p>
            ) : null}
          </div>

          <div style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
            <StatusBadge unlocked={isUnlocked} />
            <div
              style={{
                fontSize: 12,
                color: 'rgba(208,236,226,.66)',
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {qualifiedHabits}/{LEVEL_UNLOCK_REQUIRED_HABITS} привычек с 30-дневным стриком · Прогресс {completionPercent}%
            </div>
          </div>
        </header>

        {isUnlocked ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {habits.map((habit) => {
              const streak = progress.habitStreak[habit.id] ?? 0;
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={streak}
                  onOpen={() => handleOpenHabit(habit.id)}
                />
              );
            })}
          </div>
        ) : (
          <LockedLevelCard level={level} />
        )}
      </section>

      {openedHabit ? (
        <HabitStageModal
          habit={openedHabit}
          streak={openedStreak}
          artifactLookup={habitArtifactsMap}
          onClose={handleCloseHabit}
        />
      ) : null}
    </>
  );
}

function StatusBadge({ unlocked }: { unlocked: boolean }) {
  return (
    <span
      style={{
        justifySelf: 'end',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        background: unlocked ? 'rgba(109,246,201,.18)' : 'rgba(139,150,163,.16)',
        color: unlocked ? '#d6fff1' : '#ced3dc',
        border: unlocked ? '1px solid rgba(109,246,201,.45)' : '1px solid rgba(206,210,216,.32)',
      }}
    >
      <span aria-hidden>{unlocked ? '✅' : '🔒'}</span>
      {unlocked ? 'Уровень открыт' : 'Заблокировано'}
    </span>
  );
}

function HabitCard({
  habit,
  streak,
  onOpen,
}: {
  habit: Habit;
  streak: number;
  onOpen: () => void;
}) {
  const difficulty = difficultyConfig[habit.difficulty];

  return (
    <div
      style={{
        borderRadius: 22,
        background: 'rgba(12,14,16,.8)',
        border: '1px solid rgba(255,255,255,.04)',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 16,
          alignItems: 'center',
          cursor: 'pointer',
          background: 'transparent',
          border: 'none',
          padding: 0,
          textAlign: 'left',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: 'rgba(24,28,32,.96)',
            border: '1px solid rgba(255,255,255,.08)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 28,
          }}
        >
          {habit.emoji ?? '🧠'}
        </div>

        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <div
            style={{
              fontSize: 16.5,
              fontWeight: 600,
              color: '#f6fbff',
            }}
          >
            {habit.title}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12.5,
                background: difficulty.background,
                color: difficulty.color,
                letterSpacing: 0.3,
              }}
            >
              {difficulty.label}
            </span>
            <span
              style={{
                fontSize: 12.5,
                color: 'rgba(206,210,216,.65)',
                letterSpacing: 0.3,
              }}
            >
              🔥 {streak} дн.
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        style={{
          padding: '10px 18px',
          borderRadius: 999,
          border: 'none',
          background: 'linear-gradient(180deg, #35d5af, #2cc39f)',
          color: '#02110b',
          fontWeight: 650,
          fontSize: 13.5,
          letterSpacing: 0.3,
          cursor: 'pointer',
          boxShadow: '0 12px 24px rgba(38,208,160,.35)',
        }}
      >
        Добавить
      </button>
    </div>
  );
}

function LockedLevelCard({ level }: { level: Level }) {
  return (
    <div
      style={{
        borderRadius: 24,
        padding: '28px 22px',
        border: '1px dashed rgba(206,210,216,.35)',
        background: 'rgba(12,14,16,.6)',
        display: 'grid',
        gap: 12,
        justifyItems: 'center',
        textAlign: 'center',
        color: 'rgba(206,210,216,.72)',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          border: '1px solid rgba(206,210,216,.35)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 28,
          background: 'rgba(26,28,32,.88)',
        }}
      >
        🔒
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600 }}>Уровень закрыт</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
        Достигни уровень {level.order}, чтобы разблокировать артефакты и привычки этого уровня.
      </div>
    </div>
  );
}

function HabitStageModal({
  habit,
  streak,
  artifactLookup,
  onClose,
}: {
  habit: Habit;
  streak: number;
  artifactLookup: Record<string, Artifact>;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  const maxStageDays = habit.stages[habit.stages.length - 1]?.days ?? 1;
  const progressRatio = Math.min(streak / maxStageDays, 1);
  const viewHeight = viewport.height || 0;
  const sheetHeight = viewHeight ? Math.min(viewHeight * 0.88, 620) : 620;

  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-50%)',
    width: 'min(560px, 100vw)',
    height: sheetHeight,
    borderRadius: '24px 24px 0 0',
    background: 'rgba(18,20,22,0.96)',
    border: '1px solid rgba(38,160,132,0.18)',
    boxShadow: '0 -26px 48px rgba(4,16,12,0.55)',
    padding: '28px clamp(18px, 4vw, 36px)',
    display: 'grid',
    gap: 24,
    overflowY: 'auto',
    cursor: 'default',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6,10,9,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 1200,
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={containerStyle}
      >
        <span
          aria-hidden
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 56,
            height: 4,
            borderRadius: 999,
            background: 'rgba(206,210,216,0.32)',
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            width: 34,
            height: 34,
            borderRadius: 12,
            border: '1px solid rgba(206,210,216,0.24)',
            background: 'rgba(24,26,28,0.92)',
            color: '#f6fbff',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <header
          style={{
            display: 'grid',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              aria-hidden
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: 'rgba(28,32,36,.94)',
                border: '1px solid rgba(255,255,255,.06)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 28,
              }}
            >
              {habit.emoji ?? '🧠'}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#f5fbff',
                }}
              >
                {habit.title}
              </h3>
              <div
                style={{
                  marginTop: 6,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  background: 'rgba(255,124,88,.16)',
                  color: '#ffc7b6',
                  letterSpacing: 0.3,
                }}
              >
                🔥 {streak} дней · Путь к мастерству
              </div>
            </div>
          </div>
        </header>

        <StageTimeline habit={habit} streak={streak} artifactLookup={artifactLookup} />
      </div>
    </div>
  );
}
