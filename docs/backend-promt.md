## 1. HABITS MODULE (Модуль привычек)

### Prisma модели

```prisma
model User {
  id        String   @id @default(cuid())
  telegramId Int?    @unique
  username  String?
  firstName String?
  lastName  String?
  email     String?  @unique
  
  habits    Habit[]
  logs      HabitLog[]
  stats     UserStats?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Habit {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Основные поля
  name        String   // "Утренняя тренировка"
  emoji       String?  // "💪"
  imageUrl    String?  // URL картинки (опционально)
  note        String?  // "15 минут растяжки и зарядки"
  
  // Настройки
  time        String?  // "07:00" (HH:mm формат)
  difficulty  String?  // "Легкая" | "Средняя" | "Сложная"
  period      String?  // "Утро" | "День" | "Вечер" | "Итоги дня"
  
  // Статистика
  streak      Int      @default(0) // Текущая серия выполнений
  bestStreak  Int      @default(0) // Лучшая серия
  totalDone   Int      @default(0) // Всего выполнено
  
  // Порядок и состояние
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  isArchived  Boolean  @default(false)
  
  logs        HabitLog[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([userId, isActive])
}

model HabitLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  
  date      DateTime @db.Date // Дата выполнения (только дата, без времени)
  status    String   // "success" | "fail" | "pending" | "skipped"
  
  // Дополнительно
  note      String?  // Заметка пользователя
  points    Int      @default(0) // Начисленные очки
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([habitId, date])
  @@index([userId, date])
  @@index([habitId, date])
}

model UserStats {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Общая статистика
  totalPoints     Int      @default(0)
  currentLevel    Int      @default(1)
  currentRank     String   @default("beginner") // "beginner" | "observer" | "active" | "systemic" | "architect" | "scaling"
  
  // Серии
  longestStreak   Int      @default(0)
  currentStreak   Int      @default(0)
  
  // История
  totalHabits     Int      @default(0)
  completedToday  Int      @default(0)
  
  lastActivityAt  DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### API Endpoints

#### GET /api/habits
Получить все привычки текущего пользователя

**Response:**
```typescript
{
  habits: Array<{
    id: string;
    name: string;
    emoji?: string;
    imageUrl?: string;
    note?: string;
    time?: string;
    difficulty?: string;
    period?: string;
    streak: number;
    bestStreak: number;
    totalDone: number;
    order: number;
    isActive: boolean;
    createdAt: string;
  }>;
}
```

#### POST /api/habits
Создать новую привычку

**Body:**
```typescript
{
  name: string;
  emoji?: string;
  imageUrl?: string;
  note?: string;
  time?: string; // "HH:mm"
  difficulty?: "Легкая" | "Средняя" | "Сложная";
  period?: "Утро" | "День" | "Вечер" | "Итоги дня";
}
```

**Response:** созданная привычка

#### PATCH /api/habits/:id
Обновить привычку

**Body:** частичное обновление (любые поля из POST)

**Response:** обновленная привычка

#### DELETE /api/habits/:id
Удалить привычку (жесткое удаление или архивация)

**Response:** `{ success: true }`

#### POST /api/habits/:id/log
Отметить выполнение привычки

**Body:**
```typescript
{
  date: string; // YYYY-MM-DD
  status: "success" | "fail" | "pending" | "skipped";
  note?: string;
}
```

**Response:**
```typescript
{
  log: HabitLog;
  habit: { 
    streak: number; 
    totalDone: number; 
  };
  pointsEarned: number;
}
```

**Логика:**
- Если `status === "success"` → увеличить `streak` и `totalDone`
- Если `status === "fail"` → сбросить `streak` в 0
- Обновить `bestStreak`, если текущий больше
- Начислить очки пользователю (от 10 до 50 в зависимости от сложности и серии)

#### GET /api/habits/:id/logs
Получить историю выполнения привычки

**Query:**
- `from?: string` (YYYY-MM-DD)
- `to?: string` (YYYY-MM-DD)
- `limit?: number`

**Response:**
```typescript
{
  logs: Array<{
    id: string;
    date: string;
    status: string;
    note?: string;
    points: number;
    createdAt: string;
  }>;
}
```

---

## 2. STATS MODULE (Модуль статистики)

### API Endpoints

#### GET /api/stats/dashboard
Статистика для главной страницы (сегодня + 7 дней)

**Response:**
```typescript
{
  today: {
    date: string; // YYYY-MM-DD
    total: number; // Всего привычек
    completed: number; // Выполнено
    pending: number; // Не выполнено
    percent: number; // 0-100
  };
  
  last7Days: Array<{
    date: string; // YYYY-MM-DD
    total: number;
    completed: number;
    percent: number;
  }>;
  
  userStats: {
    totalPoints: number;
    currentLevel: number;
    currentRank: string;
    currentStreak: number;
    longestStreak: number;
  };
}
```

#### GET /api/stats/weekly
Детальная статистика за неделю

**Query:**
- `week?: string` (YYYY-MM-DD — понедельник недели)

**Response:**
```typescript
{
  week: string;
  days: Array<{
    date: string;
    dayOfWeek: string; // "Пн", "Вт", ...
    habits: Array<{
      habitId: string;
      name: string;
      emoji?: string;
      status: string;
      points: number;
    }>;
    totalCompleted: number;
    totalPoints: number;
    percent: number;
  }>;
  weekTotal: {
    completed: number;
    total: number;
    points: number;
    averagePercent: number;
  };
}
```

#### GET /api/stats/rank
Прогресс ранга и уровня

**Response:**
```typescript
{
  currentRank: string;
  currentLevel: number;
  totalPoints: number;
  nextRank: {
    name: string;
    requiredPoints: number;
    progress: number; // 0-100
  };
  ranks: Array<{
    name: string;
    minPoints: number;
    unlocked: boolean;
  }>;
}
```

**Ранги (система уровней):**
- `beginner` (Начинающий): 0-99 очков
- `observer` (Наблюдатель): 100-499
- `active` (Активный): 500-1499
- `systemic` (Системный): 1500-3999
- `architect` (Архитектор): 4000-9999
- `scaling` (Масштабирующий): 10000+

---

## 3. USERS MODULE (Модуль пользователей)

### API Endpoints

#### GET /api/users/me
Получить данные текущего пользователя

**Response:**
```typescript
{
  user: {
    id: string;
    username?: string;
    firstName?: string;
    email?: string;
    createdAt: string;
  };
  stats: {
    totalPoints: number;
    currentLevel: number;
    currentRank: string;
    totalHabits: number;
    currentStreak: number;
  };
}
```

#### PATCH /api/users/me
Обновить профиль

**Body:**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}
```

#### POST /api/users/export
Экспорт всех данных пользователя (GDPR)

**Response:** JSON с всеми данными пользователя

---

## 4. THOUGHTS (Мысли дня)

### Prisma модель

```prisma
model Thought {
  id        String   @id @default(cuid())
  quote     String   // Текст цитаты
  author    String?  // Автор
  isActive  Boolean  @default(true)
  order     Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([isActive])
}
```

### API Endpoints

#### GET /api/thoughts/today
Мысль дня (детерминированная по дате)

**Response:**
```typescript
{
  thought: {
    id: string;
    quote: string;
    author?: string;
  };
}
```

#### GET /api/thoughts (admin)
Список всех мыслей

#### POST /api/thoughts (admin)
Создать мысль

---

## 5. ARTEFACTS (Артефакты развития)

### Prisma модель

```prisma
model Artefact {
  id          String   @id @default(cuid())
  title       String   // "Дневник успехов"
  emoji       String?  // "📓"
  description String?
  tag         String?  // "рефлексия" | "трекер" | "диагностика"
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Endpoints

#### GET /api/artefacts
Список активных артефактов

**Response:**
```typescript
{
  artefacts: Array<{
    id: string;
    title: string;
    emoji?: string;
    tag?: string;
    description?: string;
  }>;
}
```

---

## 6. AUTH MODULE (опционально, можно сделать заглушку)

Если хочешь, можешь реализовать базовую авторизацию:
- Mock-аутентификация (всегда возвращает `userId: "test-user-1"`)
- Или интеграция с Telegram Mini App (через `window.Telegram.WebApp.initDataUnsafe`)

### Middleware для всех запросов:

```typescript
// Создай middleware для user context
@Injectable()
export class UserMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    // Mock для разработки
    req.user = { userId: 'test-user-1' };
    next();
  }
}
```

Применить ко всем модулям кроме `/health`.

---

## Дополнительные требования

### 1. Seed данные

Создай файл `prisma/seed.ts`:
- 1 тестовый пользователь (`test-user-1`)
- 3 привычки (как в моках фронтенда)
- 7 дней логов с разными процентами выполнения
- 200 цитат из `/apps/web/public/thoughts.txt`
- 3 артефакта

### 2. Prisma команды в package.json

```json
{
  "scripts": {
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:studio": "prisma studio"
  }
}
```

### 3. Валидация

Используй `class-validator` и `class-transformer` для DTO:
- Все обязательные поля должны валидироваться
- Форматы времени: `HH:mm`
- Даты: `YYYY-MM-DD`

### 4. Обработка ошибок

- 404 если привычка не найдена или не принадлежит пользователю
- 400 для некорректных данных
- 500 для внутренних ошибок

### 5. Документация Swagger (опционально)

Если успеешь — добавь Swagger документацию через `@nestjs/swagger`.

---

## Структура модуля (пример для Habits)

```
apps/api/src/modules/habits/
├── dto/
│   ├── create-habit.dto.ts
│   ├── update-habit.dto.ts
│   ├── habit-log.dto.ts
│   └── habit-response.dto.ts
├── habits.controller.ts
├── habits.service.ts
├── habits.module.ts
└── habits.types.ts
```

---

## Миграции

1. Запусти `pnpm prisma migrate dev --name init` после создания schema.prisma
2. Запусти `pnpm prisma:seed` для заполнения базы тестовыми данными
3. Проверь Prisma Studio: `pnpm prisma:studio`

---

## Проверка работы API

После реализации проверь через curl или Postman:

```bash
# Health check
curl http://localhost:3001/health

# Получить привычки
curl http://localhost:3001/api/habits

# Создать привычку
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Зарядка","emoji":"💪","time":"07:00"}'

# Отметить выполнение
curl -X POST http://localhost:3001/api/habits/HABIT_ID/log \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-29","status":"success"}'

# Статистика за 7 дней
curl http://localhost:3001/api/stats/dashboard
```

---

## Важные нюансы

1. **Часовой пояс:** Все даты храни в UTC, конвертируй на фронтенде
2. **Streak логика:** Серия сбрасывается только при `status: "fail"`, `pending` не влияет
3. **Очки:** Формула начисления:
   - Базовые очки: 10 (легкая), 20 (средняя), 30 (сложная)
   - Бонус за серию: `+streak * 2` (максимум +50)
4. **Производительность:** Используй индексы в Prisma для полей `userId`, `date`, `habitId`
5. **Транзакции:** При логировании привычки обнови и `Habit`, и `UserStats` в одной транзакции

---

## Что должно получиться

После реализации фронтенд сможет:
1. ✅ Загружать реальные привычки вместо моков
2. ✅ Создавать/редактировать/удалять привычки
3. ✅ Отмечать выполнение с обновлением статистики
4. ✅ Видеть реальную статистику за 7 дней
5. ✅ Отслеживать прогресс рангов и очков
6. ✅ Получать мысль дня из базы

---

## Порядок реализации (рекомендуемый)

1. **Prisma Schema** → миграция → seed
2. **Users Module** → базовая структура + middleware
3. **Habits Module** → CRUD + логирование
4. **Stats Module** → агрегация данных
5. **Thoughts & Artefacts** → простые справочники
6. **Тестирование** → curl/Postman
7. **Интеграция с фронтендом** → заменить моки на API calls

---

## Дополнительно (если будет время)

- WebSocket для real-time обновлений
- Redis для кеширования статистики
- Rate limiting через `@nestjs/throttler`
- Логирование через Winston
- Telegram Bot интеграция для напоминаний

---

Удачи! 🚀

