# Telegram Web App Authentication

## Описание

Реализована полноценная авторизация через Telegram Mini App с использованием `initData`. Система автоматически создает пользователей при первом входе и валидирует данные от Telegram.

## Настройка

### 1. Установите переменные окружения

Добавьте в `.env`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NODE_ENV=production
```

### 2. Получение Bot Token

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Создайте нового бота командой `/newbot`
3. Скопируйте токен бота
4. Установите его в переменную окружения `TELEGRAM_BOT_TOKEN`

## Архитектура

### Модули

1. **AuthModule** (`src/modules/auth/`)
   - `auth.service.ts` - Валидация initData и создание/обновление пользователей
   - `auth.controller.ts` - Endpoint для авторизации
   - `dto/telegram-auth.dto.ts` - DTO для запросов

2. **UserMiddleware** (`src/common/middleware/user.middleware.ts`)
   - Проверяет `X-Telegram-Init-Data` заголовок на каждом запросе
   - Валидирует initData
   - Добавляет `telegramId` в `req`

## API Endpoints

### POST /api/auth/telegram

Авторизация пользователя через Telegram Web App.

**Request:**
```json
{
  "initData": "query_id=...&user=%7B%22id%22%3A123456789...&hash=..."
}
```

**Response:**
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

## Интеграция с фронтендом

### Пример использования в React/Next.js

```typescript
import { useEffect, useState } from 'react';

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function authenticate() {
      if (!window.Telegram?.WebApp) {
        console.error('Telegram WebApp is not available');
        setLoading(false);
        return;
      }

      const initData = window.Telegram.WebApp.initData;

      if (!initData) {
        console.error('InitData is not available');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/telegram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const userData = await response.json();
        setUser(userData);

        // Сохраняем initData для последующих запросов
        localStorage.setItem('telegram_init_data', initData);
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, []);

  return { user, loading };
}
```

### Пример использования с axios

```typescript
import axios from 'axios';

// Создаем axios instance с автоматическим добавлением initData
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Добавляем interceptor для автоматического добавления initData в заголовки
api.interceptors.request.use((config) => {
  const initData = localStorage.getItem('telegram_init_data') || 
                   window.Telegram?.WebApp?.initData;
  
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData;
  }
  
  return config;
});

// Использование
export async function getHabits() {
  const response = await api.get('/api/habits');
  return response.data;
}

export async function createHabit(habitData) {
  const response = await api.post('/api/habits', habitData);
  return response.data;
}
```

### Пример с fetch

```typescript
const initData = window.Telegram?.WebApp?.initData;

fetch('http://localhost:3001/api/habits', {
  headers: {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
  },
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Режим разработки

В режиме разработки (`NODE_ENV=development`) можно использовать mock авторизацию через заголовок:

```bash
curl http://localhost:3001/api/habits \
  -H "X-User-Id: test-user-1"
```

Или в JavaScript:

```typescript
fetch('http://localhost:3001/api/habits', {
  headers: {
    'X-User-Id': 'test-user-1',
  },
});
```

## Безопасность

### Валидация initData

1. **HMAC-SHA256** - Используется для проверки подлинности данных
2. **Проверка срока действия** - initData действителен 24 часа
3. **Секретный ключ** - Создается из bot token
4. **Защита от подделки** - Невозможно подделать данные без знания bot token

### Рекомендации

1. **Никогда не храните bot token в git** - Используйте `.env` файлы
2. **HTTPS в продакшене** - Всегда используйте HTTPS для защиты данных
3. **Валидация на каждом запросе** - Middleware проверяет данные на каждом запросе
4. **Автоматическое обновление данных** - При каждом запросе данные пользователя обновляются

## Структура данных пользователя

### User Schema (MongoDB)

```typescript
{
  _id: ObjectId,
  telegramId: number (unique),
  username?: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Request Object

После успешной аутентификации в `req` доступны:

```typescript
req.userId: string        // MongoDB _id пользователя
req.telegramId: number    // Telegram ID пользователя
```

## Troubleshooting

### Ошибка "Missing Telegram authentication data"

- Убедитесь, что передаете заголовок `X-Telegram-Init-Data`
- В development режиме можно использовать `X-User-Id`

### Ошибка "Invalid initData hash"

- Проверьте правильность `TELEGRAM_BOT_TOKEN`
- Убедитесь, что initData не был изменен
- Проверьте, что initData получен от Telegram WebApp

### Ошибка "InitData has expired"

- initData действителен 24 часа
- Перезагрузите Mini App для получения нового initData

### Ошибка "Telegram bot token is not configured"

- Добавьте `TELEGRAM_BOT_TOKEN` в `.env`
- Перезапустите сервер

## Тестирование

### Локальное тестирование через ngrok

1. Установите [ngrok](https://ngrok.com/)
2. Запустите сервер: `npm run dev`
3. Создайте туннель: `ngrok http 3001`
4. Используйте ngrok URL в настройках Mini App

### Пример с curl

```bash
# Получаем initData от Telegram WebApp
INIT_DATA="query_id=...&user=%7B%22id%22%3A123456789...&hash=..."

# Авторизуемся
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d "{\"initData\": \"$INIT_DATA\"}"

# Используем для запросов
curl http://localhost:3001/api/habits \
  -H "X-Telegram-Init-Data: $INIT_DATA"
```

## Дополнительная информация

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Validating data received via the Mini App](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)

