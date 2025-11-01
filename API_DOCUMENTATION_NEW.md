# Kvansum Backend API Documentation (Updated)

## Обзор

Backend API для приложения отслеживания привычек Kvansum с поддержкой системы уровней и прогрессии.

## Стек технологий

- **NestJS** - Framework
- **MongoDB + Mongoose** - База данных
- **Socket.IO** - Real-time уведомления
- **class-validator** - Валидация DTO
- **TypeScript** - Язык программирования

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Создайте файл `.env`:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/kvansum
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3. Запуск MongoDB

```bash
# С помощью Docker
docker-compose up -d

# Или локально
mongod
```

### 4. Заполнение базы данными (новая версия)

```bash
npm run seed:new
```

Это создаст:
- 1 тестового пользователя (ID: `test-user-1`)
- 7 уровней прогрессии (lvl1 - lvl7)
- 23 привычки, распределенные по уровням
- Прогресс пользователя с стриками
- 10 мыслей дня
- 3 артефакта

### 5. Запуск сервера

```bash
# Режим разработки
npm run dev

# Продакшн
npm run build
npm start
```

API будет доступен на `http://localhost:3001`

---

## API Endpoints

### Аутентификация

Все запросы (кроме `/health`) проходят через middleware, который добавляет `userId` в request.
В режиме разработки используется mock-аутентификация с `userId = "test-user-1"`.

---

## 📋 HABITS MODULE

### GET /api/habits
Получить все активные привычки текущего пользователя

**Response:**
```json
{
  "habits": [
    {
      "id": "...",
      "levelId": "lvl1",
      "title": "Стакан воды после пробуждения",
      "emoji": "💧",
      "imageUrl": null,
      "summary": "Запускает обмен веществ и помогает проснуться",
      "note": "Дополнительная заметка пользователя",
      "difficulty": "easy",
      "timeOfDay": "morning",
      "days": ["daily"],
      "stages": [
        {
          "days": 7,
          "title": "Первые ростки",
          "description": "Неделя дисциплины"
        },
        {
          "days": 21,
          "title": "Укрепление корней",
          "description": "Формирование устойчивой привычки"
        }
      ],
      "streak": 18,
      "bestStreak": 25,
      "totalDone": 45,
      "order": 0,
      "isActive": true,
      "createdAt": "2025-10-29T00:00:00.000Z",
      "time": "07:00",
      "period": "Утро"
    }
  ]
}
```

**Новые поля:**
- `levelId` - ID уровня (lvl1, lvl2, ..., lvl7)
- `title` - название привычки (вместо name)
- `summary` - краткое описание привычки
- `difficulty` - сложность: "easy" | "medium" | "hard"
- `timeOfDay` - время дня: "morning" | "day" | "evening" | "summary"
- `days` - массив дней: ["daily"] или ["mon", "wed", "fri"]
- `stages` - этапы развития привычки (каждый с days, title, description)

### POST /api/habits
Создать новую привычку

**Request Body:**
```json
{
  "title": "Медитация",
  "levelId": "lvl2",
  "emoji": "🧘",
  "summary": "10 минут утренней медитации",
  "difficulty": "easy",
  "timeOfDay": "morning",
  "days": ["daily"],
  "stages": [
    {
      "days": 7,
      "title": "Первые ростки",
      "description": "Неделя дисциплины"
    },
    {
      "days": 21,
      "title": "Укрепление корней",
      "description": "Формирование устойчивой привычки"
    }
  ]
}
```

**Validation:**
- `title` - обязательное, макс 100 символов
- `levelId` - обязательное, ID уровня
- `difficulty` - enum: "easy" | "medium" | "hard"
- `timeOfDay` - enum: "morning" | "day" | "evening" | "summary"
- `days` - массив строк, например ["daily"] или ["mon", "wed", "fri"]

### PATCH /api/habits/:id
Обновить привычку (частичное обновление)

### DELETE /api/habits/:id
Удалить (архивировать) привычку

### POST /api/habits/:id/log
Отметить выполнение привычки

**Request Body:**
```json
{
  "date": "2025-10-29",
  "status": "success",
  "note": "Отличная тренировка!"
}
```

### GET /api/habits/:id/logs
Получить историю выполнения привычки

---

## 🎯 LEVELS MODULE (NEW)

### GET /api/levels
Получить все уровни прогрессии

**Response:**
```json
{
  "levels": [
    {
      "id": "lvl1",
      "order": 1,
      "title": "Энергия и базовые ресурсы",
      "description": "Привычки, которые заряжают тело и создают основу для продуктивного дня",
      "emoji": "🩵",
      "nextLevelId": "lvl2"
    },
    {
      "id": "lvl2",
      "order": 2,
      "title": "Фокус и внимание",
      "description": "Собираем внимание и планируем день осознанно.",
      "emoji": "🧠",
      "nextLevelId": "lvl3",
      "unlockAfterDays": 21
    }
  ]
}
```

**Структура уровней:**
1. **lvl1** 🩵 - Энергия и базовые ресурсы
2. **lvl2** 🧠 - Фокус и внимание
3. **lvl3** 🔥 - Сила воли и дисциплина
4. **lvl4** 🌿 - Эмоциональный интеллект
5. **lvl5** ⚙️ - Продуктивность и результаты
6. **lvl6** 🚀 - Творчество и рост
7. **lvl7** 🧩 - Архитектор жизни

---

## 📊 PROGRESS MODULE (NEW)

### GET /api/progress
Получить прогресс пользователя

**Response:**
```json
{
  "completionByDate": {
    "2025-10-29": {
      "h-water": "success",
      "h-bed": "success",
      "h-stretch": "fail"
    }
  },
  "habitStreak": {
    "h-water": 18,
    "h-bed": 12,
    "h-stretch": 9,
    "h-cold": 4
  },
  "levelUnlockedAt": {
    "lvl1": "2025-09-01",
    "lvl2": undefined,
    "lvl3": undefined
  }
}
```

**Поля:**
- `completionByDate` - статусы выполнения привычек по датам
- `habitStreak` - количество дней подряд для каждой привычки
- `levelUnlockedAt` - даты разблокировки уровней (undefined = заблокирован)

---

## 📊 STATS MODULE

### GET /api/stats/dashboard
Статистика для главной страницы (сегодня + 7 дней)

**Response:**
```json
{
  "today": {
    "date": "2025-10-29",
    "total": 3,
    "completed": 2,
    "pending": 1,
    "percent": 67
  },
  "last7Days": [
    {
      "date": "2025-10-23",
      "total": 3,
      "completed": 2,
      "percent": 67
    }
  ],
  "userStats": {
    "totalPoints": 450,
    "currentLevel": 5,
    "currentRank": "active",
    "currentStreak": 7,
    "longestStreak": 12
  }
}
```

### GET /api/stats/weekly
Детальная статистика за неделю

### GET /api/stats/rank
Прогресс ранга и уровня

---

## 👤 USERS MODULE

### GET /api/users/me
Получить данные текущего пользователя

### PATCH /api/users/me
Обновить профиль

### POST /api/users/export
Экспорт всех данных пользователя (GDPR)

---

## 💭 THOUGHTS MODULE

### GET /api/thoughts/today
Мысль дня (детерминированная по дате)

### GET /api/thoughts
Список всех мыслей (admin)

### POST /api/thoughts
Создать мысль (admin)

---

## 🎨 ARTEFACTS MODULE

### GET /api/artefacts
Список активных артефактов

**Response:**
```json
{
  "artefacts": [
    {
      "id": "art-water-7",
      "title": "Почему важно пить воду утром",
      "body": "Гидратация запускает обмен веществ и делает мозг яснее без кофеина.",
      "unlock": {
        "type": "habit_stage",
        "habitId": "h-water",
        "days": 7
      }
    },
    {
      "id": "art-level1",
      "title": "Готов к «Фокусу и вниманию»",
      "body": "Ты выстроил фундамент энергии — теперь переходи к управлению вниманием и задачами.",
      "unlock": {
        "type": "level_progress",
        "levelId": "lvl1",
        "threshold": 0.3
      }
    }
  ]
}
```

**Типы unlock:**
- `habit_stage` - разблокируется при достижении определённого количества дней привычки
- `level_progress` - разблокируется при достижении прогресса на уровне (threshold - процент от 0 до 1)

### POST /api/artefacts
Создать артефакт (admin)

**Request Body:**
```json
{
  "id": "art-custom-1",
  "title": "Название артефакта",
  "body": "Подробное описание артефакта",
  "unlock": {
    "type": "habit_stage",
    "habitId": "h-water",
    "days": 21
  }
}
```

---

## 🔌 WEBSOCKET EVENTS

Подключение: `ws://localhost:3001`

### События от сервера:

**habit:created**, **habit:updated**, **habit:completed**, **habit:deleted**

---

## 🗄️ MongoDB Схемы

### Level (NEW)
```typescript
{
  id: string;              // 'lvl1', 'lvl2', etc.
  order: number;           // Порядковый номер
  title: string;           // Название уровня
  description: string;     // Описание
  emoji: string;           // Emoji уровня
  nextLevelId?: string;    // ID следующего уровня
  unlockAfterDays?: number;// Дней для разблокировки (с предыдущего уровня)
}
```

### Habit (UPDATED)
```typescript
{
  _id: string;
  userId: ObjectId;
  levelId: string;              // NEW: ID уровня
  title: string;                // NEW: было name
  emoji?: string;
  imageUrl?: string;
  summary?: string;             // NEW: краткое описание
  note?: string;                // Заметка пользователя
  difficulty?: string;          // NEW: 'easy' | 'medium' | 'hard'
  timeOfDay?: string;           // NEW: 'morning' | 'day' | 'evening' | 'summary'
  days: string[];               // NEW: ['daily'] или ['mon', 'wed']
  stages: Array<{               // NEW: этапы привычки
    days: number;
    title: string;
    description: string;
  }>;
  streak: number;
  bestStreak: number;
  totalDone: number;
  order: number;
  isActive: boolean;
  isArchived: boolean;
  // Старые поля для обратной совместимости
  time?: string;
  period?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserProgress (NEW)
```typescript
{
  _id: string;
  userId: ObjectId;
  completionByDate: Map<string, Record<string, string>>;  // Дата -> {habitId: status}
  habitStreak: Map<string, number>;                        // habitId -> streak
  levelUnlockedAt: Map<string, string | undefined>;       // levelId -> дата разблокировки
}
```

### Artefact (UPDATED)
```typescript
{
  _id: string;
  id: string;              // Уникальный идентификатор артефакта
  title: string;           // Название
  body: string;            // Подробное описание/контент
  unlock: {                // Условия разблокировки
    type: 'habit_stage' | 'level_progress';
    // Для habit_stage:
    habitId?: string;
    days?: number;
    // Для level_progress:
    levelId?: string;
    threshold?: number;    // 0.0 - 1.0
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🧪 Тестирование API

### С помощью curl

```bash
# Health check
curl http://localhost:3001/health

# Получить привычки
curl http://localhost:3001/api/habits

# Получить уровни
curl http://localhost:3001/api/levels

# Получить прогресс
curl http://localhost:3001/api/progress

# Создать привычку
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Медитация",
    "levelId": "lvl2",
    "emoji": "🧘",
    "summary": "10 минут утренней медитации",
    "difficulty": "easy",
    "timeOfDay": "morning",
    "days": ["daily"]
  }'
```

---

## 🔄 Миграция с старой структуры

### Что изменилось:

1. **Habits:**
   - `name` → `title`
   - `note` → `summary` (описание привычки)
   - Добавлены: `levelId`, `days`, `stages`, `timeOfDay`
   - `difficulty`: "Легкая"/"Средняя"/"Сложная" → "easy"/"medium"/"hard"
   - `period`: "Утро"/"День"/"Вечер" → `timeOfDay`: "morning"/"day"/"evening"/"summary"

2. **Новые модули:**
   - `LevelsModule` - управление уровнями
   - `ProgressController` - прогресс пользователя

3. **Новые endpoints:**
   - `GET /api/levels` - получить все уровни
   - `GET /api/progress` - получить прогресс пользователя

### Обратная совместимость

Старые поля сохранены для обратной совместимости:
- `time` (вместо timeOfDay с конкретным временем)
- `period` (старый формат периода дня)
- `name` (возвращается как `title` в старых клиентах)

---

## 📝 Seed данные

Запустите `npm run seed:new` для создания:

### 23 привычки по 7 уровням:

**Уровень 1 (🩵 Энергия):**
- 💧 Стакан воды после пробуждения
- 🛏️ Заправить постель
- 🧘 Разминка 5-10 минут
- ❄️ Контрастный душ

**Уровень 2 (🧠 Фокус):**
- 🧘‍♂️ Медитация 10 минут
- 📵 Не проверять телефон 1 час
- 🎯 Глубокая работа 90 минут
- 📚 Чтение 20 страниц

**Уровень 3 (🔥 Дисциплина):**
- 💪 Тренировка 30 минут
- 🚫 День без сахара
- 📝 План на завтра вечером

**Уровень 4 (🌿 Эмоции):**
- 🙏 3 благодарности
- 📔 Дневник эмоций
- 💝 Доброе дело

**Уровень 5 (⚙️ Продуктивность):**
- 🎯 Most Important Task с утра
- 📥 Inbox Zero вечером
- 📊 Еженедельный обзор

**Уровень 6 (🚀 Рост):**
- 🎓 Обучение 30 минут
- 🎨 Творческая практика
- 💡 10 идей в день

**Уровень 7 (🧩 Архитектор):**
- ⚙️ Улучшение системы
- 🤔 Глубокая рефлексия
- 🌟 Работа с видением

---

## 🚀 Интеграция с фронтендом

Фронтенд ожидает следующую структуру данных:

```typescript
// 3 источника данных
const habits = await fetch('/api/habits').then(r => r.json());
const levels = await fetch('/api/levels').then(r => r.json());
const progress = await fetch('/api/progress').then(r => r.json());

// Использование в компоненте
<DashboardClient 
  habits={habits}
  levels={levels}
  progress={progress}
/>
```

---

## 📚 Дополнительные ресурсы

- Документация фронтенда: `docs/docs-from-frontend/`
- Старая документация: `API_DOCUMENTATION.md`
- Changelog: `CHANGELOG.md`

---

**Версия:** 2.0.0  
**Дата:** 1 ноября 2025

