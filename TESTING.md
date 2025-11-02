# 🧪 Testing Guide - Kvansum Backend

## Быстрое тестирование API

### Вариант 1: Mock аутентификация (development режим)

Самый простой способ протестировать API без Telegram:

```bash
# Установите NODE_ENV=development в .env
NODE_ENV=development

# Используйте заголовок X-User-Id
curl http://localhost:3001/api/habits \
  -H "X-User-Id: test-user-1"

curl http://localhost:3001/api/users/me \
  -H "X-User-Id: test-user-1"

curl http://localhost:3001/api/stats/dashboard \
  -H "X-User-Id: test-user-1"
```

**Преимущества:**
- ✅ Не нужен Telegram bot token
- ✅ Быстрое тестирование
- ✅ Подходит для локальной разработки

**Недостатки:**
- ❌ Не тестирует реальную Telegram аутентификацию
- ❌ Не проверяет валидацию initData

---

### Вариант 2: Получение initData от Telegram

Для полноценного тестирования с реальной Telegram аутентификацией:

#### Шаг 1: Создайте бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте **bot token** (выглядит как `123456789:ABC...`)

#### Шаг 2: Создайте Mini App

1. Выберите вашего бота в @BotFather
2. Отправьте `/newapp`
3. Выберите имя приложения
4. Загрузите или создайте Web App URL
5. Для тестирования можно использовать:
   - GitHub Pages
   - Netlify Drop
   - ngrok туннель

#### Шаг 3: Откройте HTML тестер

1. Откройте `examples/telegram-init-data-tester.html` через Telegram Mini App
2. Нажмите "Показать InitData"
3. Скопируйте initData строку

#### Шаг 4: Используйте initData для тестирования

```bash
# Замените YOUR_INIT_DATA на скопированную строку
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"YOUR_INIT_DATA"}'
```

**Ожидаемый ответ:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "telegramId": 123456789,
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "photoUrl": "https://..."
}
```

#### Шаг 5: Тестирование защищенных endpoints

```bash
# Используйте initData в заголовке X-Telegram-Init-Data
curl http://localhost:3001/api/habits \
  -H "X-Telegram-Init-Data: YOUR_INIT_DATA"

curl http://localhost:3001/api/users/me \
  -H "X-Telegram-Init-Data: YOUR_INIT_DATA"
```

---

## Вариант 3: ngrok для локального тестирования

### Настройка ngrok

1. Зарегистрируйтесь на [ngrok.com](https://ngrok.com)
2. Скачайте ngrok
3. Установите: `npm install -g ngrok`
4. Запустите туннель:

```bash
ngrok http 3001
```

5. Скопируйте HTTPS URL (например, `https://abc123.ngrok.io`)

### Создание Mini App

1. Откройте @BotFather
2. Отправьте `/newapp`
3. Укажите Web App URL: `https://abc123.ngrok.io/examples/telegram-init-data-tester.html`

### Открытие в Telegram

1. Откройте вашего бота в Telegram
2. Нажмите на кнопку Mini App
3. Страница откроется с доступом к initData

---

## Полное тестирование всех endpoints

### 1. Health Check

```bash
curl http://localhost:3001/health
```

### 2. Авторизация (если используете Telegram)

```bash
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"YOUR_INIT_DATA"}'
```

### 3. Получение привычек

```bash
# Development режим
curl http://localhost:3001/api/habits \
  -H "X-User-Id: test-user-1"

# Production режим
curl http://localhost:3001/api/habits \
  -H "X-Telegram-Init-Data: YOUR_INIT_DATA"
```

### 4. Создание привычки

```bash
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-1" \
  -d '{
    "title": "Утренняя зарядка",
    "levelId": "lvl1",
    "emoji": "💪",
    "summary": "15 минут упражнений",
    "difficulty": "easy",
    "timeOfDay": "morning",
    "days": ["daily"]
  }'
```

### 5. Отметить выполнение

```bash
# Замените HABIT_ID на реальный ID
curl -X POST http://localhost:3001/api/habits/HABIT_ID/log \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-1" \
  -d '{
    "date": "2025-11-02",
    "status": "success",
    "note": "Отличная тренировка!"
  }'
```

### 6. Получить статистику

```bash
curl http://localhost:3001/api/stats/dashboard \
  -H "X-User-Id: test-user-1"
```

### 7. Получить профиль

```bash
curl http://localhost:3001/api/users/me \
  -H "X-User-Id: test-user-1"
```

---

## Автоматизированное тестирование

### Postman Collection

Создайте коллекцию в Postman:

1. **Auth**
   - POST `/api/auth/telegram` (Telegram mode)
   - Предзаполните initData из переменной окружения

2. **Habits**
   - GET `/api/habits`
   - POST `/api/habits`
   - PATCH `/api/habits/:id`
   - DELETE `/api/habits/:id`
   - POST `/api/habits/:id/log`
   - GET `/api/habits/:id/logs`

3. **Stats**
   - GET `/api/stats/dashboard`
   - GET `/api/stats/weekly`
   - GET `/api/stats/rank`

4. **Users**
   - GET `/api/users/me`
   - PATCH `/api/users/me`

### Newman (CLI тесты)

```bash
# Установка
npm install -g newman

# Запуск тестов
newman run kvansum-api.postman_collection.json \
  --env telegram-auth.postman_environment.json
```

---

## Тестирование ошибок

### Неверный initData

```bash
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"invalid_data"}'

# Ожидается: 401 Unauthorized
```

### Отсутствие аутентификации

```bash
curl http://localhost:3001/api/habits

# Ожидается: 401 Unauthorized
```

### Неверный формат данных

```bash
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test-user-1" \
  -d '{"title":""}'  # Пустое название

# Ожидается: 400 Bad Request
```

---

## Интеграционное тестирование с фронтендом

### React/Next.js

```typescript
// Создайте axios instance
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Добавьте interceptor для автоматического добавления initData
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData;
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  return config;
});

// Используйте в компонентах
export async function getHabits() {
  const response = await api.get('/api/habits');
  return response.data;
}
```

### Тестирование через браузер

1. Откройте DevTools (F12)
2. Перейдите на вкладку Network
3. Выполните действия в приложении
4. Проверьте запросы к API

---

## Нагрузочное тестирование

### Apache Bench (ab)

```bash
# 1000 запросов, 10 одновременных
ab -n 1000 -c 10 \
  -H "X-User-Id: test-user-1" \
  http://localhost:3001/api/habits
```

### Artillery

```yaml
# artillery-test.yml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Get habits"
    flow:
      - get:
          url: "/api/habits"
          headers:
            X-User-Id: "test-user-1"
```

```bash
# Запуск
npx artillery run artillery-test.yml
```

---

## Debug режим

### Включить детальное логирование

```typescript
// src/main.ts
app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
```

### Проверка MongoDB запросов

```bash
# Подключение к MongoDB
docker exec -it kvansum-mongodb mongosh -u kvansum -p kvansum_dev_password

# Просмотр коллекций
use kvansum
show collections

# Проверка пользователей
db.users.find().pretty()

# Проверка привычек
db.habits.find().pretty()
```

---

## Чеклист тестирования

### Функциональность
- [ ] Авторизация через Telegram работает
- [ ] Все CRUD операции для привычек работают
- [ ] Статистика корректно рассчитывается
- [ ] Прогресс по уровням работает
- [ ] WebSocket события отправляются

### Безопасность
- [ ] Неверный initData отклоняется
- [ ] Access control работает (нельзя видеть чужие данные)
- [ ] Валидация DTO работает
- [ ] SQL injection защита (нет SQL, но проверка на всякий случай)

### Производительность
- [ ] Response time < 200ms для основных endpoints
- [ ] Нет memory leaks
- [ ] База данных не перегружается

### Отказоустойчивость
- [ ] Graceful shutdown работает
- [ ] Ошибки обрабатываются корректно
- [ ] Logs сохраняются

---

## Полезные команды

```bash
# Запуск с seed данными
npm run seed:new && npm run dev

# Проверка MongoDB
docker exec -it kvansum-mongodb mongosh kvansum

# Просмотр логов
docker-compose logs -f api

# Перезапуск с очисткой
docker-compose down -v && docker-compose up -d
```

---

**Готово!** Теперь у вас есть все необходимые инструменты для тестирования API 🧪

