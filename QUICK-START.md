# ⚡ Бърз старт - Локално тестване

## 🚀 Бързи команди

### 1. Стартиране
```bash
cd C:\Users\Admin\Desktop\hms
docker-compose up -d --build
```

### 2. Проверка на статуса
```bash
docker-compose ps
```

### 3. Преглед на логове
```bash
docker-compose logs -f
```

### 4. Тестване в браузър
- Frontend: http://localhost
- Health check: http://localhost/health
- Backend API: http://localhost/api/rooms/types

### 5. Спиране
```bash
docker-compose down
```

## ✅ Бърз тест

```bash
# 1. Стартиране
docker-compose up -d --build

# 2. Изчакване 30-60 секунди за стартиране

# 3. Тест на health check
curl http://localhost/health

# 4. Тест на API
curl http://localhost/api/rooms/types

# 5. Отворете в браузър
start http://localhost
```

## 🐛 Ако нещо не работи

```bash
# Преглед на логове
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Рестартиране
docker-compose restart

# Rebuild
docker-compose up -d --build --force-recreate
```

За подробности вижте `LOCAL-TESTING.md`

