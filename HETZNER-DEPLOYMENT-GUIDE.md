# 🚀 Пълно ръководство за деплой на Hetzner

## 📋 Стъпка 1: Създаване на Cloud Server в Hetzner

### 1.1 Влез в Hetzner Console
- Отиди на https://console.hetzner.com
- Влез в акаунта си

### 1.2 Създай нов Cloud Server

1. **Кликни на "Default" проект** (или създай нов проект)
2. **Кликни на "+ CREATE SERVER"** бутона
3. **Избери настройки:**
   - **Image:** Ubuntu 22.04 или Debian 12
   - **Type:** 
     - Минимум: **CPX11** (2 vCPU, 2GB RAM) - ~€4/месец
     - Препоръчително: **CPX21** (3 vCPU, 4GB RAM) - ~€8/месец
   - **Location:** Избери най-близкото до теб (напр. Nuremberg, Falkenstein)
   - **SSH Keys:** Добави твоя SSH ключ (или използвай root парола)
   - **Networks:** Остави по подразбиране
   - **Firewalls:** Можеш да добавиш firewall правило (портове 80, 443)
   - **Backups:** Опционално
   - **Labels:** Опционално

4. **Кликни "CREATE & BUY NOW"**

### 1.3 Запиши информацията
- **IP адрес на сървъра** (напр. `123.45.67.89`)
- **Root парола** (ако не използваш SSH ключ)

---

## 🔐 Стъпка 2: Свързване към сървъра

### 2.1 Свържи се чрез SSH

**Windows (PowerShell):**
```powershell
ssh root@YOUR_SERVER_IP
```

**Или използвай SSH клиент като PuTTY**

### 2.2 При първо свързване
- Ще те попита дали искаш да продължиш - напиши `yes`
- Въведи паролата (ако не използваш SSH ключ)

---

## 🛠️ Стъпка 3: Инсталиране на необходимите инструменти

### 3.1 Обновяване на системата
```bash
apt update && apt upgrade -y
```

### 3.2 Инсталиране на Docker
```bash
# Инсталиране на Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Проверка
docker --version
```

### 3.3 Инсталиране на Docker Compose
```bash
# Инсталиране на Docker Compose plugin
apt-get install docker-compose-plugin -y

# Проверка
docker compose version
```

### 3.4 Инсталиране на Git
```bash
apt-get install git -y
```

---

## 📦 Стъпка 4: Клониране на проекта

### 4.1 Клонирай проекта от GitHub
```bash
# Клонирай проекта
git clone <your-github-repo-url>
cd hms

# Проверка
ls -la
```

**Важно:** Замени `<your-github-repo-url>` с реалния URL на твоя GitHub repository.

---

## ⚙️ Стъпка 5: Конфигуриране на environment variables

### 5.1 Създай `.env` файл
```bash
nano .env
```

### 5.2 Попълни `.env` файла

```env
# ============================================
# BACKEND - Database (Supabase)
# ============================================
# Вземи правилния connection string от Supabase Dashboard
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-eu-west-1.pooler.supabase.com:5432/postgres?user=postgres.plbbjyxhlcruxtmyxcjy&password=Asroma%40123&sslmode=require

# ============================================
# BACKEND - Cloudinary
# ============================================
CLOUDINARY_CLOUD_NAME=dwlmmwwyr
CLOUDINARY_API_KEY=788681752119862
CLOUDINARY_API_SECRET=q-pESETw4NyiBzVKBJ-KTc89Ixs

# ============================================
# BACKEND - Email (Gmail SMTP)
# ============================================
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=mineralhotelinfo@gmail.com
SPRING_MAIL_PASSWORD=ylnppaqssnyjftcc

# ============================================
# BACKEND - JWT Security
# ============================================
# ВАЖНО: Промени на силен secret за production!
JWT_SECRET=PhegonHotelSecretKey2024ForJWTTokenGenerationAndValidation
JWT_EXPIRATION=86400000

# ============================================
# BACKEND - CORS (Allowed Origins)
# ============================================
# Ако имаш домейн: https://your-domain.com
# Ако нямаш домейн: http://YOUR_SERVER_IP
CORS_ALLOWED_ORIGINS=https://your-domain.com,http://YOUR_SERVER_IP

# ============================================
# FRONTEND - API URL
# ============================================
# Ако имаш домейн с SSL:
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Ако нямаш домейн (само IP):
# NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP/api
# NEXT_PUBLIC_SITE_URL=http://YOUR_SERVER_IP
```

**Важно:** 
- Замени `YOUR_SERVER_IP` с реалния IP адрес на сървъра
- Ако имаш домейн, замени `your-domain.com` с твоя домейн
- Промени `JWT_SECRET` на силен secret за production

### 5.3 Запази файла
- В nano: `Ctrl+X`, след това `Y`, след това `Enter`

---

## 🔥 Стъпка 6: Настройка на Firewall

### 6.1 Отвори необходимите портове
```bash
# Инсталиране на UFW (ако не е инсталиран)
apt-get install ufw -y

# Отваряне на портове
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Активиране на firewall
ufw enable

# Проверка
ufw status
```

---

## 🚀 Стъпка 7: Build и стартиране на приложението

### 7.1 Build и стартиране
```bash
# Отиди в директорията на проекта
cd ~/hms

# Build и стартиране на всички услуги
docker compose up -d --build
```

**Забележка:** Първият build може да отнеме 5-10 минути.

### 7.2 Проверка на статуса
```bash
# Проверка на всички контейнери
docker compose ps

# Очакван изход:
# NAME                      STATUS          PORTS
# phegon-hotel-backend      Up (healthy)    8081/tcp
# phegon-hotel-frontend     Up              3000/tcp
# phegon-hotel-nginx        Up (healthy)    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### 7.3 Преглед на логове
```bash
# Всички услуги
docker compose logs -f

# Или конкретна услуга
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

---

## ✅ Стъпка 8: Тестване

### 8.1 Тест на health check
```bash
curl http://localhost/health
```
Трябва да върне: `healthy`

### 8.2 Тест на backend API
```bash
curl http://localhost/api/rooms/types
```
Трябва да върне JSON с типове стаи.

### 8.3 Тест от браузър
Отвори в браузър:
- `http://YOUR_SERVER_IP` - Frontend
- `http://YOUR_SERVER_IP/api/rooms/types` - Backend API
- `http://YOUR_SERVER_IP/health` - Health check

---

## 🌐 Стъпка 9: Настройка на домейн (опционално)

### 9.1 Настрой DNS записи
В DNS настройките на домейна:
- **A Record:** `@` → `YOUR_SERVER_IP`
- **A Record:** `www` → `YOUR_SERVER_IP`

### 9.2 Инсталиране на Certbot (Let's Encrypt)
```bash
apt-get update
apt-get install certbot python3-certbot-nginx -y
```

### 9.3 Генериране на SSL сертификат
```bash
# Спиране на nginx контейнера временно
docker compose stop nginx

# Генериране на сертификат
certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Стартиране на nginx отново
docker compose start nginx
```

### 9.4 Обновяване на nginx.conf за SSL

Създай нов файл `nginx/nginx-ssl.conf` или обнови съществуващия:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Increase body size limit for file uploads
    client_max_body_size 2G;

    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://backend:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_buffering off;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 9.5 Обновяване на docker-compose.yml за SSL volumes

Добави volumes за SSL сертификати в nginx услугата:

```yaml
nginx:
  volumes:
    - ./nginx/nginx-ssl.conf:/etc/nginx/conf.d/default.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 9.6 Обновяване на .env файла
```env
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 9.7 Рестартиране
```bash
docker compose restart
```

---

## 🔄 Стъпка 10: Обновяване на приложението

### 10.1 Pull последните промени
```bash
cd ~/hms
git pull
```

### 10.2 Rebuild и рестартиране
```bash
docker compose up -d --build
```

---

## 📊 Полезни команди

### Преглед на статуса
```bash
docker compose ps
```

### Преглед на логове
```bash
# Всички услуги
docker compose logs -f

# Конкретна услуга
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
```

### Рестартиране на услуга
```bash
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
```

### Спиране на всички услуги
```bash
docker compose down
```

### Рестартиране на всички услуги
```bash
docker compose restart
```

---

## 🔒 Сигурност - Важни стъпки

1. **Промени JWT_SECRET** на силен secret
2. **Промени паролите** в `.env` файла
3. **Ограничи CORS origins** само до вашия домейн
4. **Настрой firewall** (вече направено в Стъпка 6)
5. **Използвай SSL** (ако имаш домейн)
6. **Регулярни backup-и** (ако имаш важни данни)

---

## 🐛 Troubleshooting

### Backend не стартира
```bash
# Проверка на логове
docker compose logs backend

# Проверка на Supabase connection
docker compose exec backend env | grep SPRING_DATASOURCE_URL
```

### Frontend не се зарежда
```bash
# Проверка на логове
docker compose logs frontend

# Проверка на build
docker compose exec frontend ls -la /app
```

### Nginx връща 502 Bad Gateway
```bash
# Проверка на nginx конфигурация
docker compose exec nginx nginx -t

# Проверка на статуса на backend и frontend
docker compose ps
```

### Проблеми с портове
```bash
# Проверка на отворените портове
netstat -tulpn | grep -E '80|443'

# Проверка на firewall
ufw status
```

---

## 📝 Чеклист за успешен деплой

- [ ] Cloud Server създаден в Hetzner
- [ ] SSH връзка работи
- [ ] Docker и Docker Compose инсталирани
- [ ] Проект клониран от GitHub
- [ ] `.env` файл създаден и попълнен
- [ ] Firewall настроен (портове 80, 443)
- [ ] Контейнерите стартирани успешно
- [ ] Health check работи
- [ ] Frontend достъпен на `http://YOUR_SERVER_IP`
- [ ] Backend API работи на `http://YOUR_SERVER_IP/api`
- [ ] (Опционално) Домейн настроен
- [ ] (Опционално) SSL сертификат инсталиран

---

## 🎯 Следващи стъпки

1. **Мониторинг:** Настрой мониторинг за сървъра
2. **Backup:** Настрой автоматични backup-и
3. **Updates:** Регулярно обновявай системата и приложението
4. **Logs:** Настрой централизирано съхранение на логове

---

**Успешен деплой!** 🎉

