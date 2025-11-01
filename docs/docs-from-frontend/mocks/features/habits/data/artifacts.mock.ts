import type { Artifact } from '../model/types';

export const ARTIFACTS: Artifact[] = [
  {
    id: 'art-water-7',
    title: 'Почему важно пить воду утром',
    body: 'Гидратация запускает обмен веществ и делает мозг яснее без кофеина.',
    unlock: { type: 'habit_stage', habitId: 'h-water', days: 7 },
  },
  {
    id: 'art-bed-21',
    title: 'Первая победа дня',
    body: 'Заправленная постель формирует петлю «начал → закончил» и даёт быстрый дофамин.',
    unlock: { type: 'habit_stage', habitId: 'h-bed', days: 21 },
  },
  {
    id: 'art-stretch-45',
    title: 'Эластичность тела = гибкость мышления',
    body: 'Регулярные растяжки снижают тревожность и улучшают пластичность мышления.',
    unlock: { type: 'habit_stage', habitId: 'h-stretch', days: 45 },
  },
  {
    id: 'art-level1',
    title: 'Готов к «Фокусу и вниманию»',
    body: 'Ты выстроил фундамент энергии — теперь переходи к управлению вниманием и задачами.',
    unlock: { type: 'level_progress', levelId: 'lvl1', threshold: 0.3 },
  },
  {
    id: 'art-journal-21',
    title: 'Сила вечернего журнала',
    body: 'Короткая запись закрывает день, фиксирует инсайты и снижает стресс перед сном.',
    unlock: { type: 'habit_stage', habitId: 'h-journal', days: 21 },
  },
  {
    id: 'art-level2',
    title: 'Следующий шаг — самоконтроль',
    body: 'Два стрика по 30 дней на уровне фокуса — и ты готов работать с самоконтролем.',
    unlock: { type: 'level_progress', levelId: 'lvl2', threshold: 0.3 },
  },
];

