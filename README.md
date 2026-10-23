# Teleponik | Praktikum CRUD Angular

Aplikasi direktori telepon dengan frontend Angular, REST API Node.js, dan database SQLite. Menu **Daftar tugas** memakai endpoint publik JSONPlaceholder sesuai instruksi praktikum.

## Kebutuhan

- Node.js 22.5 atau lebih baru
- Koneksi internet untuk memuat Google Fonts dan JSONPlaceholder

Backend tidak memerlukan instalasi paket eksternal. Database dibuat otomatis di `backend/data/teleponik.sqlite` pada saat server pertama kali dijalankan.

## Menjalankan aplikasi

Buka dua terminal dari folder proyek ini.

Terminal 1, jalankan backend:

```powershell
node backend/server.js
```

Terminal 2, jalankan frontend:

```powershell
cd frontend
npm start
```

Buka `http://localhost:4200`. Endpoint kesehatan backend tersedia di `http://localhost:3000/api/health`.

## Endpoint REST

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/Pertemuan6` | Membaca semua kontak |
| GET | `/api/Pertemuan6/{id}` | Membaca satu kontak berdasarkan ID |
| POST | `/api/Pertemuan6` | Menambahkan kontak (HTTP 201) |
| PUT | `/api/Pertemuan6/{id}` | Mengganti data kontak (HTTP 204) |
| DELETE | `/api/Pertemuan6/{id}` | Menghapus kontak (HTTP 204) |
| GET | `/api/health` | Memeriksa status backend dan database |

## Struktur database

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | INTEGER | Primary key, bertambah otomatis |
| `Nama_User` | TEXT | Nama pengguna, wajib diisi |
| `Alamat` | TEXT | Alamat, wajib diisi |
| `No_Telp` | TEXT | Nomor telepon, wajib diisi |
| `kode_post` | TEXT | Kode pos, wajib diisi |
| `date_time` | TEXT | Waktu pencatatan, otomatis |

## Pengujian CRUD melalui REST API

Contoh PowerShell:

```powershell
$kontak = @{ Nama_User = 'Dina'; Alamat = 'Jl. Melati 8'; No_Telp = '08123456789'; kode_post = '40123' } | ConvertTo-Json
$baru = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/Pertemuan6 -ContentType 'application/json' -Body $kontak
Invoke-RestMethod -Uri "http://localhost:3000/api/Pertemuan6/$($baru.id)"
$perubahan = @{ Nama_User = 'Dina Putri'; Alamat = 'Jl. Melati 8'; No_Telp = '08123456789'; kode_post = '40123' } | ConvertTo-Json
Invoke-WebRequest -UseBasicParsing -Method Put -Uri "http://localhost:3000/api/Pertemuan6/$($baru.id)" -ContentType 'application/json' -Body $perubahan
Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "http://localhost:3000/api/Pertemuan6/$($baru.id)"
```

## JSONPlaceholder

Halaman **Daftar tugas** membaca `https://jsonplaceholder.typicode.com/todos` dan mendemonstrasikan GET, POST, PATCH, serta DELETE. JSONPlaceholder merupakan layanan demo: operasi tulis memberi respons sukses tetapi tidak menyimpan perubahan secara permanen.

## Laporan praktikum

Dokumentasi tujuan, arsitektur, skema, endpoint, alur pengujian, dan catatan demonstrasi tersedia di [LAPORAN.md](LAPORAN.md).