ча# Docker Deployment Guide for Hetzner

Това ръководство обяснява как да деплойнете Phegon Hotel приложението на Hetzner с Docker и Docker Compose.

## 📋 Предварителни изисквания

- Docker и Docker Compose инсталирани на Hetzner сървъра
- Git инсталиран
- Домейн име (опционално, но препоръчително)

## 🚀 Стъпки за деплой

### 1. Клониране на проекта

```bash
git clone <your-repo-url>
cd hms
```

### 2. Конфигуриране на environment variables

Създайте `.env` файл в root директорията на проекта:

```bash
cp .env.example .env
nano .env
```

Попълнете всички необходими стойности:
- **SPRING_DATASOURCE_URL** - Supabase connection string (опционално, има default)
- Cloudinary credentials
- Email SMTP настройки
- JWT secret
- CORS allowed origins (включете вашия домейн)
- Frontend API URL (ако използвате домейн, използвайте `https://your-domain.com/api`)

**Важно:** Базата данни е в Supabase, не в Docker контейнер. Уверете се че Supabase connection string е правилно конфигуриран.

### 3. Обновяване на docker-compose.yml

Ако използвате домейн, обновете `nginx/nginx.conf` да слуша на порт 443 и добавете SSL сертификат.

### 4. Build и стартиране на контейнерите

```bash
# Build и стартиране на всички услуги
docker-compose up -d --build

# Проверка на статуса
docker-compose ps

# Преглед на логове
docker-compose logs -f
```

### 5. Проверка на приложението

- Frontend: `http://your-server-ip` или `https://your-domain.com`
- Backend API: `http://your-server-ip/api` или `https://your-domain.com/api`
- Health check: `http://your-server-ip/health`

## 🔧 Конфигурация на Nginx за SSL (Let's Encrypt)

### Инсталиране на Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Генериране на SSL сертификат

```bash
sudo certbot --nginx -d your-domain.com
```

### Обновяване на nginx.conf

След като получите SSL сертификат, обновете `nginx/nginx.conf` да включва SSL конфигурация:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... останалата конфигурация
}
```

## 📊 Управление на контейнерите

### Рестартиране на услуга

```bash
docker-compose restart <service-name>
# Пример: docker-compose restart backend
```

### Спиране на всички услуги

```bash
docker-compose down
```

### Преглед на логове

```bash
# Всички услуги
docker-compose logs -f

# Конкретна услуга
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Обновяване на приложението

```bash
# Pull последните промени
git pull

# Rebuild и рестартиране
docker-compose up -d --build
```

## 🔒 Сигурност

1. **Променете паролите** в `.env` файла
2. **Използвайте силен JWT_SECRET**
3. **Ограничете CORS origins** само до вашия домейн
4. **Настройте firewall** на Hetzner сървъра:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## 🐛 Troubleshooting

### Проверка на database connection

Базата данни е в Supabase. Проверете connection string в `.env` файла:
```bash
# Проверка на backend логове за database connection
docker-compose logs backend | grep -i "database\|datasource\|postgres"
```

### Проверка на frontend build

```bash
docker-compose logs frontend
```

### Проверка на nginx конфигурация

```bash
docker-compose exec nginx nginx -t
```

### Рестартиране на всички услуги

```bash
docker-compose restart
```

## 📝 Структура на услугите

- **backend**: Spring Boot API (порт 8081) - свързан с Supabase
- **frontend**: Next.js приложение (порт 3000)
- **nginx**: Reverse proxy (порт 80/443)

**База данни:** PostgreSQL в Supabase (не в Docker контейнер)

## 🌐 Портове

- `80`: HTTP (Nginx)
- `443`: HTTPS (Nginx)
- `3000`: Frontend (вътрешен)
- `8081`: Backend (вътрешен)

## 📞 Поддръжка

При проблеми проверете:
1. Логовете: `docker-compose logs`
2. Статуса на контейнерите: `docker-compose ps`
3. Database connection: Проверете Supabase connection string в `.env` файла и backend логове
4. Supabase dashboard: Проверете дали базата данни е достъпна в Supabase

