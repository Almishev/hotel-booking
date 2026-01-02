# 🗄️ Миграция на базата данни от Supabase към Docker PostgreSQL

Това ръководство обяснява как да мигрираш базата данни от Supabase към локален PostgreSQL контейнер в Docker.

## 📋 Предварителни изисквания

1. Docker и Docker Compose са инсталирани
2. Имаш достъп до Supabase проекта
3. Имаш достъп до сървъра (за production)

## 🔄 Стъпка 1: Експортиране на данните от Supabase

### Вариант A: Чрез Supabase Dashboard

1. Влез в Supabase Dashboard
2. Отиди на **Database** → **Backups**
3. Създай нов backup или изтегли съществуващ

### Вариант B: Чрез Supabase CLI

```bash
# Инсталирай Supabase CLI (ако нямаш)
npm install -g supabase

# Login
supabase login

# Експортирай базата
supabase db dump -f supabase_backup.sql
```

### Вариант C: Чрез pg_dump (директно)

```bash
# Ако имаш достъп до connection string
pg_dump "postgresql://postgres.xxx:password@aws-1-eu-west-1.pooler.supabase.com:5432/postgres" > supabase_backup.sql
```

## 🐳 Стъпка 2: Конфигуриране на Docker PostgreSQL

### 2.1. Създай .env файл

```bash
# Копирай шаблона
cp env.example .env.production

# Редактирай .env.production
nano .env.production
```

### 2.2. Попълни database credentials

```env
# PostgreSQL Container Configuration
POSTGRES_DB=phegonhotel
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourSecurePassword123!

# Database Connection String
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/phegonhotel?user=postgres&password=YourSecurePassword123!
```

**ВАЖНО:** Използвай силен парола за production!

## 🚀 Стъпка 3: Стартиране на PostgreSQL контейнера

### Development

```bash
# Копирай .env.development
cp env.example .env.development

# Редактирай с development credentials
nano .env.development

# Стартирай само PostgreSQL (за тестване)
docker compose up -d postgres

# Провери дали работи
docker compose ps postgres
docker compose logs postgres
```

### Production

```bash
# На сървъра, копирай .env.production
cp env.example .env.production

# Редактирай с production credentials
nano .env.production

# Стартирай само PostgreSQL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres
```

## 📥 Стъпка 4: Импортиране на данните

### Вариант A: Импорт от backup файл

```bash
# Копирай backup файла на сървъра (ако е необходимо)
scp supabase_backup.sql root@YOUR_SERVER_IP:/root/hotel-booking/

# Импортирай данните
docker exec -i phegon-hotel-postgres psql -U postgres -d phegonhotel < supabase_backup.sql
```

### Вариант B: Импорт чрез docker cp

```bash
# Копирай файла в контейнера
docker cp supabase_backup.sql phegon-hotel-postgres:/tmp/backup.sql

# Импортирай
docker exec -i phegon-hotel-postgres psql -U postgres -d phegonhotel -f /tmp/backup.sql
```

### Вариант C: Директен импорт от Supabase (ако имаш достъп)

```bash
# Експортирай и импортирай в една команда
pg_dump "postgresql://postgres.xxx:password@supabase-host:5432/postgres" | \
  docker exec -i phegon-hotel-postgres psql -U postgres -d phegonhotel
```

## ✅ Стъпка 5: Проверка на данните

```bash
# Влез в PostgreSQL контейнера
docker exec -it phegon-hotel-postgres psql -U postgres -d phegonhotel

# Провери таблиците
\dt

# Провери броя на записите в таблица
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM rooms;
-- и т.н.

# Излез
\q
```

## 🔄 Стъпка 6: Обновяване на Backend конфигурацията

### Проверка на connection string

Увери се, че `SPRING_DATASOURCE_URL` в `.env` файла е правилен:

```env
# За Docker PostgreSQL (в същата мрежа)
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/phegonhotel?user=postgres&password=YourPassword
```

**Забележка:** Използвай `postgres` като hostname (името на service-а в docker-compose), не `localhost`!

## 🚀 Стъпка 7: Стартиране на цялото приложение

### Development

```bash
./start-dev.sh
```

### Production

```bash
./start-prod.sh
```

## 🔍 Стъпка 8: Проверка на приложението

1. **Провери backend logs:**
   ```bash
   docker compose logs backend
   ```

2. **Провери дали има database connection errors:**
   ```bash
   docker compose logs backend | grep -i "database\|connection\|jdbc"
   ```

3. **Тествай API endpoints:**
   ```bash
   curl http://localhost/api/rooms/types
   ```

## ⚠️ Важни бележки

### Security

1. **Никога не commit-вай `.env` файлове с пароли в Git**
2. **Използвай различни пароли за dev и production**
3. **Backup-вай редовно базата данни**

### Performance

1. **HikariCP pool size:** В `application.properties` можеш да увеличиш pool size за локална база:
   ```properties
   spring.datasource.hikari.maximum-pool-size=10
   ```

2. **PostgreSQL настройки:** За production можеш да оптимизираш PostgreSQL чрез custom `postgresql.conf`

### Backup стратегия

Създай регулярни backups:

```bash
# Backup скрипт
#!/bin/bash
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
docker exec phegon-hotel-postgres pg_dump -U postgres phegonhotel > "/backups/$BACKUP_FILE"
```

## 🐛 Troubleshooting

### Проблем: "Connection refused" или "Host not found"

**Решение:**
- Провери дали PostgreSQL контейнерът работи: `docker compose ps postgres`
- Провери дали `SPRING_DATASOURCE_URL` използва `postgres` като hostname
- Провери дали backend и postgres са в същата Docker мрежа

### Проблем: "Authentication failed"

**Решение:**
- Провери `POSTGRES_PASSWORD` в `.env` файла
- Провери `SPRING_DATASOURCE_URL` да съдържа правилния парола
- Рестартирай контейнерите: `docker compose restart`

### Проблем: "Database does not exist"

**Решение:**
- Провери `POSTGRES_DB` в `.env` файла
- Провери `SPRING_DATASOURCE_URL` да използва правилното име на базата
- Създай базата ръчно ако е необходимо:
  ```bash
  docker exec -it phegon-hotel-postgres psql -U postgres -c "CREATE DATABASE phegonhotel;"
  ```

### Проблем: "Permission denied" при импорт

**Решение:**
- Увери се, че файлът е достъпен
- Провери permissions: `chmod 644 supabase_backup.sql`
- Използвай `docker cp` вместо директно четене

## 📚 Допълнителни ресурси

- [PostgreSQL Docker Image Documentation](https://hub.docker.com/_/postgres)
- [Supabase Migration Guide](https://supabase.com/docs/guides/migrations)
- [Spring Boot Database Configuration](https://spring.io/guides/gs/accessing-data-jpa/)

---

**Успешна миграция!** 🎉

