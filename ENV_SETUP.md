# Настройка переменных окружения

## Создание файла .env

Создайте файл `.env` в корне проекта со следующим содержимым:

```env
# Application
NODE_ENV=development
PORT=3001

# MongoDB
MONGODB_URI=mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin

# CORS
CORS_ENABLED=true
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT (для будущей реализации)
# JWT_SECRET=your-secret-key-here
# JWT_EXPIRES_IN=7d

# Telegram Bot (ОБЯЗАТЕЛЬНО для авторизации)
TELEGRAM_BOT_TOKEN=your-bot-token-here
# TELEGRAM_WEBHOOK_URL=https://your-domain.com/telegram/webhook
```

## Описание переменных

### Application
- `NODE_ENV` - Окружение (development, production, test)
- `PORT` - Порт для запуска API (по умолчанию 3001)

### MongoDB
- `MONGODB_URI` - Строка подключения к MongoDB
  - Формат: `mongodb://username:password@host:port/database?authSource=admin`
  - Локальный Docker: `mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin`
  - Docker Compose (внутри контейнера): `mongodb://kvansum:kvansum_dev_password@mongodb:27017/kvansum?authSource=admin`

### CORS
- `CORS_ENABLED` - Включить/выключить CORS (true/false, по умолчанию true)
  - Для отключения CORS используйте `CORS_ENABLED=false`
  - Полезно для тестирования или когда приложение работает в одном домене
- `CORS_ORIGINS` - Список разрешенных origin для CORS (через запятую)

### JWT (опционально)
- `JWT_SECRET` - Секретный ключ для подписи JWT токенов
- `JWT_EXPIRES_IN` - Время жизни токена (например, 7d, 24h, 60m)

### Telegram (ОБЯЗАТЕЛЬНО)
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота (обязательно для авторизации через Telegram Web App)
  - Получить можно у [@BotFather](https://t.me/botfather) командой `/newbot`
- `TELEGRAM_WEBHOOK_URL` - URL для webhook Telegram бота (опционально)

## Разные окружения

### Development (локально)
```env
NODE_ENV=development
MONGODB_URI=mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin
CORS_ENABLED=true
```

### Docker Compose
```env
NODE_ENV=development
MONGODB_URI=mongodb://kvansum:kvansum_dev_password@mongodb:27017/kvansum?authSource=admin
CORS_ENABLED=true
```

### Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
CORS_ENABLED=true
CORS_ORIGINS=https://your-production-domain.com
JWT_SECRET=your-secure-random-secret-key
```

