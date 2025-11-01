# 📋 Ревизия архитектуры: 3 источника данных

## ✅ Что было исправлено

### **Проблема (до):**
- Компонент `DashboardClient.tsx` имел **хардкод** данных прямо внутри
- Моковые данные в папке `src/features/habits/data/` **НЕ использовались**
- Невозможно было подключить реальный API в будущем

### **Решение (сейчас):**
Теперь архитектура правильно разделена на **Server** и **Client** компоненты:

```
┌─────────────────────────────────────────────────────────┐
│  page.tsx (Server Component)                            │
│  ↓ Получает данные из 3 источников                      │
│  ├─ HABITS (привычки)                                   │
│  ├─ LEVELS (уровни)                                     │
│  └─ PROGRESS (прогресс пользователя)                    │
└──────────────────┬──────────────────────────────────────┘
                   │ Передает через props
                   ↓
┌─────────────────────────────────────────────────────────┐
│  DashboardClient.tsx (Client Component)                 │
│  ↓ Принимает данные и рендерит UI                       │
│  ├─ Конвертирует данные в формат UI                     │
│  ├─ Фильтрует привычки по уровню                        │
│  └─ Управляет состоянием (statuses, activeIndex)        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Детальный анализ

### **1. Server Component: `page.tsx`**

```typescript
// apps/web/app/(app)/dashboard/page.tsx

import { HABITS } from '@/features/habits/data/habits.mock';
import { LEVELS } from '@/features/habits/data/levels.mock';
import { PROGRESS } from '@/features/habits/data/progress.mock';

export default function Page() {
  // 🎯 Здесь 3 источника данных
  const habits = HABITS;    // 23 привычки из моков
  const levels = LEVELS;    // 7 уровней
  const progress = PROGRESS; // Прогресс пользователя

  // 💡 В будущем легко заменить на:
  // const habits = await fetchHabits();
  // const levels = await fetchLevels();
  // const progress = await fetchProgress();

  return (
    <DashboardClient 
      habits={habits}
      levels={levels}
      progress={progress}
    />
  );
}
```

**Что здесь происходит:**
- ✅ **Server-side рендеринг** - данные получаются на сервере
- ✅ **3 источника данных** четко разделены
- ✅ **Легко мигрировать на API** - просто раскомментировать await fetch

---

### **2. Client Component: `DashboardClient.tsx`**

```typescript
interface DashboardClientProps {
  habits: HabitFromTypes[];  // Из habits.mock.ts
  levels: Level[];           // Из levels.mock.ts
  progress: Progress;        // Из progress.mock.ts
}

export default function DashboardClient({ habits, levels, progress }: DashboardClientProps) {
  // Конвертируем данные с сервера в формат UI
  const habitCards: HabitCard[] = useMemo(() => {
    const currentLevelId = 'lvl1'; // Показываем только уровень 1
    return habits
      .filter(h => h.levelId === currentLevelId)
      .map(h => convertToHabitCard(h, progress));
  }, [habits, progress]);

  // Остальная логика UI...
}
```

**Что здесь происходит:**
- ✅ Принимает данные через **props** (не хардкод!)
- ✅ **Конвертирует** данные из типов API в типы UI
- ✅ **Фильтрует** привычки по уровню (сейчас lvl1)
- ✅ Использует реальные **streak** из `progress.habitStreak`

---

## 📊 Источники данных

### **1. Habits (Привычки)**
**Файл:** `apps/web/src/features/habits/data/habits.mock.ts`

```typescript
export const HABITS: Habit[] = [
  {
    id: 'h-water',
    levelId: 'lvl1',
    title: 'Стакан воды после пробуждения',
    difficulty: 'easy',
    timeOfDay: 'morning',
    days: ['daily'],
    emoji: '💧',
    summary: 'Запускает обмен веществ...',
    stages: [...],
  },
  // ... 22 других привычки
];
```

**Что содержит:** 23 привычки, распределенные по 7 уровням

---

### **2. Levels (Уровни)**
**Файл:** `apps/web/src/features/habits/data/levels.mock.ts`

```typescript
export const LEVELS: Level[] = [
  {
    id: 'lvl1',
    order: 1,
    title: 'Энергия и базовые ресурсы',
    description: 'Привычки, которые заряжают тело...',
    emoji: '🩵',
    nextLevelId: 'lvl2',
  },
  // ... 6 других уровней
];
```

**Что содержит:** 7 уровней с правилами разблокировки

---

### **3. Progress (Прогресс)**
**Файл:** `apps/web/src/features/habits/data/progress.mock.ts`

```typescript
export const PROGRESS: Progress = {
  completionByDate: {},
  habitStreak: {
    'h-water': 18,    // 18 дней подряд
    'h-bed': 12,
    'h-stretch': 9,
    // ...
  },
  levelUnlockedAt: {
    lvl1: '2025-09-01',
    lvl2: undefined,  // Еще не разблокирован
    // ...
  },
};
```

**Что содержит:** Текущий прогресс пользователя, стрики, разблокированные уровни

---

## 🎯 Как это работает вместе

### **Пример: Отображение привычки "Стакан воды"**

1. **Server Component** (`page.tsx`):
   ```typescript
   const habits = HABITS;    // h-water, h-bed, h-stretch, h-cold
   const progress = PROGRESS; // habitStreak['h-water'] = 18
   ```

2. **Client Component** (`DashboardClient.tsx`):
   ```typescript
   // Конвертация данных
   {
     id: 'h-water',
     name: 'Стакан воды после пробуждения',
     emoji: '💧',
     time: '07:00',  // из timeOfDay: 'morning'
     note: 'Запускает обмен веществ...',
     streak: 18,      // из progress.habitStreak['h-water']
   }
   ```

3. **UI отображает:**
   - 💧 **Стакан воды после пробуждения**
   - ⏰ 07:00
   - 🔥 **18 дней подряд**
   - 📝 Запускает обмен веществ...

---

## 🚀 Миграция на реальный API

Когда бэкенд будет готов, нужно только изменить `page.tsx`:

```typescript
// apps/web/app/(app)/dashboard/page.tsx

export default async function Page() {
  // Заменить моки на реальные API-вызовы
  const habits = await fetch('/api/habits').then(r => r.json());
  const levels = await fetch('/api/levels').then(r => r.json());
  const progress = await fetch('/api/progress').then(r => r.json());

  return (
    <DashboardClient 
      habits={habits}
      levels={levels}
      progress={progress}
    />
  );
}
```

**Клиентский компонент НЕ нужно менять!** 🎉

---

## ✅ Checklist правильности

- ✅ **3 источника данных** четко разделены
- ✅ **Server Component** получает данные (SSR)
- ✅ **Client Component** только рендерит UI
- ✅ **Типизация** через TypeScript
- ✅ **Моковые данные используются** (не хардкод в компонентах)
- ✅ **Легко мигрировать на API** (меняется только page.tsx)
- ✅ **Данные передаются через props** (React best practice)

---

## 🔧 Дополнительные улучшения (опционально)

### 1. **Динамический выбор уровня**
Сейчас показываются только привычки уровня 1. Можно добавить логику:

```typescript
const currentLevelId = useMemo(() => {
  // Определить текущий уровень на основе progress.levelUnlockedAt
  const unlockedLevels = Object.entries(progress.levelUnlockedAt)
    .filter(([_, date]) => date !== undefined)
    .map(([id]) => id);
  
  return unlockedLevels[unlockedLevels.length - 1] || 'lvl1';
}, [progress]);
```

### 2. **Использовать данные о текущем дне**
Добавить фильтрацию привычек по дням недели:

```typescript
const todayHabits = habits.filter(h => {
  const today = new Date().toLocaleDateString('en', { weekday: 'short' }).toLowerCase();
  return h.days.includes('daily') || h.days.includes(today);
});
```

### 3. **Интеграция с artifacts**
Показывать разблокированные артефакты на основе прогресса:

```typescript
import { ARTIFACTS } from '@/features/habits/data/artifacts.mock';

const unlockedArtifacts = ARTIFACTS.filter(artifact => {
  if (artifact.unlock.type === 'habit_stage') {
    const currentStreak = progress.habitStreak[artifact.unlock.habitId];
    return currentStreak >= artifact.unlock.days;
  }
  // ... логика для level_progress
});
```

---

## 📝 Резюме

**✅ Архитектура корректна!**

Вы правильно разделили:
1. **Источники данных** (habits, levels, progress)
2. **Server Component** (получение данных)
3. **Client Component** (UI и интерактивность)

Теперь:
- ✅ Моковые данные **используются**
- ✅ Легко **мигрировать на API**
- ✅ Следует **Next.js 13+ best practices**
- ✅ Типизировано через **TypeScript**

🎉 **Готово к разработке!**

