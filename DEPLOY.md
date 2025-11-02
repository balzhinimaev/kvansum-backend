# 🚀 Deployment Guide - Kvansum Backend

## Предварительные требования

- Telegram Bot Token (получить от [@BotFather](https://t.me/botfather))
- MongoDB база данных (MongoDB Atlas или VPS)
- Node.js 18+ на сервере

---

## Вариант 1: Railway (рекомендуется)

### Шаг 1: Создание бота в Telegram

1. Открой [@BotFather](https://t.me/botfather)
2. Отправь `/newbot`
3. Выбери имя бота
4. Скопируй токен (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Шаг 2: Настройка MongoDB Atlas

1. Создай аккаунт на [mongodb.com](https://www.mongodb.com/cloud/atlas/register)
2. Создай бесплатный кластер (M0)
3. Добавь IP адрес: `0.0.0.0/0` (Allow access from anywhere)
4. Создай database user
5. Скопируй connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kvansum
   ```

### Шаг 3: Деплой на Railway

1. Зайди на [railway.app](https://railway.app)
2. Создай новый проект из GitHub репозитория
3. Добавь переменные окружения:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kvansum
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
CORS_ORIGINS=https://your-frontend.com,https://web.telegram.org
```

4. Deploy автоматически запустится
5. Скопируй URL приложения (например, `https://your-app.railway.app`)

### Шаг 4: Настройка Telegram Mini App

1. Открой [@BotFather](https://t.me/botfather)
2. Выбери своего бота
3. Отправь `/newapp`
4. Укажи Web App URL: `https://your-frontend.com`

---

## Вариант 2: Render.com

### Создание Web Service

1. Зайди на [render.com](https://render.com)
2. Создай новый Web Service из GitHub
3. Настройки:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Environment:** Node

4. Переменные окружения (как в Railway выше)

### Создание MongoDB

На Render можно использовать:
- MongoDB Atlas (рекомендуется)
- Или создать PostgreSQL и использовать Prisma

---

## Вариант 3: VPS (DigitalOcean, Hetzner)

### Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка MongoDB (опционально, можно использовать Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Деплой приложения

```bash
# Клонирование репозитория
git clone <your-repo-url>
cd kvansum-backend

# Установка зависимостей
npm install

# Создание .env файла
nano .env
```

Содержимое `.env`:
```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/kvansum
TELEGRAM_BOT_TOKEN=your_bot_token_here
CORS_ORIGINS=https://your-frontend.com
```

```bash
# Сборка
npm run build

# Запуск с PM2
pm2 start dist/main.js --name kvansum-api
pm2 save
pm2 startup
```

### Настройка Nginx

```bash
sudo apt install nginx

# Создание конфига
sudo nano /etc/nginx/sites-available/kvansum-api
```

Содержимое:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Активация конфига
sudo ln -s /etc/nginx/sites-available/kvansum-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL с Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

---

## Вариант 4: Docker на VPS

### docker-compose.yml для production

```yaml
version: '3.8'

services:
  api:
    build: .
    restart: always
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      MONGODB_URI: mongodb://mongodb:27017/kvansum
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      CORS_ORIGINS: ${CORS_ORIGINS}
    depends_on:
      - mongodb
    networks:
      - kvansum-network

  mongodb:
    image: mongo:7
    restart: always
    volumes:
      - mongodb-data:/data/db
    networks:
      - kvansum-network

volumes:
  mongodb-data:

networks:
  kvansum-network:
```

### Деплой

```bash
# Клонирование
git clone <your-repo-url>
cd kvansum-backend

# Создание .env
nano .env

# Запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f api
```

---

## После деплоя

### 1. Проверка работоспособности

```bash
# Health check
curl https://your-api.com/health

# Должен вернуть:
# {"status":"ok","info":{"database":{"status":"up"}}}
```

### 2. Seed данные (опционально)

```bash
# На VPS
npm run seed:new

# Через Docker
docker-compose exec api npm run seed:new
```

### 3. Мониторинг

#### PM2 Monitor (VPS)
```bash
pm2 monit
pm2 logs kvansum-api
```

#### Docker logs
```bash
docker-compose logs -f api
```

### 4. Обновление приложения

#### VPS с PM2
```bash
cd kvansum-backend
git pull
npm install
npm run build
pm2 restart kvansum-api
```

#### Docker
```bash
cd kvansum-backend
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

#### Railway/Render
- Автоматический деплой при push в main ветку

---

## Безопасность

### 1. Firewall (VPS)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Регулярные обновления

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Backup MongoDB

#### MongoDB Atlas
- Автоматические backups включены

#### Локальный MongoDB
```bash
# Создание backup
mongodump --db kvansum --out /backup/$(date +%Y%m%d)

# Восстановление
mongorestore --db kvansum /backup/20250101/kvansum
```

### 4. Переменные окружения

- ❌ НИКОГДА не коммитьте `.env` в git
- ✅ Используйте секреты платформы (Railway Secrets, etc.)
- ✅ Регулярно меняйте токены

---

## Troubleshooting

### Ошибка подключения к MongoDB

```bash
# Проверка статуса MongoDB
sudo systemctl status mongod

# Проверка логов
sudo journalctl -u mongod

# Тест подключения
mongosh --eval "db.adminCommand('ping')"
```

### API не отвечает

```bash
# PM2
pm2 status
pm2 logs kvansum-api --lines 50

# Docker
docker-compose ps
docker-compose logs api --tail 50

# Проверка порта
netstat -tulpn | grep 3001
```

### CORS ошибки

Проверьте `CORS_ORIGINS` в .env:
```env
CORS_ORIGINS=https://your-frontend.com,https://web.telegram.org
```

### Telegram аутентификация не работает

1. Проверьте `TELEGRAM_BOT_TOKEN` в .env
2. Убедитесь что initData отправляется в заголовке `X-Telegram-Init-Data`
3. Проверьте логи: `pm2 logs` или `docker-compose logs`

---

## Мониторинг и логирование

### Рекомендуемые сервисы

- **Uptime monitoring:** UptimeRobot, Better Uptime
- **Error tracking:** Sentry
- **Logs:** Papertrail, Loggly
- **Analytics:** Google Analytics, Mixpanel

### Добавление Sentry (опционально)

```bash
npm install @sentry/node
```

```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Масштабирование

### Horizontal scaling (Railway/Render)

- Railway: Settings → Scale → Increase replicas
- Render: Settings → Instance count

### Vertical scaling (VPS)

```bash
# Upgrade droplet на DigitalOcean
# Resize server на Hetzner
```

### Database scaling

- MongoDB Atlas: Upgrade to M10+ tier
- Add read replicas
- Enable sharding

---

## Чеклист перед запуском

- [ ] Telegram Bot создан и токен получен
- [ ] MongoDB настроена и доступна
- [ ] Все переменные окружения установлены
- [ ] SSL сертификат настроен (HTTPS)
- [ ] CORS правильно настроен
- [ ] Health check работает
- [ ] Seed данные загружены (опционально)
- [ ] Мониторинг настроен
- [ ] Backup стратегия определена
- [ ] Документация обновлена

---

## Полезные ссылки

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Готово!** 🎉 Теперь ваш Kvansum Backend запущен в production!

