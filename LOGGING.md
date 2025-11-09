# Логирование в Backend

## Добавлено логирование во все ключевые компоненты авторизации

### 🔐 AuthController (`POST /api/auth/telegram`)

Логирует:
- Входящие запросы на аутентификацию
- Длину `initData`
- Успешную аутентификацию с `userId` и `telegramId`

```typescript
🔐 [POST /api/auth/telegram] Request received
🔐 [POST /api/auth/telegram] ✅ Success for userId: 123..., telegramId: 456...
```

### 🔍 AuthService

**Метод `validateInitData`:**
- Начало/окончание валидации
- Полученные данные (первые 100 символов)
- Распарсенные ключи параметров
- Результат проверки hash
- Данные пользователя из Telegram
- Ошибки валидации

**Метод `authenticateWithTelegram`:**
- Начало/конец процесса аутентификации
- Данные пользователя из Telegram (ID, username, firstName)
- Поиск пользователя в БД
- Создание нового пользователя (если не найден)
- Создание статистики пользователя
- Обновление существующего пользователя (старые и новые данные)
- Финальный ответ

```typescript
=== [authenticateWithTelegram] START ===
[validateInitData] Starting validation...
[validateInitData] Parsed user data: {"id":123,"first_name":"John",...}
[authenticateWithTelegram] Looking for user with telegramId: 123
[authenticateWithTelegram] User NOT found - creating new user...
[authenticateWithTelegram] ✅ New user created: 507f...
[authenticateWithTelegram] ✅ User stats created: 607f...
[authenticateWithTelegram] === END === Returning: {"userId":"507f...",...}
```

### 🔒 UserMiddleware

Логирует на **каждом защищенном запросе**:
- Метод и путь запроса
- Режим разработки (если используется mock `X-User-Id`)
- Отсутствие заголовка `X-Telegram-Init-Data`
- Валидацию `initData`
- `telegramId` из валидированных данных
- Авторизацию пользователя (userId, telegramId)
- Ошибки аутентификации

```typescript
🔒 [UserMiddleware] GET /api/habits
[UserMiddleware] Validating initData...
[UserMiddleware] Validated telegramId: 123456
[UserMiddleware] ✅ User authorized: userId=507f..., telegramId=123456
```

### 👤 UsersService

**Метод `findOrCreateByTelegramId`:**
- Поиск пользователя по `telegramId`
- Создание нового пользователя (если не найден)
- Данные создаваемого пользователя
- ID созданного пользователя и статистики
- Обновление существующего пользователя

```typescript
[findOrCreateByTelegramId] Looking for telegramId: 123456
[findOrCreateByTelegramId] User NOT found - creating new user...
[findOrCreateByTelegramId] User data: {"username":"johndoe",...}
[findOrCreateByTelegramId] ✅ User created: 507f..., telegramId: 123456
[findOrCreateByTelegramId] ✅ User stats created: 607f...
```

### 🗄️ AppModule (MongoDB)

Логирует подключение к MongoDB:
- URI подключения (первые 20 символов)
- Имя базы данных

```typescript
🗄️  Connecting to MongoDB...
   URI: mongodb://localhost:2...
   DB Name: kvansum
```

### 🔌 WebSocket Gateway

Логирует:
- Инициализацию WebSocket
- Подключение клиентов
- Отключение клиентов
- Входящие сообщения

```typescript
WebSocket Gateway initialized
Client connected: abc123...
Client disconnected: abc123...
Message from abc123...: Hello
```

### 🚀 Bootstrap (main.ts)

Логирует:
- Создание приложения
- Загрузку конфигурации (порт, окружение)
- Настройку Swagger
- Запуск сервера
- Финальную информацию (URLs, окружение)

```typescript
Creating NestJS application...
Configuration loaded - Port: 3001, Environment: production
Swagger documentation configured
✅ API running on http://localhost:3001
📚 Swagger documentation: http://localhost:3001/api/docs
```

## Уровни логирования

Приложение использует следующие уровни (настроено в `main.ts`):
- `log` - основные события
- `error` - ошибки
- `warn` - предупреждения
- `debug` - детальная отладочная информация
- `verbose` - максимально подробная информация

## Отладка проблем с авторизацией

Если пользователь не создается в БД, проверьте логи в следующем порядке:

1. **Приходит ли запрос на бэкенд:**
   ```
   🔐 [POST /api/auth/telegram] Request received
   ```

2. **Валидируется ли initData:**
   ```
   [validateInitData] Starting validation...
   [validateInitData] Hash validation successful
   ```

3. **Создается ли пользователь:**
   ```
   [authenticateWithTelegram] User NOT found - creating new user...
   [authenticateWithTelegram] ✅ New user created: ...
   ```

4. **Подключение к правильной БД:**
   ```
   🗄️  Connecting to MongoDB...
   DB Name: kvansum
   ```

Если логов нет — запрос не доходит до вашего бэкенда (проверьте URL фронтенда).

Если есть ошибки в логах — смотрите детали ошибки в консоли.

