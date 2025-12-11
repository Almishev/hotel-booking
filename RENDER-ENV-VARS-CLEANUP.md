# 🧹 Почистване на Environment Variables в Render

## ❌ ИЗЛИШНИ (Изтрийте тези от Render):

### 1. Database настройки (вече са в URL-а):
```
spring.datasource.username  ❌ ИЗТРИЙ
spring.datasource.password  ❌ ИЗТРИЙ
```
**Защо:** Username и password вече са в `SPRING_DATASOURCE_URL`

### 2. Статични конфигурации (не трябва да се променят):
```
spring.datasource.driver-class-name  ❌ ИЗТРИЙ
spring.jpa.properties.hibernate.dialect  ❌ ИЗТРИЙ
spring.jpa.hibernate.ddl-auto  ❌ ИЗТРИЙ
spring.mail.properties.mail.smtp.auth  ❌ ИЗТРИЙ
spring.mail.properties.mail.smtp.starttls.enable  ❌ ИЗТРИЙ
spring.servlet.multipart.max-file-size  ❌ ИЗТРИЙ
spring.servlet.multipart.max-request-size  ❌ ИЗТРИЙ
spring.application.name  ❌ ИЗТРИЙ
```
**Защо:** Тези са статични конфигурации, които трябва да останат в `application.properties`

## ✅ НУЖНИ (Оставете само тези):

### Задължителни:
```
PORT=10000
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?user=postgres.plbbjyxhlcruxtmyxcjy&password=Asroma%40123&sslmode=require
JWT_SECRET=PhegonHotelSecretKey2024ForJWTTokenGenerationAndValidation
```

### Препоръчителни (за пълна функционалност):
```
JWT_EXPIRATION=86400000
CLOUDINARY_CLOUD_NAME=dwlmmwwyr
CLOUDINARY_API_KEY=788681752119862
CLOUDINARY_API_SECRET=q-pESETw4NyiBzVKBJ-KTc89Ixs
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=mineralhotelinfo@gmail.com
SPRING_MAIL_PASSWORD=ylnppaqssnyjftcc
```

## 📋 Финален списък за Render:

**Оставете само тези 11 environment variables:**

1. `PORT=10000`
2. `SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?user=postgres.plbbjyxhlcruxtmyxcjy&password=Asroma%40123&sslmode=require`
3. `JWT_SECRET=PhegonHotelSecretKey2024ForJWTTokenGenerationAndValidation`
4. `JWT_EXPIRATION=86400000`
5. `CLOUDINARY_CLOUD_NAME=dwlmmwwyr`
6. `CLOUDINARY_API_KEY=788681752119862`
7. `CLOUDINARY_API_SECRET=q-pESETw4NyiBzVKBJ-KTc89Ixs`
8. `SPRING_MAIL_HOST=smtp.gmail.com`
9. `SPRING_MAIL_PORT=587`
10. `SPRING_MAIL_USERNAME=mineralhotelinfo@gmail.com`
11. `SPRING_MAIL_PASSWORD=ylnppaqssnyjftcc`

## 🎯 Стъпки за почистване:

1. Отидете в Render Dashboard → Вашия backend service
2. Settings → Environment
3. Изтрийте всички излишни variables (списък по-горе)
4. Оставете само 11-те нужни variables
5. Redeploy service-а

## ✅ Резултат:

- По-чиста конфигурация
- По-лесно поддържане
- По-малко объркване
- Всички статични настройки остават в `application.properties`
- Само динамични/чувствителни данни са в environment variables

