# Kvansum API

Backend API для приложения Kvansum, построенный на **NestJS** с **MongoDB** и **Socket.IO**.

## 🚀 Технологии

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Mongoose** - MongoDB ODM для TypeScript/JavaScript
- **MongoDB** - NoSQL база данных
- **Socket.IO** - Двусторонняя коммуникация в реальном времени
- **Docker** - Контейнеризация приложения

## 📦 Установка

```bash
# Установка зависимостей
npm install

# или с использованием pnpm
pnpm install
```

## ⚙️ Конфигурация

Создайте файл `.env` и настройте переменные окружения:

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🗄️ База данных

MongoDB запускается автоматически через Docker Compose:

```bash
# Запуск MongoDB
docker-compose up mongodb -d

# Проверка статуса
docker-compose ps
```

## 🏃 Запуск

### Development режим

```bash
# С hot-reload
npm run dev

# или
npm run start:dev
```

### Production режим

```bash
# Сборка
npm run build

# Запуск
npm run start:prod
```

## 🐳 Docker

### Запуск всего стека (MongoDB + API)

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f api

# Остановка всех сервисов
docker-compose down

# Остановка и удаление volumes
docker-compose down -v
```

### Только API

```bash
# Сборка образа
docker build -t kvansum-api .

# Запуск контейнера
docker run -p 3001:3001 --env-file .env kvansum-api
```

## 📁 Структура проекта

```
src/
├── modules/              # Модули приложения
│   ├── auth/            # Аутентификация
│   ├── users/           # Пользователи
│   ├── habits/          # Привычки (CRUD + WebSocket)
│   ├── billing/         # Биллинг
│   ├── telegram/        # Telegram интеграция
│   ├── stats/           # Статистика
│   └── health/          # Health check
├── common/              # Общие утилиты
│   ├── schemas/         # Mongoose схемы
│   └── websockets/      # WebSocket gateway
├── config/              # Конфигурация
│   └── configuration.ts # Настройки приложения
├── jobs/                # Фоновые задачи
├── types/               # TypeScript типы
├── app.module.ts        # Корневой модуль
└── main.ts              # Точка входа

examples/
└── websocket-client.html # Тестовый WebSocket клиент
```

## 🔗 API Endpoints

API доступен по адресу: `http://localhost:3001`

### Health Check
- `GET /health` - Проверка здоровья сервиса

### Habits (Привычки)
- `GET /habits` - Получить все привычки пользователя
- `GET /habits/:id` - Получить привычку по ID
- `POST /habits` - Создать новую привычку
- `PATCH /habits/:id` - Обновить привычку
- `DELETE /habits/:id` - Удалить привычку (soft delete)
- `POST /habits/:id/complete` - Отметить привычку как выполненную

### Примеры запросов

#### Создание привычки

```bash
curl -X POST http://localhost:3001/habits \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Читать книги",
    "description": "Читать минимум 30 минут в день",
    "cadence": "daily"
  }'
```

#### Получение всех привычек

```bash
curl http://localhost:3001/habits
```

## 🔌 WebSocket (Socket.IO)

WebSocket сервер работает на том же порту: `ws://localhost:3001`

### События

#### От клиента к серверу:
- `ping` - Отправить ping
- `message` - Отправить сообщение

#### От сервера к клиенту:
- `welcome` - Приветствие при подключении
- `pong` - Ответ на ping
- `message` - Эхо сообщения

### Тестовый клиент

Откройте `examples/websocket-client.html` в браузере для тестирования WebSocket соединения.

### Пример подключения (JavaScript)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('welcome', (data) => {
  console.log('Welcome:', data);
});

socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Pong:', data);
});
```

## 🗃️ Mongoose Схемы

### Habit Schema

```typescript
{
  title: string;           // Название привычки
  description?: string;    // Описание
  cadence: 'daily' | 'weekly'; // Частота
  userId: ObjectId;        // ID пользователя
  isActive: boolean;       // Активна ли привычка
  streak: number;          // Текущая серия
  completedDates: Date[];  // Даты выполнения
  createdAt: Date;         // Дата создания
  updatedAt: Date;         // Дата обновления
}
```

### User Schema

```typescript
{
  email: string;           // Email (уникальный)
  passwordHash: string;    // Хеш пароля
  name: string;            // Имя пользователя
  role: 'user' | 'admin';  // Роль
  isActive: boolean;       // Активен ли пользователь
  telegramData?: {         // Данные Telegram
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  billingInfo?: {          // Информация о подписке
    plan: 'free' | 'premium';
    subscriptionEnd?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 🛠️ Разработка

### Форматирование кода

```bash
npm run format
```

### Линтинг

```bash
npm run lint
```

## 📊 Мониторинг

- **MongoDB**: подключитесь через MongoDB Compass к `mongodb://localhost:27017`
- **Логи**: `docker-compose logs -f api`
- **Health Check**: `curl http://localhost:3001/health`

## 🌱 Seed данные

Для быстрого старта можно заполнить базу тестовыми данными:

```bash
npm run seed
```

Это создаст:
- ✅ Тестовый пользователь (ID: `test-user-1`)
- ✅ 3 привычки с различными настройками
- ✅ Логи за последние 7 дней
- ✅ 10 мыслей дня
- ✅ 3 артефакта развития

## 📚 Документация

- **API_DOCUMENTATION.md** - Полная документация всех endpoints с примерами
- **IMPLEMENTATION_SUMMARY.md** - Сводка по реализации и ключевым особенностям

## 🎯 Реализованные модули

### ✅ Users Module
- Профиль пользователя со статистикой
- Обновление профиля
- Экспорт данных (GDPR)

### ✅ Habits Module (полная реализация)
- CRUD операции для привычек
- Логирование выполнения с начислением очков
- История выполнения с фильтрацией
- Система серий (streak) и достижений

### ✅ Stats Module
- Dashboard статистика (сегодня + 7 дней)
- Недельная детальная статистика
- Система рангов и уровней

### ✅ Thoughts Module
- Мысль дня (детерминированная)
- Управление мыслями (admin)

### ✅ Artefacts Module
- Список артефактов развития
- Управление артефактами

## 🎮 Особенности

### Система очков
- **Легкая привычка**: 10 очков
- **Средняя привычка**: 20 очков
- **Сложная привычка**: 30 очков
- **Бонус за серию**: +streak × 2 (макс +50)

### Система рангов
- 🌱 Начинающий: 0-99 очков
- 👁️ Наблюдатель: 100-499
- ⚡ Активный: 500-1499
- 🎯 Системный: 1500-3999
- 🏛️ Архитектор: 4000-9999
- 🚀 Масштабирующий: 10000+

### Real-time обновления
WebSocket события при:
- Создании привычки
- Обновлении привычки
- Выполнении привычки
- Удалении привычки

## 📝 TODO

- [ ] Реализовать JWT аутентификацию
- [ ] Добавить Telegram бот интеграцию
- [ ] Реализовать биллинг систему
- [ ] Добавить unit и e2e тесты
- [ ] Настроить CI/CD pipeline
- [ ] Добавить Swagger документацию
- [ ] Добавить кеширование (Redis)
- [ ] Настроить rate limiting

## 📝 Лицензия

Private

