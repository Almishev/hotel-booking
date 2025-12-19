# 🧪 Локално тестване с Docker и Nginx

Това ръководство обяснява как да тествате приложението локално с Docker и Nginx преди deployment на Hetzner.

## 📋 Предварителни изисквания

- Docker Desktop инсталиран и работещ
- Docker Compose инсталиран
- Порт 80 свободен (или променете в docker-compose.yml)

## 🚀 Стъпка 1: Подготовка

### Проверка на Docker

```bash
# Проверка дали Docker работи
docker --version
docker-compose --version

# Проверка дали Docker daemon работи
docker ps
```

### Проверка на портове

```bash
# Windows PowerShell
netstat -ano | findstr :80

# Linux/Mac
lsof -i :80
```

Ако порт 80 е зает, можете да промените в `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Използвайте порт 8080 вместо 80
```

## 🏗️ Стъпка 2: Build и стартиране

### Първоначален build

```bash
# Навигирайте до root директорията на проекта
cd C:\Users\Admin\Desktop\hms

# Build на всички образи (първи път ще отнеме време)
docker-compose build

# Или build и стартиране наведнъж
docker-compose up -d --build
```

### Проверка на статуса

```bash
# Проверка на всички контейнери
docker-compose ps

# Очакван изход:
# NAME                      STATUS          PORTS
# phegon-hotel-backend      Up              8081/tcp
# phegon-hotel-frontend     Up              3000/tcp
# phegon-hotel-nginx        Up              0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## 📊 Стъпка 3: Преглед на логове

### Всички услуги

```bash
# Преглед на всички логове
docker-compose logs -f

# Или конкретна услуга
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Какво да търсите в логовете:

**Backend:**
```
Started PhegonHotelApplication in X.XXX seconds
```

**Frontend:**
```
Ready on http://0.0.0.0:3000
```

**Nginx:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## ✅ Стъпка 4: Тестване на услугите

### 1. Тест на Nginx Health Check

```bash
# Windows PowerShell
curl http://localhost/health

# Или отворете в браузър
# http://localhost/health
```

**Очакван резултат:** `healthy`

### 2. Тест на Frontend (през Nginx)

```bash
# Отворете в браузър
http://localhost
```

**Очаквано:** Трябва да видите началната страница на приложението

### 3. Тест на Backend API (през Nginx)

```bash
# Тест на публичен endpoint
curl http://localhost/api/rooms/types

# Или отворете в браузър
# http://localhost/api/rooms/types
```

**Очаквано:** JSON отговор с типове стаи

### 4. Тест на Backend директно (в Docker network)

```bash
# Влизане в backend контейнера
docker-compose exec backend sh

# В контейнера
wget -O- http://localhost:8081/rooms/types
exit
```

### 5. Тест на Frontend директно (в Docker network)

```bash
# Влизане в frontend контейнера
docker-compose exec frontend sh

# В контейнера
wget -O- http://localhost:3000
exit
```

## 🔍 Стъпка 5: Детайлни тестове

### Тест на API endpoints

```bash
# 1. Получаване на всички стаи
curl http://localhost/api/rooms/all

# 2. Получаване на типове стаи
curl http://localhost/api/rooms/types

# 3. Тест на auth endpoint (трябва да върне 405 или валиден отговор)
curl -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### Тест на Frontend функционалности

1. Отворете `http://localhost` в браузър
2. Проверете дали началната страница се зарежда
3. Проверете дали търсенето на стаи работи
4. Проверете дали навигацията работи
5. Отворете Developer Tools (F12) и проверете за грешки в Console

### Тест на Nginx проксиране

```bash
# Проверка дали Nginx правилно пренасочва /api заявки
curl -v http://localhost/api/rooms/types

# Трябва да видите:
# < HTTP/1.1 200 OK
# < Server: nginx/...
```

## 🐛 Troubleshooting

### Проблем: Порт 80 е зает

**Решение:**
```yaml
# В docker-compose.yml променете:
nginx:
  ports:
    - "8080:80"  # Използвайте друг порт
```

След това достъпвайте на `http://localhost:8080`

### Проблем: Backend не стартира

**Проверка:**
```bash
# Преглед на backend логове
docker-compose logs backend

# Проверка дали Supabase connection работи
docker-compose exec backend sh
# В контейнера проверете environment variables
env | grep SPRING_DATASOURCE_URL
```

### Проблем: Frontend не се зарежда

**Проверка:**
```bash
# Преглед на frontend логове
docker-compose logs frontend

# Проверка дали build е успешен
docker-compose exec frontend sh
ls -la /app
```

### Проблем: Nginx връща 502 Bad Gateway

**Причини:**
- Backend или Frontend не са стартирали
- Грешна конфигурация в nginx.conf

**Решение:**
```bash
# Проверка на статуса
docker-compose ps

# Проверка на nginx конфигурация
docker-compose exec nginx nginx -t

# Рестартиране на всички услуги
docker-compose restart
```

### Проблем: CORS грешки

**Решение:**
Обновете `CORS_ALLOWED_ORIGINS` в docker-compose.yml:
```yaml
CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-http://localhost,http://localhost:3000,http://127.0.0.1}
```

## 🧹 Почистване

### Спиране на контейнерите

```bash
# Спиране без изтриване
docker-compose stop

# Спиране и изтриване на контейнери
docker-compose down

# Спиране, изтриване на контейнери и volumes
docker-compose down -v
```

### Rebuild след промени

```bash
# Rebuild конкретна услуга
docker-compose build backend
docker-compose up -d backend

# Или rebuild всичко
docker-compose up -d --build
```

## 📝 Чеклист за успешно тестване

- [ ] Всички контейнери са `Up` (docker-compose ps)
- [ ] Health check работи (http://localhost/health)
- [ ] Frontend се зарежда (http://localhost)
- [ ] Backend API отговаря (http://localhost/api/rooms/types)
- [ ] Няма грешки в логовете
- [ ] Няма CORS грешки в браузър конзолата
- [ ] Навигацията в приложението работи
- [ ] API заявките от frontend работят

## 🎯 Следващи стъпки

След като всичко работи локално:

1. Обновете environment variables за production
2. Настройте SSL сертификат (Let's Encrypt)
3. Обновете CORS origins с вашия домейн
4. Деплой на Hetzner сървър

---

**Успешно тестване!** 🎉

