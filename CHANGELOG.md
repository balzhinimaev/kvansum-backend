# Changelog

Все важные изменения в проекте Kvansum API будут документированы в этом файле.

## [2.0.0] - 2025-10-28

### 🎉 Крупное обновление: Переход на MongoDB и Socket.IO

### ✨ Добавлено

- **MongoDB + Mongoose**: Полный переход с PostgreSQL/Prisma на MongoDB/Mongoose
  - Mongoose схемы: `Habit`, `User`
  - Индексы для оптимизации запросов
  - Поддержка TypeScript типов

- **Socket.IO**: Интеграция WebSocket для real-time коммуникации
  - `EventsGateway` для обработки WebSocket соединений
  - События: `ping/pong`, `message`, `welcome`
  - CORS настройка для WebSocket
  - Тестовый HTML клиент (`examples/websocket-client.html`)

- **Конфигурация**: Централизованная система конфигурации
  - `@nestjs/config` для управления переменными окружения
  - Модуль `configuration.ts` с типобезопасными настройками
  - Поддержка `.env` файлов

- **Habits Module**: Полноценный CRUD модуль для привычек
  - Controller с REST endpoints
  - Service с бизнес-логикой
  - DTOs с валидацией (class-validator)
  - Soft delete для привычек
  - Отслеживание серий выполнения

- **Валидация**: Глобальные pipes для автоматической валидации
  - `class-validator` и `class-transformer`
  - Whitelist и forbidNonWhitelisted опции

### 🔧 Изменено

- **База данных**: PostgreSQL → MongoDB
  - Удалена Prisma
  - Docker Compose теперь использует MongoDB 7
  - Обновлены переменные окружения

- **Dependencies**: Обновлен package.json
  - Добавлено: `@nestjs/mongoose`, `mongoose`, `@nestjs/websockets`, `socket.io`
  - Удалено: `@prisma/client`, `prisma`
  - Добавлено: `@nestjs/config`, `@nestjs/mapped-types`

- **Docker**:
  - Обновлен Dockerfile (удалены Prisma команды)
  - docker-compose.yml с MongoDB вместо PostgreSQL
  - Healthcheck для MongoDB

- **main.ts**: Расширенная конфигурация
  - Глобальная валидация
  - Улучшенное логирование
  - Динамический порт из конфигурации

### 📚 Документация

- Полностью обновлен README.md
  - Новые инструкции по установке
  - Примеры использования API
  - WebSocket документация
  - Mongoose схемы
  - Docker команды

- Добавлен ENV_SETUP.md с инструкциями по настройке окружения
- Добавлен CHANGELOG.md для отслеживания изменений

### 🗑️ Удалено

- Prisma Client и схемы
- PostgreSQL зависимости
- Prisma CLI скрипты из package.json
- Папка `prisma/` (кроме .gitkeep для migrations)

### 📁 Структура

Новая структура проекта:
```
src/
├── common/
│   ├── schemas/          # Mongoose схемы
│   └── websockets/       # Socket.IO gateway
├── config/
│   └── configuration.ts  # Настройки приложения
├── modules/
│   ├── habits/          # CRUD для привычек
│   └── ...
└── ...

examples/
└── websocket-client.html # Тестовый WebSocket клиент
```

### 🔍 Технический стек

**До:**
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL

**После:**
- NestJS + TypeScript
- Mongoose ODM
- MongoDB
- Socket.IO
- class-validator/transformer

---

## [1.0.0] - Начальная версия

### Добавлено
- Базовая структура NestJS проекта
- Health check module
- Docker support
- TypeScript конфигурация

