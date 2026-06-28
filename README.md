# 🎂 MyCakeShop

Platform e-commerce pemesanan kue modern yang memisahkan arsitektur Frontend (**Next.js 16**) dan Backend (**Laravel 12 REST API**). Sistem ini dilengkapi dengan integrasi alamat pengiriman berbasis peta interaktif (Leaflet) dan alur simulasi pembayaran digital QRIS.

## 🚀 Dokumentasi Pengguna & Admin
Panduan lengkap mengenai cara operasional sistem untuk **Pelanggan** dan **Administrator**, silakan kunjungi halaman dokumentasi GitHub Pages kami:
👉 **[Halaman Dokumentasi MyCakeShop](https://allutfi.github.io/MyCakeShop/)** *(atau buka file `docs/index.html` secara lokal)*

---

## 🛠️ Persyaratan Sistem (System Requirements)
Sebelum memulai instalasi, pastikan komputer Anda telah terpasang:
* **PHP >= 8.2**
* **Composer**
* **Node.js >= 20.x** & **NPM**
* **MySQL Database Server**

---

## 📂 Struktur Repositori
* `backend/` : Sumber kode API server berbasis framework Laravel 12.
* `frontend/` : Sumber kode aplikasi client (Single Page Application) berbasis Next.js 16 & Tailwind CSS v4.
* `docs/` : Sumber kode halaman dokumentasi publik (GitHub Pages).

---

## 💻 Panduan Instalasi Lokal (Developer Setup)

### 1. Setup Backend (Laravel API)
Ikuti perintah berikut untuk menyiapkan server API Laravel:

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Instal library dependensi PHP
composer install

# 3. Salin konfigurasi environment
cp .env.example .env

# 4. Buat kunci enkripsi aplikasi
php artisan key:generate
```

> **Catatan**: Buka file `.env` yang baru dibuat dan sesuaikan konfigurasi database Anda pada variabel berikut:
> ```env
> DB_CONNECTION=mysql
> DB_HOST=127.0.0.1
> DB_PORT=3306
> DB_DATABASE=mycakeshop
> DB_USERNAME=root
> DB_PASSWORD=sandi_mysql_anda
> ```

Setelah database dikonfigurasi dan dibuat, jalankan migrasi & data dummy:
```bash
# 5. Jalankan migrasi tabel database beserta data seeder produk kue
php artisan migrate --seed

# 6. Jalankan server lokal backend
php artisan serve
```
API server Anda sekarang berjalan di **`http://127.0.0.1:8000`**.

---

### 2. Setup Frontend (Next.js client)
Ikuti perintah berikut di terminal terpisah untuk menyiapkan tampilan web Next.js:

```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Instal library dependensi Node.js
npm install

# 3. Buat file environment lokal (.env.local)
# Isi file tersebut dengan URL backend Laravel Anda:
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > .env.local

# 4. Jalankan server pengembangan lokal
npm run dev
```
Aplikasi web Next.js Anda sekarang berjalan di **`http://localhost:3000`**. Buka alamat tersebut di browser Anda untuk mulai menguji.

---

## 👥 Tim Pengembang
Proyek ini dikembangkan secara kolaboratif oleh:
* **Maulana Ishaq** — Project Manager
* **Mokhamad Lutfi** — Fullstack Engineer
* **Muhammad Naufal Deewana** — Frontend Engineer
* **Rendy Arifandi** — Frontend Engineer
