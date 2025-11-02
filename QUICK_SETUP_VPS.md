# ⚡ Быстрая настройка для VPS (ваш случай)

Вы на VPS `root@4688957-uw88472`, вот 3 простых способа открыть `telegram-init-data-tester.html`:

---

## 🎯 Способ 1: GitHub Gist (2 минуты, РЕКОМЕНДУЕТСЯ)

### На VPS:

```bash
# 1. Прочитайте файл
cat /opt/kvansum-backend/examples/telegram-init-data-tester.html
```

### На локальном компьютере:

1. Скопируйте весь текст файла
2. Откройте [gist.github.com](https://gist.github.com)
3. Вставьте код, назовите файл `index.html`
4. Нажмите "Create public gist"
5. Скопируйте URL вида: `https://gist.github.com/username/abc123`

### В @BotFather:

1. Откройте @BotFather
2. Ваш бот → `/newapp`
3. Web App URL: `https://gist.github.com/username/abc123/raw` (**добавьте /raw**)
4. Откройте бота в Telegram → Mini App
5. Готово! ✅

---

## 🎯 Способ 2: VPS + Python HTTP Server + ngrok (3 минуты)

### На VPS:

```bash
# 1. Перейдите в папку
cd /opt/kvansum-backend/examples

# 2. Запустите простой HTTP сервер
python3 -m http.server 8080
```

**Оставьте этот терминал открытым!**

### В другом терминале VPS:

```bash
# 3. Установите ngrok (если нет)
# Скачайте с https://ngrok.com/download
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# 4. Зарегистрируйтесь на ngrok.com и получите токен
# Затем запустите:
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 5. Запустите туннель
ngrok http 8080
```

### Скопируйте HTTPS URL:

Вы увидите что-то вроде:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:8080
```

### В @BotFather:

1. Откройте @BotFather
2. Ваш бот → `/newapp`
3. Web App URL: `https://abc123.ngrok-free.app/telegram-init-data-tester.html`
4. Сохраните
5. Откройте бота → Mini App
6. Готово! ✅

---

## 🎯 Способ 3: VPS + nginx (производство)

### На VPS:

```bash
# 1. Установите nginx
apt update
apt install nginx -y

# 2. Создайте конфиг
cat > /etc/nginx/sites-available/telegram-test << 'EOF'
server {
    listen 80;
    server_name _;  # Любой хост

    location / {
        root /opt/kvansum-backend/examples;
        index telegram-init-data-tester.html;
        try_files $uri $uri/ =404;
    }
}
EOF

# 3. Включите
ln -s /etc/nginx/sites-available/telegram-test /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 4. Получите ваш IP
curl ifconfig.me
```

### В @BotFather:

1. Web App URL: `http://YOUR_IP_ADDRESS/telegram-init-data-tester.html`

**⚠️ Проблема:** Telegram требует HTTPS!

### Решение: Let's Encrypt

```bash
# Установите certbot
apt install certbot python3-certbot-nginx -y

# Получите домен (или используйте существующий)
# Например: test.yourdomain.com

# Получите SSL
certbot --nginx -d test.yourdomain.com
```

### В @BotFather:

1. Web App URL: `https://test.yourdomain.com/telegram-init-data-tester.html`
2. Готово! ✅

---

## 🏆 Мой выбор для вас: Способ 1 (GitHub Gist)

**Почему?**
- ✅ Самый быстрый (2 минуты)
- ✅ Не требует установки
- ✅ Бесплатно
- ✅ Работает сразу
- ✅ Не нужно держать процесс запущенным

**Для production используйте Способ 3 (nginx + SSL)**

---

## ✅ После настройки

Откройте бота в Telegram → Mini App → Нажмите "Показать InitData" → Скопируйте

Затем тестируйте API:

```bash
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"ВСТАВЬТЕ_СКОПИРОВАННЫЙ_INITDATA"}'
```

**Готово!** 🎉

