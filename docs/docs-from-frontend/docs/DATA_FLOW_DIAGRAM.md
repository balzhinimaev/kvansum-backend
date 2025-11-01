# 🔄 Диаграмма потока данных

## До исправления ❌

```
┌─────────────────────────────┐
│  DashboardClient.tsx        │
│  const HABITS = [           │
│    { id: 'h1', ... },       │ ← ХАРДКОД прямо в компоненте
│    { id: 'h2', ... },       │
│  ];                         │
└─────────────────────────────┘

┌─────────────────────────────┐
│  habits.mock.ts             │
│  export const HABITS = [...] │ ← НЕ используется!
└─────────────────────────────┘
```

**Проблемы:**
- ❌ Моковые данные не используются
- ❌ Невозможно заменить на API
- ❌ Дублирование данных
- ❌ Нарушение принципа разделения ответственности

---

## После исправления ✅

```
┌──────────────────────────────────────────────┐
│  page.tsx (Server Component)                 │
│                                              │
│  import { HABITS } from '...habits.mock'    │
│  import { LEVELS } from '...levels.mock'    │
│  import { PROGRESS } from '...progress.mock'│
│                                              │
│  export default function Page() {            │
│    const habits = HABITS;    ──┐            │
│    const levels = LEVELS;      ├─ 3 источника
│    const progress = PROGRESS;  ─┘            │
│                                              │
│    return <DashboardClient                   │
│      habits={habits}                         │
│      levels={levels}                         │
│      progress={progress}                     │
│    />;                                       │
│  }                                           │
└───────────────────┬──────────────────────────┘
                    │
                    │ Props передаются вниз
                    ↓
┌──────────────────────────────────────────────┐
│  DashboardClient.tsx (Client Component)      │
│                                              │
│  interface Props {                           │
│    habits: Habit[];                          │
│    levels: Level[];                          │
│    progress: Progress;                       │
│  }                                           │
│                                              │
│  export default function DashboardClient(    │
│    { habits, levels, progress }             │
│  ) {                                         │
│    // Конвертация данных                    │
│    const habitCards = habits.map(...)        │
│                                              │
│    // Фильтрация по уровню                  │
│    .filter(h => h.levelId === 'lvl1')       │
│                                              │
│    // UI рендеринг                           │
│    return <div>...</div>;                    │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

## 🎯 Ключевые изменения

### **1. Источники данных теперь используются**

```typescript
// apps/web/src/features/habits/data/

habits.mock.ts    → 23 привычки (7 уровней)
levels.mock.ts    → 7 уровней прогрессии
progress.mock.ts  → Прогресс пользователя (стрики, разблокировки)
artifacts.mock.ts → Артефакты (награды)
```

### **2. Разделение Server / Client**

| Server Component | Client Component |
|------------------|------------------|
| `page.tsx` | `DashboardClient.tsx` |
| Получает данные | Принимает props |
| SSR (серверный рендеринг) | Интерактивность |
| Может использовать `await` | Использует `useState` |
| Не имеет состояния | Управляет UI состоянием |

### **3. Поток данных**

```
[Моки / API] 
    ↓
[Server Component: page.tsx]
    ↓ props
[Client Component: DashboardClient.tsx]
    ↓ конвертация
[UI Components: SwipeDeckCard, ProgressBar, ...]
```

---

## 🔧 Как работает конвертация данных

### **Входные данные (из API/моков):**

```typescript
// Habit из types.ts
{
  id: 'h-water',
  levelId: 'lvl1',
  title: 'Стакан воды после пробуждения',
  difficulty: 'easy',
  timeOfDay: 'morning',
  days: ['daily'],
  emoji: '💧',
  summary: 'Запускает обмен веществ...',
  stages: [...]
}

// Progress
{
  habitStreak: {
    'h-water': 18,  // 18 дней подряд
  }
}
```

### **Выходные данные (для UI):**

```typescript
// HabitCard для SwipeDeckCard
{
  id: 'h-water',
  name: 'Стакан воды после пробуждения',
  emoji: '💧',
  time: '07:00',        // ← конвертировано из timeOfDay
  note: 'Запускает обмен веществ...',
  streak: 18,           // ← из progress.habitStreak
}
```

### **Функция конвертации:**

```typescript
function convertToHabitCard(habit: Habit, progress: Progress): HabitCard {
  return {
    id: habit.id,
    name: habit.title,
    emoji: habit.emoji,
    time: extractTimeFromHabit(habit),  // morning → 07:00
    note: habit.summary,
    streak: progress.habitStreak[habit.id] || 0,
  };
}

function extractTimeFromHabit(habit: Habit): string {
  const timeMap = {
    'morning': '07:00',
    'day': '12:00',
    'evening': '18:00',
    'summary': '21:00',
  };
  return timeMap[habit.timeOfDay];
}
```

---

## 📊 Пример полного цикла данных

### **Шаг 1: Server получает данные**

```typescript
// page.tsx
const habits = HABITS;   // 23 привычки
const progress = PROGRESS; // стрики
```

### **Шаг 2: Фильтрация по уровню**

```typescript
// DashboardClient.tsx
const currentLevelHabits = habits.filter(h => h.levelId === 'lvl1');
// Результат: 4 привычки (h-water, h-bed, h-stretch, h-cold)
```

### **Шаг 3: Конвертация в UI формат**

```typescript
const habitCards = currentLevelHabits.map(h => 
  convertToHabitCard(h, progress)
);
// Результат:
// [
//   { id: 'h-water', name: 'Стакан воды...', streak: 18, time: '07:00' },
//   { id: 'h-bed', name: 'Заправить постель', streak: 12, time: '07:00' },
//   { id: 'h-stretch', name: 'Разминка 5-10 минут', streak: 9, time: '07:00' },
//   { id: 'h-cold', name: 'Контрастный душ', streak: 4, time: '07:00' },
// ]
```

### **Шаг 4: Сортировка по времени**

```typescript
const sortedHabits = habitCards.sort((a, b) => 
  timeToNum(a.time) - timeToNum(b.time)
);
```

### **Шаг 5: Рендеринг UI**

```typescript
return (
  <>
    <ProgressBar value={doneCount} max={total} />
    <SwipeDeckCard habit={sortedHabits[activeIndex]} />
  </>
);
```

---

## 🚀 Миграция на API (в будущем)

### **Текущий код (моки):**

```typescript
// page.tsx
import { HABITS } from '@/features/habits/data/habits.mock';
import { LEVELS } from '@/features/habits/data/levels.mock';
import { PROGRESS } from '@/features/habits/data/progress.mock';

export default function Page() {
  const habits = HABITS;
  const levels = LEVELS;
  const progress = PROGRESS;
  
  return <DashboardClient {...} />;
}
```

### **Будущий код (API):**

```typescript
// page.tsx
export default async function Page() {
  // Просто меняем источник данных!
  const habits = await fetch('/api/habits').then(r => r.json());
  const levels = await fetch('/api/levels').then(r => r.json());
  const progress = await fetch('/api/progress').then(r => r.json());
  
  // Компонент остается тот же!
  return <DashboardClient 
    habits={habits}
    levels={levels}
    progress={progress}
  />;
}
```

**DashboardClient.tsx НЕ меняется!** ✅

---

## ✅ Преимущества текущей архитектуры

1. **Разделение ответственности**
   - Server: получение данных
   - Client: UI и интерактивность

2. **Типобезопасность**
   - TypeScript проверяет типы на всех этапах
   - `Habit` (сервер) → `HabitCard` (UI)

3. **Переиспользуемость**
   - Функция `convertToHabitCard` может использоваться в других местах
   - Моковые данные легко заменить на API

4. **Производительность**
   - SSR: данные рендерятся на сервере
   - Client: только интерактивность (useState, onClick)

5. **Тестируемость**
   - Легко мокировать пропсы в тестах
   - Можно тестировать конвертацию отдельно

---

## 🎯 Итоговая схема

```
┌─────────────────────────────────────────────────────┐
│              DATA SOURCES (3 источника)             │
├─────────────────────────────────────────────────────┤
│  habits.mock.ts  │  levels.mock.ts  │ progress.mock │
│     (23 шт)      │     (7 шт)       │   (стрики)    │
└──────────┬───────────────┬────────────────┬─────────┘
           │               │                │
           └───────────────┴────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────┐
│         SERVER COMPONENT (page.tsx)                 │
│                                                     │
│  - Получает данные (await fetch или import)         │
│  - SSR (Server-Side Rendering)                      │
│  - Не имеет состояния                               │
└──────────────────────┬──────────────────────────────┘
                       │ Props
                       ↓
┌─────────────────────────────────────────────────────┐
│       CLIENT COMPONENT (DashboardClient.tsx)        │
│                                                     │
│  1. Конвертация: Habit → HabitCard                  │
│  2. Фильтрация: по уровню (lvl1)                    │
│  3. Сортировка: по времени (07:00, 08:00...)        │
│  4. Состояние: useState (statuses, activeIndex)     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│              UI COMPONENTS                          │
│                                                     │
│  SwipeDeckCard │ ProgressBar │ SwipeListItem        │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Быстрая проверка

### ✅ Что работает правильно:

- [x] 3 источника данных используются
- [x] Server/Client разделение корректно
- [x] Типизация через TypeScript
- [x] Конвертация данных реализована
- [x] Фильтрация по уровню работает
- [x] Streak берется из progress
- [x] Легко мигрировать на API

### 🔧 Что можно улучшить (опционально):

- [ ] Динамический выбор уровня (сейчас хардкод lvl1)
- [ ] Фильтрация по дням недели
- [ ] Интеграция с artifacts
- [ ] Добавить loading состояния для будущего API

---

**Итого:** Архитектура работает правильно! ✅

