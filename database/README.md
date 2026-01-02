# Database Setup

Това е директорията за database initialization scripts.

## Структура

- `init.sql` - SQL скрипт, който се изпълнява при първото създаване на базата данни

## Използване

### Автоматична инициализация

PostgreSQL контейнерът автоматично изпълнява SQL файловете от `/docker-entrypoint-initdb.d/` директорията при първото стартиране.

За да използваш `init.sql`, добави volume mapping в `docker-compose.yml`:

```yaml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

### Ръчна инициализация

Ако искаш да изпълниш SQL скрипт ръчно:

```bash
# Копирай файла в контейнера
docker cp database/init.sql phegon-hotel-postgres:/tmp/init.sql

# Изпълни в контейнера
docker exec -i phegon-hotel-postgres psql -U postgres -d phegonhotel -f /tmp/init.sql
```

### Backup и Restore

#### Backup

```bash
# Backup на цялата база
docker exec phegon-hotel-postgres pg_dump -U postgres phegonhotel > backup.sql

# Backup само на структурата
docker exec phegon-hotel-postgres pg_dump -U postgres -s phegonhotel > schema.sql

# Backup само на данните
docker exec phegon-hotel-postgres pg_dump -U postgres -a phegonhotel > data.sql
```

#### Restore

```bash
# Restore от backup файл
docker exec -i phegon-hotel-postgres psql -U postgres phegonhotel < backup.sql
```

### Миграция от Supabase

Ако искаш да мигрираш данни от Supabase към локалната база:

1. **Експортирай от Supabase:**
   ```bash
   # Използвай Supabase CLI или Dashboard за export
   ```

2. **Импортирай в локалната база:**
   ```bash
   docker exec -i phegon-hotel-postgres psql -U postgres phegonhotel < supabase_backup.sql
   ```

### Полезни команди

```bash
# Влез в PostgreSQL контейнера
docker exec -it phegon-hotel-postgres psql -U postgres -d phegonhotel

# Провери статуса на базата
docker exec phegon-hotel-postgres pg_isready -U postgres

# Списък на всички бази данни
docker exec phegon-hotel-postgres psql -U postgres -c "\l"

# Списък на всички таблици
docker exec phegon-hotel-postgres psql -U postgres -d phegonhotel -c "\dt"
```

