# 🚀 Быстрый старт

Это руководство поможет вам быстро запустить Kvansum API локально.

## Предварительные требования

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (или pnpm)
- **Docker** и **Docker Compose** (опционально, для MongoDB)

## 1. Установка зависимостей

```bash
# Клонируйте репозиторий (если еще не клонировали)
git clone <repository-url>
cd kvansum-api

# Установите зависимости
npm install
# или
pnpm install
```

## 2. Настройка окружения

Создайте файл `.env` в корне проекта:

```bash
# Linux/Mac
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

# Windows (PowerShell)
# Создайте файл .env вручную с содержимым из ENV_SETUP.md
```

## 3. Запуск MongoDB

### Вариант А: С помощью Docker Compose (рекомендуется)

```bash
# Запустить только MongoDB
docker-compose up mongodb -d

# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f mongodb
```

### Вариант Б: Локальная установка MongoDB

Если у вас установлен MongoDB локально, убедитесь что он запущен:

```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Проверка
mongosh --eval "db.adminCommand('ping')"
```

Измените `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/kvansum
```

## 4. Запуск API

```bash
# Development режим с hot-reload
npm run dev

# Или
npm run start:dev
```

Вы должны увидеть:
```
✅ API running on http://localhost:3001
🌍 Environment: development
🔌 WebSocket server is ready
📊 MongoDB connection established
```

## 5. Проверка работы

### Health Check

```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### Создание привычки

```bash
curl -X POST http://localhost:3001/habits \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Утренняя зарядка",
    "description": "15 минут упражнений каждое утро",
    "cadence": "daily"
  }'
```

### Получение всех привычек

```bash
curl http://localhost:3001/habits
```

### Тестирование WebSocket

Откройте в браузере:
```
file:///путь/к/проекту/examples/websocket-client.html
```

Или:
1. Откройте `examples/websocket-client.html` в браузере
2. Нажмите "Connect"
3. Попробуйте "Send Ping" и отправку сообщений

## 6. Запуск всего стека через Docker

Если вы хотите запустить и MongoDB, и API в Docker:

```bash
# Запустить все сервисы
docker-compose up -d

# Посмотреть логи API
docker-compose logs -f api

# Остановить все сервисы
docker-compose down
```

## Полезные команды

### Управление Docker Compose

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск API
docker-compose restart api

# Просмотр логов
docker-compose logs -f api

# Удаление всех данных (включая MongoDB)
docker-compose down -v
```

### Разработка

```bash
# Линтинг
npm run lint

# Форматирование
npm run format

# Сборка
npm run build

# Production запуск
npm run start:prod
```

### MongoDB

```bash
# Подключение к MongoDB в Docker
docker exec -it kvansum-mongodb mongosh -u kvansum -p kvansum_dev_password

# Или через MongoDB Compass
mongodb://kvansum:kvansum_dev_password@localhost:27017/kvansum?authSource=admin
```

## Решение проблем

### Порт 3001 уже занят

```bash
# Найти процесс
# Linux/Mac
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# Изменить порт в .env
PORT=3002
```

### MongoDB не запускается

```bash
# Проверить логи
docker-compose logs mongodb

# Удалить volumes и пересоздать
docker-compose down -v
docker-compose up mongodb -d
```

### Ошибка подключения к MongoDB

Убедитесь что:
1. MongoDB запущен: `docker-compose ps`
2. Правильная строка подключения в `.env`
3. Для Docker Compose используйте `mongodb://...@mongodb:27017/...`
4. Для локального MongoDB используйте `mongodb://...@localhost:27017/...`

### WebSocket не подключается

1. Убедитесь что API запущен
2. Проверьте CORS настройки
3. Откройте консоль браузера для просмотра ошибок
4. Проверьте что порт 3001 не заблокирован фаерволом

## Следующие шаги

- [ ] Изучите API endpoints в README.md
- [ ] Посмотрите Mongoose схемы в `src/common/schemas/`
- [ ] Попробуйте WebSocket клиент
- [ ] Добавьте свои модули в `src/modules/`
- [ ] Настройте аутентификацию (JWT)

## Полезные ссылки

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

## Поддержка

Если у вас возникли проблемы:
1. Проверьте логи: `docker-compose logs -f api`
2. Убедитесь что все зависимости установлены: `npm install`
3. Проверьте `.env` файл
4. Попробуйте пересоздать containers: `docker-compose down -v && docker-compose up -d`

