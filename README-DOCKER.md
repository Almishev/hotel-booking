# Docker Setup за Hetzner

## Бърз старт

1. **Клонирайте проекта**
   ```bash
   git clone <your-repo-url>
   cd hms
   ```

2. **Създайте `.env` файл** (опционално, има default стойности)
   ```bash
   # Копирайте и попълнете стойностите
   # Вижте DOCKER-DEPLOYMENT.md за подробности
   ```

3. **Build и стартиране**
   ```bash
   docker-compose up -d --build
   ```

4. **Проверка**
   - Frontend: http://localhost
   - Backend API: http://localhost/api
   - Health: http://localhost/health

## Структура

- `backend/Dockerfile` - Spring Boot приложение (свързано с Supabase)
- `frontend/Dockerfile` - Next.js приложение  
- `nginx/nginx.conf` - Nginx reverse proxy конфигурация
- `docker-compose.yml` - Оркестрация на всички услуги

**Важно:** Базата данни е в Supabase, не в Docker контейнер.

## Environment Variables

Създайте `.env` файл в root директорията с:

```env
# Backend - Database (Supabase)
SPRING_DATASOURCE_URL=jdbc:postgresql://your-supabase-host:5432/postgres?user=your_user&password=your_password&sslmode=require

# Backend - Other services
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_app_password
JWT_SECRET=your_secret_key
CORS_ALLOWED_ORIGINS=http://localhost,https://your-domain.com

# Frontend
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_SITE_URL=http://localhost
```

## Команди

```bash
# Стартиране
docker-compose up -d

# Спиране
docker-compose down

# Логове
docker-compose logs -f

# Рестартиране на услуга
docker-compose restart backend

# Rebuild след промени
docker-compose up -d --build
```

## За подробности вижте DOCKER-DEPLOYMENT.md
