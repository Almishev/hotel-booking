# 🔧 Ръководство за поправяне на Failed Backend в Render

## 📋 Проблем

Backend service-ът `hotel-booking` е **Failed** в Render. Това може да се дължи на:
- Липсващи environment variables
- Грешен build command
- Проблем с Dockerfile
- Проблем с базата данни

## ✅ Стъпка 1: Проверка на текущите настройки

1. Отидете в Render Dashboard
2. Кликнете върху `hotel-booking` service
3. Отидете в **Settings** → **Environment**
4. Проверете дали имате следните environment variables:

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

## 🔧 Стъпка 2: Поправяне на настройките

### Поправяне на Docker Deployment (Render изисква Docker)

Тъй като Render изисква Docker за Java приложения, нека настроим правилно Dockerfile-а:

1. Отидете в **Settings** → **Build & Deploy**
2. Проверете следните настройки:

**Runtime:** `Docker`

**Dockerfile Path:** `backend/Dockerfile`

**Docker Context:** `backend` (или оставете празно, ако Dockerfile е в root)

**Root Directory:** `backend` (ако не е зададено)

3. Уверете се, че `backend/Dockerfile` съществува и е правилен (вече е обновен)
4. Уверете се, че `backend/.dockerignore` съществува (за по-бърз build)

## 🚀 Стъпка 3: Настройване на Auto-Deploy от GitHub

### 3.1 Проверка на GitHub Connection

1. Отидете в **Settings** → **Service Details**
2. Проверете дали **GitHub Repository** е свързан правилно
3. Ако не е свързан:
   - Кликнете **Connect GitHub**
   - Изберете вашия repository
   - Разрешите достъп

### 3.2 Активиране на Auto-Deploy

1. Отидете в **Settings** → **Build & Deploy**
2. Намерете секцията **Auto-Deploy**
3. Уверете се, че е избрано:
   - ✅ **Auto-Deploy:** `Yes`
   - **Branch:** `main` (или вашия основен branch)

### 3.3 Manual Deploy (За тестване)

1. Отидете в главния dashboard на service-а
2. Кликнете **Manual Deploy** → **Deploy latest commit**
3. Изчакайте build процеса
4. Проверете **Logs** за грешки

## 📝 Стъпка 4: Проверка на Logs

След deploy, проверете logs за грешки:

1. Отидете в **Logs** таб
2. Проверете за:
   - ✅ **Build успешен:** `BUILD SUCCESS`
   - ✅ **Application стартира:** `Started PhegonHotelApplication`
   - ❌ **Грешки:** Connection errors, missing variables, etc.

### Често срещани грешки:

**Грешка 1: `Cannot connect to database`**
- **Решение:** Проверете `SPRING_DATASOURCE_URL` environment variable
- Уверете се, че паролата е URL-encoded (`@` → `%40`)

**Грешка 2: `Port already in use`**
- **Решение:** Използвайте `PORT` environment variable (Render автоматично задава порт)

**Грешка 3: `Build failed`**
- **Решение:** Проверете build command и дали Maven wrapper (`mvnw`) съществува

## 🔄 Стъпка 5: Push промените в GitHub

След като поправите настройките в Render:

1. **Commit и push** промените в GitHub:
   ```bash
   git add .
   git commit -m "Update application.properties for Supabase production"
   git push origin main
   ```

2. Render **автоматично** ще започне нов build (ако auto-deploy е активиран)

3. Ако не се стартира автоматично:
   - Отидете в Render Dashboard
   - Кликнете **Manual Deploy** → **Deploy latest commit**

## ✅ Стъпка 6: Тестване

След успешен deploy:

1. Проверете **Status** дали е `Live` (зелено)
2. Отворете backend URL (напр. `https://hotel-booking.onrender.com`)
3. Тествайте health endpoint (ако имате такъв)
4. Проверете frontend дали може да се свърже с backend

## 🎯 Резюме на стъпките

1. ✅ Добавете environment variables в Render
2. ✅ Променете Runtime на `Java` (или поправете Docker)
3. ✅ Активирайте Auto-Deploy
4. ✅ Push промените в GitHub
5. ✅ Проверете Logs за грешки
6. ✅ Тествайте приложението

## 📞 Ако проблемът продължава

1. Проверете **Logs** за конкретни грешки
2. Проверете дали всички environment variables са добавени
3. Проверете дали connection string към Supabase е правилен
4. Проверете дали frontend URL е добавен в CORS конфигурацията

