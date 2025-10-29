# Kvansum Backend API Documentation

## Обзор

Backend API для приложения отслеживания привычек Kvansum, построенный на NestJS с использованием MongoDB и WebSocket.

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

### 4. Заполнение базы тестовыми данными

```bash
npm run seed
```

Это создаст:
- 1 тестового пользователя (ID: `test-user-1`)
- 3 привычки с различными настройками
- Логи за последние 7 дней
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
      "name": "Утренняя зарядка",
      "emoji": "💪",
      "imageUrl": null,
      "note": "15 минут растяжки",
      "time": "07:00",
      "difficulty": "Средняя",
      "period": "Утро",
      "streak": 7,
      "bestStreak": 12,
      "totalDone": 45,
      "order": 0,
      "isActive": true,
      "createdAt": "2025-10-29T00:00:00.000Z"
    }
  ]
}
```

### POST /api/habits
Создать новую привычку

**Request Body:**
```json
{
  "name": "Зарядка",
  "emoji": "💪",
  "note": "15 минут",
  "time": "07:00",
  "difficulty": "Средняя",
  "period": "Утро"
}
```

**Validation:**
- `name` - обязательное, макс 100 символов
- `time` - формат HH:mm (например, "07:00")
- `difficulty` - enum: "Легкая" | "Средняя" | "Сложная"
- `period` - enum: "Утро" | "День" | "Вечер" | "Итоги дня"

### PATCH /api/habits/:id
Обновить привычку

**Request Body:** частичное обновление (любые поля из POST)

### DELETE /api/habits/:id
Удалить (архивировать) привычку

**Response:**
```json
{ "success": true }
```

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

**Validation:**
- `date` - формат YYYY-MM-DD
- `status` - enum: "success" | "fail" | "pending" | "skipped"

**Response:**
```json
{
  "log": {
    "id": "...",
    "date": "2025-10-29",
    "status": "success",
    "note": "Отличная тренировка!",
    "points": 34,
    "createdAt": "2025-10-29T00:00:00.000Z"
  },
  "habit": {
    "streak": 8,
    "totalDone": 46
  },
  "pointsEarned": 34
}
```

**Логика начисления очков:**
- Базовые очки: 10 (легкая), 20 (средняя), 30 (сложная)
- Бонус за серию: +streak × 2 (максимум +50)
- Серия сбрасывается только при `status: "fail"`

### GET /api/habits/:id/logs
Получить историю выполнения привычки

**Query параметры:**
- `from` - дата от (YYYY-MM-DD)
- `to` - дата до (YYYY-MM-DD)
- `limit` - количество записей

**Response:**
```json
{
  "logs": [
    {
      "id": "...",
      "date": "2025-10-29",
      "status": "success",
      "note": "",
      "points": 34,
      "createdAt": "2025-10-29T00:00:00.000Z"
    }
  ]
}
```

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

**Query параметры:**
- `week` - понедельник недели (YYYY-MM-DD), опционально

**Response:**
```json
{
  "week": "2025-10-27",
  "days": [
    {
      "date": "2025-10-27",
      "dayOfWeek": "Пн",
      "habits": [
        {
          "habitId": "...",
          "name": "Зарядка",
          "emoji": "💪",
          "status": "success",
          "points": 34
        }
      ],
      "totalCompleted": 2,
      "totalPoints": 64,
      "percent": 67
    }
  ],
  "weekTotal": {
    "completed": 15,
    "total": 21,
    "points": 450,
    "averagePercent": 71
  }
}
```

### GET /api/stats/rank
Прогресс ранга и уровня

**Response:**
```json
{
  "currentRank": "active",
  "currentLevel": 5,
  "totalPoints": 450,
  "nextRank": {
    "name": "Системный",
    "requiredPoints": 1500,
    "progress": 30
  },
  "ranks": [
    {
      "name": "Начинающий",
      "minPoints": 0,
      "unlocked": true
    },
    {
      "name": "Наблюдатель",
      "minPoints": 100,
      "unlocked": true
    },
    {
      "name": "Активный",
      "minPoints": 500,
      "unlocked": false
    }
  ]
}
```

**Система рангов:**
- Начинающий: 0-99 очков
- Наблюдатель: 100-499
- Активный: 500-1499
- Системный: 1500-3999
- Архитектор: 4000-9999
- Масштабирующий: 10000+

---

## 👤 USERS MODULE

### GET /api/users/me
Получить данные текущего пользователя

**Response:**
```json
{
  "user": {
    "id": "test-user-1",
    "username": "test_user",
    "firstName": "Тестовый",
    "email": "test@example.com",
    "createdAt": "2025-10-29T00:00:00.000Z"
  },
  "stats": {
    "totalPoints": 450,
    "currentLevel": 5,
    "currentRank": "active",
    "totalHabits": 3,
    "currentStreak": 7
  }
}
```

### PATCH /api/users/me
Обновить профиль

**Request Body:**
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "ivan@example.com",
  "username": "ivan_ivanov"
}
```

### POST /api/users/export
Экспорт всех данных пользователя (GDPR)

**Response:**
```json
{
  "user": { ... },
  "stats": { ... },
  "habits": [ ... ],
  "exportedAt": "2025-10-29T12:00:00.000Z"
}
```

---

## 💭 THOUGHTS MODULE

### GET /api/thoughts/today
Мысль дня (детерминированная по дате)

**Response:**
```json
{
  "thought": {
    "id": "...",
    "quote": "Привычки — это сложные проценты самосовершенствования.",
    "author": "Джеймс Клир"
  }
}
```

### GET /api/thoughts
Список всех мыслей (admin)

### POST /api/thoughts
Создать мысль (admin)

**Request Body:**
```json
{
  "quote": "Новая мысль",
  "author": "Автор"
}
```

---

## 🎨 ARTEFACTS MODULE

### GET /api/artefacts
Список активных артефактов

**Response:**
```json
{
  "artefacts": [
    {
      "id": "...",
      "title": "Дневник успехов",
      "emoji": "📓",
      "tag": "рефлексия",
      "description": "Записывайте свои достижения"
    }
  ]
}
```

### POST /api/artefacts
Создать артефакт (admin)

---

## 🔌 WEBSOCKET EVENTS

Подключение: `ws://localhost:3001`

### События от сервера:

**habit:created**
```json
{
  "habitId": "...",
  "userId": "...",
  "name": "Новая привычка",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

**habit:updated**
```json
{
  "habitId": "...",
  "userId": "...",
  "changes": { ... },
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

**habit:completed**
```json
{
  "habitId": "...",
  "userId": "...",
  "status": "success",
  "streak": 8,
  "pointsEarned": 34,
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

**habit:deleted**
```json
{
  "habitId": "...",
  "userId": "...",
  "timestamp": "2025-10-29T12:00:00.000Z"
}
```

---

## 🗄️ MongoDB Схемы

### User
```typescript
{
  _id: string;
  telegramId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Habit
```typescript
{
  _id: string;
  userId: ObjectId;
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
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### HabitLog
```typescript
{
  _id: string;
  userId: ObjectId;
  habitId: ObjectId;
  date: Date;
  status: string;
  note?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserStats
```typescript
{
  _id: string;
  userId: ObjectId;
  totalPoints: number;
  currentLevel: number;
  currentRank: string;
  longestStreak: number;
  currentStreak: number;
  totalHabits: number;
  completedToday: number;
  lastActivityAt: Date;
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

# Создать привычку
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Зарядка","emoji":"💪","time":"07:00","difficulty":"Средняя"}'

# Отметить выполнение
curl -X POST http://localhost:3001/api/habits/HABIT_ID/log \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-29","status":"success"}'

# Статистика
curl http://localhost:3001/api/stats/dashboard

# Мысль дня
curl http://localhost:3001/api/thoughts/today
```

---

## 📝 Валидация и обработка ошибок

### Глобальная валидация

Все DTO валидируются с помощью `class-validator`:
- `whitelist: true` - удаляет лишние поля
- `forbidNonWhitelisted: true` - возвращает ошибку при лишних полях
- `transform: true` - автоматически преобразует типы

### Коды ошибок

- **400 Bad Request** - Некорректные данные или валидация не прошла
- **404 Not Found** - Ресурс не найден или не принадлежит пользователю
- **500 Internal Server Error** - Внутренняя ошибка сервера

### Пример ответа с ошибкой

```json
{
  "statusCode": 400,
  "message": [
    "time must be in HH:mm format",
    "difficulty must be one of the following values: Легкая, Средняя, Сложная"
  ],
  "error": "Bad Request"
}
```

---

## 🚀 Развертывание

### Docker

```bash
# Сборка
docker build -t kvansum-api .

# Запуск
docker-compose up -d
```

### Environment Variables для Production

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://mongo:27017/kvansum
CORS_ORIGINS=https://yourdomain.com
```

---

## 📚 Дополнительно

### Структура проекта

```
src/
├── common/
│   ├── middleware/      # Middleware (auth)
│   ├── schemas/         # Mongoose схемы
│   └── websockets/      # WebSocket gateway
├── config/              # Конфигурация
├── modules/
│   ├── artefacts/       # Артефакты
│   ├── habits/          # Привычки
│   ├── health/          # Health check
│   ├── stats/           # Статистика
│   ├── thoughts/        # Мысли дня
│   └── users/           # Пользователи
├── app.module.ts
└── main.ts
```

### Индексы MongoDB

Для оптимизации производительности созданы индексы:
- `User`: telegramId, email
- `Habit`: userId, userId+isActive
- `HabitLog`: habitId+date (unique), userId+date
- `UserStats`: userId (unique)

### Улучшения для продакшена

- [ ] Добавить Swagger документацию
- [ ] Реализовать реальную аутентификацию через Telegram
- [ ] Добавить rate limiting
- [ ] Настроить логирование (Winston)
- [ ] Добавить кеширование (Redis)
- [ ] Добавить мониторинг (Prometheus)
- [ ] Написать E2E тесты

---

## 📞 Поддержка

При возникновении вопросов или проблем, создайте issue в репозитории.

---

**Версия:** 1.0.0  
**Дата:** 29 октября 2025

