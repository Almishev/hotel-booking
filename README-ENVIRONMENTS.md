# 🌍 Environment Configuration Guide

Това ръководство обяснява как да конфигурираш и използваш приложението в различни среди (development и production).

## 📁 Файлова структура

```
.
├── docker-compose.yml          # Базова конфигурация (споделена)
├── docker-compose.dev.yml      # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── .env.example                # Шаблон за environment variables
├── .env.development            # Development environment variables
├── .env.production             # Production environment variables
├── start-dev.sh                # Скрипт за стартиране в dev режим
└── start-prod.sh               # Скрипт за стартиране в production режим
```

## 🚀 Бърз старт

### Development режим

```bash
# 1. Копирай .env.development в .env
cp .env.development .env

# 2. Редактирай .env с твоите стойности (ако е необходимо)

# 3. Стартирай с helper скрипт
./start-dev.sh

# Или ръчно:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

**Достъп:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8081
- Nginx: http://localhost:8080

### Production режим

```bash
# 1. Копирай .env.production в .env
cp .env.production .env

# 2. Редактирай .env с твоите production стойности
# ВАЖНО: Промени NEXT_PUBLIC_API_URL, CORS_ALLOWED_ORIGINS, JWT_SECRET

# 3. Стартирай с helper скрипт
./start-prod.sh

# Или ръчно:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**Достъп:**
- HTTP: http://YOUR_SERVER_IP
- HTTPS: https://YOUR_SERVER_IP (ако SSL е конфигуриран)

## 🔧 Конфигуриране на environment variables

### Стъпка 1: Създай .env файл

```bash
# За development
cp .env.development .env

# За production
cp .env.production .env
```

### Стъпка 2: Редактирай .env файла

Отвори `.env` файла и попълни всички необходими стойности:

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:8081  # за dev
NEXT_PUBLIC_API_URL=https://your-domain.com/api  # за production

# Database (PostgreSQL в Docker)
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/phegonhotel?user=postgres&password=YOUR_PASSWORD
POSTGRES_DB=phegonhotel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000  # за dev
CORS_ALLOWED_ORIGINS=https://your-domain.com  # за production

# JWT Secret (ВАЖНО: използвай силен secret в production!)
JWT_SECRET=YourSecretKey
```

## 📊 Разлики между Dev и Production

| Аспект | Development | Production |
|--------|-------------|------------|
| **Портове** | Изложени директно (3000, 8081) | Само през Nginx (80, 443) |
| **Environment** | `development` | `production` |
| **API URL** | `http://localhost:8081` | `https://your-domain.com/api` |
| **CORS** | Локални адреси | Само домейн |
| **Database** | Docker PostgreSQL (локална) | Docker PostgreSQL (на сървъра) |
| **JWT Secret** | Прост secret | Силен, случаен secret |
| **Email** | Mailtrap/Test | Production SMTP |
| **Logging** | Verbose | Minimal |
| **Hot Reload** | Възможен | Не |

## 🛠️ Полезни команди

### Development

```bash
# Стартиране
./start-dev.sh

# Спиране
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Преглед на логове
docker compose logs -f

# Rebuild
docker compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
```

### Production

```bash
# Стартиране
./start-prod.sh

# Спиране
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Преглед на логове
docker compose logs -f

# Rebuild
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
```

## ⚠️ Важни бележки

### Security

1. **Никога не commit-вай `.env.production` в Git**
   - Добави в `.gitignore`:
     ```
     .env
     .env.production
     .env.local
     ```

2. **Използвай различни secrets за dev и production**
   - Генерирай силен secret за production:
     ```bash
     openssl rand -base64 32
     ```

3. **Ограничи CORS origins в production**
   - Само твоите домейни, не `*`

### Database

- **Development**: Използвай локална Docker PostgreSQL или отделна dev база
- **Production**: Използвай локална Docker PostgreSQL на сървъра (не Supabase)
- **Миграция**: Виж `DATABASE-MIGRATION.md` за инструкции как да мигрираш от Supabase

### Email

- **Development**: Използвай Mailtrap или подобен service за тестване
- **Production**: Използвай production SMTP (Gmail, SendGrid, etc.)

## 🔍 Troubleshooting

### Проблем: Frontend използва localhost вместо правилния URL

**Решение:**
1. Провери `NEXT_PUBLIC_API_URL` в `.env`
2. Rebuild без кеш: `docker compose build --no-cache frontend`

### Проблем: CORS грешки

**Решение:**
1. Провери `CORS_ALLOWED_ORIGINS` в `.env`
2. Увери се, че включва правилния origin
3. Рестартирай backend: `docker compose restart backend`

### Проблем: Не мога да достъпя backend директно в production

**Решение:**
Това е нормално! В production backend е достъпен само през Nginx. Използвай `/api` endpoint-ите.

## 📚 Допълнителна информация

За повече информация виж:
- `HETZNER-DEPLOYMENT-ANALYSIS.md` - Пълен анализ на деплоя
- `DOCKER-DEPLOYMENT.md` - Docker deployment guide
- `HETZNER-DEPLOYMENT-GUIDE.md` - Hetzner deployment guide
- `DATABASE-MIGRATION.md` - Ръководство за миграция от Supabase към Docker PostgreSQL
- `database/README.md` - Database setup и полезни команди

---

**Успешен деплой!** 🎉

