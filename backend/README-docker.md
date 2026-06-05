# 🐳 Laravel + MySQL Docker Environment

## Struktur Folder

```
project/
├── docker-compose.yml
├── Dockerfile
├── .env.docker
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   ├── php/
│   │   └── local.ini
│   └── mysql/
│       └── my.cnf
└── src/              ← Folder project Laravel kamu
```

## Port yang Digunakan

| Service      | Port   |
|-------------|--------|
| Laravel App  | :8000  |
| phpMyAdmin   | :8080  |
| MySQL        | :3306  |

---

## 🚀 Langkah Setup

### 1. Siapkan struktur folder

```bash
mkdir my-laravel-project && cd my-laravel-project
# Salin semua file Docker ke sini
mkdir -p docker/nginx docker/php docker/mysql src
```

### 2. Install Laravel baru (jika belum ada project)

```bash
# Jalankan container dulu sementara untuk install Laravel
docker run --rm -v $(pwd)/src:/app composer create-project laravel/laravel . "^11"
```

> **Catatan:** Laravel v13 belum dirilis secara resmi. Versi stabil terbaru adalah Laravel 11/12.
> Gunakan perintah di atas untuk Laravel 11, atau ubah `"^11"` menjadi `"^12"` jika tersedia.

### 3. Copy file environment

```bash
cp .env.docker .env
```

### 4. Sesuaikan `.env` di dalam folder `src/`

Edit `src/.env` dan sesuaikan bagian database:

```env
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=laravelpassword
```

### 5. Jalankan Docker Compose

```bash
docker-compose up -d --build
```

### 6. Generate key & migrate

```bash
docker exec laravel_app php artisan key:generate
docker exec laravel_app php artisan migrate
```

---

## 🔧 Perintah Berguna

```bash
# Masuk ke container app
docker exec -it laravel_app bash

# Jalankan artisan
docker exec laravel_app php artisan <command>

# Install composer package
docker exec laravel_app composer require <package>

# Install npm package
docker exec laravel_app npm install

# Lihat log
docker-compose logs -f app

# Stop semua container
docker-compose down

# Stop + hapus volume (database reset)
docker-compose down -v
```

---

## 🌐 Akses Aplikasi

- **Laravel:** http://localhost:8000
- **phpMyAdmin:** http://localhost:8080
  - Server: `db`
  - Username: `laravel`
  - Password: `laravelpassword`
