# 🚀 Render Deployment Guide с Supabase

## 📋 Преглед

Това ръководство обяснява как да deploy-нете приложението в Render, като използвате **Supabase** за базата данни вместо Render базата данни (която се изтрива след 1 месец на free plan).

## 🏗️ Архитектура

- **Frontend**: React приложение в Render (Static Site или Web Service)
- **Backend**: Spring Boot приложение в Render (Web Service)
- **Database**: Supabase PostgreSQL (безплатно, без изтриване след 1 месец)

## ✅ Предимства на Supabase

- ✅ **Безплатно** за малки проекти
- ✅ **Не се изтрива** след период на неактивност
- ✅ **500 MB** база данни безплатно
- ✅ **2 GB** bandwidth безплатно
- ✅ **Connection pooling** вградено
- ✅ **Table Editor** за управление на данни

## 🔧 Стъпка 1: Подготовка на Supabase

### 1.1 Вземете Connection String от Supabase

1. Отидете в [Supabase Dashboard](https://supabase.com/dashboard)
2. Изберете вашия проект `phegon-hotel`
3. Отидете в **Settings** → **Database**
4. Скролнете до **Connection String** секцията
5. Изберете **Session mode** (за connection pooling)
6. Копирайте JDBC connection string

**Формат:**
```
jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?user=postgres.PROJECT_ID&password=YOUR_PASSWORD&sslmode=require
```

**Важно:** 
- Използвайте **Session Pooler** (порт 5432) за production
- URL-encode паролата ако има специални символи (напр. `@` → `%40`)

## 🚀 Стъпка 2: Deploy Backend в Render

### 2.1 Създаване на Web Service

1. Отидете в [Render Dashboard](https://dashboard.render.com)
2. Кликнете **New** → **Web Service**
3. Свържете вашия GitHub repository
4. Изберете `backend` директорията като **Root Directory**

### 2.2 Настройки на Build

- **Name**: `phegon-hotel-backend` (или каквото предпочитате)
- **Environment**: `Java`
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/*.jar`

### 2.3 Environment Variables

Добавете следните environment variables в Render:

```
PORT=10000
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?user=postgres.plbbjyxhlcruxtmyxcjy&password=Asroma%40123&sslmode=require
JWT_SECRET=PhegonHotelSecretKey2024ForJWTTokenGenerationAndValidation
JWT_EXPIRATION=86400000
CLOUDINARY_CLOUD_NAME=dwlmmwwyr
CLOUDINARY_API_KEY=788681752119862
CLOUDINARY_API_SECRET=q-pESETw4NyiBzVKBJ-KTc89Ixs
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=mineralhotelinfo@gmail.com
SPRING_MAIL_PASSWORD=ylnppaqssnyjftcc
```

**Важно:** 
- Заменете `SPRING_DATASOURCE_URL` с вашия Supabase connection string
- URL-encode паролата ако има специални символи
- `PORT` трябва да е `10000` за Render (или каквото Render назначи)

### 2.4 Deploy

1. Кликнете **Create Web Service**
2. Изчакайте build и deploy процеса
3. Запишете URL-а на backend (напр. `https://phegon-hotel-backend.onrender.com`)

## 🌐 Стъпка 3: Deploy Frontend в Render

### 3.1 Създаване на Web Service (Задължително за Next.js)

**Важно:** Next.js приложенията **ТРЯБВА** да се deploy-ват като **Web Service**, не като Static Site, защото използват server-side rendering и нуждаят от Node.js сървър.

### 3.2 Настройки за Web Service

1. Отидете в [Render Dashboard](https://dashboard.render.com)
2. Кликнете **New** → **Web Service**
3. Свържете вашия GitHub repository
4. Изберете `frontend` директорията като **Root Directory**

**Настройки:**
- **Name**: `phegon-hotel-frontend` (или каквото предпочитате)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Важно:** 
- Уверете се, че използвате **Web Service**, не Static Site
- `next.config.ts` трябва да има `output: 'standalone'` (вече е добавено)
- Start командата трябва да е `npm start`, което стартира `next start`

### 3.3 Environment Variables за Frontend

Добавете environment variables:

```
NEXT_PUBLIC_API_URL=https://phegon-hotel-backend.onrender.com
PORT=10000
```

**Важно:** 
- Заменете `NEXT_PUBLIC_API_URL` с вашия backend URL от Стъпка 2.4
- `PORT` трябва да е `10000` за Render (или каквото Render назначи)
- Next.js използва `NEXT_PUBLIC_` prefix за client-side environment variables

### 3.4 Deploy

1. Кликнете **Create Web Service**
2. Изчакайте build и deploy процеса
3. Запишете URL-а на frontend (напр. `https://phegon-hotel-frontend.onrender.com`)

## 🔒 Стъпка 4: Обновяване на CORS

След като имате frontend URL, обновете CORS конфигурацията в backend:

1. Отидете в `backend/src/main/java/com/phegondev/PhegonHotel/security/CorsConfig.java`
2. Добавете вашия frontend URL в `allowedOrigins`:

```java
config.setAllowedOrigins(List.of(
    "https://phegon-hotel-frontend.onrender.com", // Вашият frontend URL
    "http://localhost:3000",
    "http://127.0.0.1:3000"
));
```

3. Commit и push промените
4. Render автоматично ще redeploy backend-а

## ✅ Стъпка 5: Тестване

1. Отворете frontend URL в браузър
2. Тествайте регистрация на нов потребител
3. Тествайте login
4. Проверете дали данните се записват в Supabase Table Editor

## 🔍 Troubleshooting

### Проблем: Backend не може да се свърже с Supabase

**Решение:**
- Проверете дали connection string е правилен
- Проверете дали паролата е URL-encoded
- Проверете дали използвате Session Pooler (порт 5432)
- Проверете дали `sslmode=require` е включен

### Проблем: CORS грешки

**Решение:**
- Проверете дали frontend URL е добавен в `CorsConfig.java`
- Проверете дали backend е redeploy-нат след промяната
- Проверете browser console за точни CORS грешки

### Проблем: Frontend не може да се свърже с Backend

**Решение:**
- Проверете дали `REACT_APP_API_URL` environment variable е правилен
- Проверете дали backend URL завършва без `/` (напр. `https://backend.onrender.com`, не `https://backend.onrender.com/`)
- Проверете дали backend е running и достъпен

## 📊 Мониторинг

### Supabase Dashboard
- Проверете **Table Editor** за данни
- Проверете **Database** → **Connection Pooling** за статистики
- Проверете **Logs** за грешки

### Render Dashboard
- Проверете **Logs** за backend и frontend
- Проверете **Metrics** за performance
- Проверете **Events** за deployment история

## 💰 Разходи

### Render Free Plan
- **Backend**: Безплатно (може да спира след 15 минути неактивност)
- **Frontend (Static)**: Безплатно
- **Database**: Не използваме Render DB

### Supabase Free Plan
- **Database**: Безплатно (500 MB, 2 GB bandwidth)
- **Не се изтрива** след период на неактивност

## 🎯 Следващи стъпки

1. Настройте **custom domain** в Render (ако имате)
2. Настройте **SSL certificate** (автоматично в Render)
3. Настройте **backup strategy** в Supabase (ако е необходимо)
4. Мониторирайте **usage** в Supabase dashboard

## 📝 Бележки

- Render free plan може да спира backend след 15 минути неактивност
- Първият request след спиране може да отнеме 30-60 секунди (cold start)
- За production с постоянна активност, разгледайте Render paid plans
- Supabase free plan е достатъчен за малки до средни проекти

