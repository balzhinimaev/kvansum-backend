'use client';

import type { Artifact, Habit, HabitStage } from '../model/types';

interface HabitStageTimelineProps {
  habit: Habit;
  streak: number;
  artifactLookup: Record<string, Artifact>;
}

const TRACK_WIDTH = 3;
const SEGMENT_GAP = 18;
const PROGRESS_GRADIENT = 'linear-gradient(180deg, #39e0b7 0%, #27b391 100%)';

const ratioBetween = (value: number, start: number, end: number) => {
  if (end <= start) return value >= end ? 1 : 0;
  return Math.max(0, Math.min(1, (value - start) / (end - start)));
};

export default function HabitStageTimeline({ habit, streak, artifactLookup }: HabitStageTimelineProps) {
  return (
    <div
      style={{
        position: 'relative',
        paddingLeft: 8,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {habit.stages.map((stage, index) => {
          const previousDays = index === 0 ? 0 : habit.stages[index - 1].days;
          const nextDays = index === habit.stages.length - 1 ? stage.days : habit.stages[index + 1].days;

          const fillToStage = ratioBetween(streak, previousDays, stage.days);
          const fillPastStage = ratioBetween(streak, stage.days, nextDays);
          const artifact = artifactLookup[`${habit.id}-${stage.days}`];
          const unlocked = streak >= stage.days;
          const remaining = Math.max(0, stage.days - streak);

          return (
            <StageRow
              key={stage.days}
              stage={stage}
              artifact={artifact}
              unlocked={unlocked}
              remaining={remaining}
              topFill={index === 0 ? 0 : fillToStage}
              bottomFill={index === habit.stages.length - 1 ? 0 : fillPastStage}
              fillRing={unlocked ? 1 : fillToStage}
              isFirst={index === 0}
              isLast={index === habit.stages.length - 1}
            />
          );
        })}
      </div>
    </div>
  );
}

function StageRow({
  stage,
  artifact,
  unlocked,
  remaining,
  topFill,
  bottomFill,
  fillRing,
  isFirst,
  isLast,
}: {
  stage: HabitStage;
  artifact?: Artifact;
  unlocked: boolean;
  remaining: number;
  topFill: number;
  bottomFill: number;
  fillRing: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const cardSurface = unlocked
    ? 'linear-gradient(140deg, rgba(40,120,98,.45), rgba(18,52,44,.72))'
    : 'linear-gradient(180deg, rgba(16,18,20,.92), rgba(12,14,16,.96))';
  const borderColor = unlocked ? '1px solid rgba(90,220,184,.5)' : '1px solid rgba(54,60,68,.55)';
  const headingColor = unlocked ? '#f7fffb' : '#f1f4f8';
  const bodyColor = unlocked ? 'rgba(214,242,232,.9)' : 'rgba(190,200,210,.72)';

  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        alignItems: 'stretch',
        marginTop: isFirst ? 0 : SEGMENT_GAP,
      }}
    >
      <TimelineColumn
        topFill={topFill}
        bottomFill={bottomFill}
        fillRing={fillRing}
        unlocked={unlocked}
        isFirst={isFirst}
        isLast={isLast}
      />

      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          background: cardSurface,
          border: borderColor,
          padding: '18px 20px',
          display: 'grid',
          gap: 14,
          color: headingColor,
          boxShadow: unlocked ? '0 20px 36px rgba(12,70,54,.32)' : '0 12px 28px rgba(6,10,12,.32)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                letterSpacing: 0.38,
                textTransform: 'uppercase',
                opacity: 0.62,
              }}
            >
              {stage.days} дней
            </div>
            <div style={{ fontSize: 16.5, fontWeight: 650 }}>{stage.title}</div>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 13,
                lineHeight: 1.6,
                color: bodyColor,
              }}
            >
              {stage.description}
            </p>
          </div>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(206,210,216,.72)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {stage.days} дн.
          </div>
        </div>

        {artifact ? (
          unlocked ? (
            <div
              style={{
                borderRadius: 16,
                padding: '12px 14px',
                background: 'rgba(60,176,148,.18)',
                border: '1px solid rgba(108,245,200,.34)',
                fontSize: 12.5,
                lineHeight: 1.55,
                color: 'rgba(212,244,230,.94)',
              }}
            >
              {artifact.body}
            </div>
          ) : (
            <div
              style={{
                borderRadius: 16,
                padding: '12px 14px',
                background: 'rgba(22,26,30,.92)',
                border: '1px solid rgba(60,66,74,.45)',
                fontSize: 12.5,
                lineHeight: 1.55,
                color: 'rgba(188,198,206,.74)',
              }}
            >
              Откроется материал «{artifact.title}», когда достигнешь этого этапа.
            </div>
          )
        ) : !unlocked ? (
          <StageStatusRow days={stage.days} remaining={remaining} />
        ) : null}
      </div>
    </div>
  );
}

function TimelineColumn({
  topFill,
  bottomFill,
  fillRing,
  unlocked,
  isFirst,
  isLast,
}: {
  topFill: number;
  bottomFill: number;
  fillRing: number;
  unlocked: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 18,
        marginLeft: -TRACK_WIDTH,
      }}
    >
      <Segment length={isFirst ? 0 : SEGMENT_GAP} fill={topFill} direction="up" />
      <StageNodeCircle unlocked={unlocked} fill={fillRing} />
      <Segment length={isLast ? 0 : SEGMENT_GAP} fill={bottomFill} direction="down" />
    </div>
  );
}

function Segment({ length, fill, direction }: { length: number; fill: number; direction: 'up' | 'down' }) {
  if (length <= 0) {
    return <div style={{ width: TRACK_WIDTH, height: 0 }} />;
  }

  const clamped = Math.max(0, Math.min(1, fill));

  return (
    <span
      aria-hidden
      style={{
        position: 'relative',
        width: TRACK_WIDTH,
        height: length,
        borderRadius: 999,
        background: 'rgba(96,104,112,0.28)',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          width: '100%',
          height: `${clamped * 100}%`,
          background: PROGRESS_GRADIENT,
          bottom: direction === 'up' ? 0 : undefined,
          top: direction === 'down' ? 0 : undefined,
        }}
      />
    </span>
  );
}

function StageNodeCircle({ unlocked, fill }: { unlocked: boolean; fill: number }) {
  const circleSize = 38;
  const clamped = Math.max(0, Math.min(1, fill));
  const ringGradient = clamped <= 0
    ? 'rgba(96,104,112,0.36)'
    : `conic-gradient(#39e0b7 ${clamped * 360}deg, rgba(96,104,112,0.36) ${clamped * 360}deg)`;

  return (
    <div
      style={{
        position: 'relative',
        width: circleSize,
        height: circleSize,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: TRACK_WIDTH,
          top: -SEGMENT_GAP,
          height: SEGMENT_GAP + circleSize + SEGMENT_GAP,
          background: 'rgba(96,104,112,0.28)',
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: TRACK_WIDTH,
          top: 0,
          height: circleSize * clamped,
          background: PROGRESS_GRADIENT,
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '50%',
          background: ringGradient,
          boxShadow: unlocked ? '0 18px 32px rgba(32,150,120,.42)' : '0 12px 24px rgba(6,10,12,.38)',
          mask: 'radial-gradient(circle 15px at center, transparent 13px, black 13px)',
          WebkitMask: 'radial-gradient(circle 15px at center, transparent 13px, black 13px)',
        }}
      />
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 4,
          borderRadius: '50%',
          background: unlocked ? 'rgba(30,160,128,.25)' : 'rgba(20,24,26,.95)',
          border: unlocked ? '1px solid rgba(90,220,184,.45)' : '1px solid rgba(66,72,80,.55)',
        }}
      />
      <LockIcon open={unlocked} color={unlocked ? '#04271d' : 'rgba(188,198,206,.82)'} size={16} />
    </div>
  );
}

function StageStatusRow({ days, remaining }: { days: number; remaining: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'rgba(188,198,206,.72)',
        letterSpacing: 0.16,
      }}
    >
      <LockIcon open={false} color='rgba(188,198,206,.72)' size={18} />
      <span>
        {remaining > 0
          ? `Разблокируется на ${days}-й день · осталось ${remaining} дн.`
          : `Разблокируется на ${days}-й день`}
      </span>
    </div>
  );
}

function LockIcon({ color, size = 20, open = false }: { color: string; size?: number; open?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      {open ? (
        <path d="M16 11V7a4 4 0 1 0-8 0" />
      ) : (
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      )}
      <path d="M12 15v2" />
    </svg>
  );
}
