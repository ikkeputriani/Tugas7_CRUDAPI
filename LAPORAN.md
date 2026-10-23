# Laporan Praktikum: CRUD Frontend Angular dan REST API

**Nama aplikasi:** Teleponik  
**Teknologi:** Angular, Node.js, SQLite, JSONPlaceholder  
**Tanggal:** 2 Oktober 2026

## Tujuan

Menerapkan proses Create, Read, Update, dan Delete melalui REST API pada frontend Angular. Data kontak terhubung ke backend lokal, sedangkan daftar tugas menggunakan API publik JSONPlaceholder sesuai instruksi praktikum.

## Arsitektur

1. **Frontend:** Angular menyediakan halaman direktori telepon, formulir tambah/edit, pencarian, dan halaman daftar tugas.
2. **Backend:** Node.js menyediakan REST API pada `http://localhost:3000/api/Pertemuan6`, mengikuti pola endpoint pada referensi praktikum.
3. **Database:** SQLite menyimpan data persisten pada `backend/data/teleponik.sqlite`.
4. **API publik:** Halaman daftar tugas terhubung ke `https://jsonplaceholder.typicode.com/todos`.

## Struktur tabel

| Field | Tipe | Aturan |
| --- | --- | --- |
| `id` | INTEGER | Primary key dan auto-increment |
| `Nama_User` | TEXT | Wajib, maksimal 100 karakter |
| `Alamat` | TEXT | Wajib, maksimal 250 karakter |
| `No_Telp` | TEXT | Wajib, maksimal 30 karakter |
| `kode_post` | TEXT | Wajib, maksimal 10 karakter |
| `date_time` | TEXT | Waktu pencatatan otomatis |

Nama dan kapitalisasi field mengikuti instruksi tugas backend.

## Endpoint backend

| Method | Endpoint | Hasil |
| --- | --- | --- |
| GET | `/api/Pertemuan6` | Daftar semua kontak |
| GET | `/api/Pertemuan6/{id}` | Detail kontak berdasarkan ID |
| POST | `/api/Pertemuan6` | Kontak baru (HTTP 201) |
| PUT | `/api/Pertemuan6/{id}` | Mengganti seluruh field (HTTP 204) |
| DELETE | `/api/Pertemuan6/{id}` | Menghapus kontak (HTTP 204) |
| GET | `/api/health` | Status server dan database |

Field kontak divalidasi di backend sebelum data ditulis ke database. Endpoint memberi respons dan kode HTTP yang sesuai, termasuk `400` untuk data tidak valid dan `404` untuk ID yang tidak ditemukan. Backend juga mempertahankan alias `/api/telephones` untuk kompatibilitas.

## Implementasi frontend

Halaman direktori menampilkan data yang dibaca dari backend. Form **Cari satu data** mengirim GET ke `/api/Pertemuan6/{id}` dan menampilkan record yang ditemukan; ID yang tidak ada menghasilkan pesan tidak ditemukan. Tombol tambah dan ubah membuka formulir; simpan mengirim POST atau PUT. Penghapusan mengirim DELETE setelah konfirmasi. Pencarian daftar menyaring nama, nomor, alamat, dan kode pos. Tampilan menyediakan status loading, pesan error, serta konfirmasi operasi.

## Kesesuaian dengan referensi PDF

| Praktik pada PDF | Implementasi pada proyek |
| --- | --- |
| API Get | Direktori membaca seluruh record dari `GET /api/Pertemuan6` |
| API Post | Form tambah mengirim `Nama_User`, `Alamat`, `No_Telp`, dan `kode_post`; `id` serta `date_time` dibuat backend |
| API Get with ID | Form **Cari satu data** meminta satu record melalui `GET /api/Pertemuan6/{id}` |
| API Put | Form ubah mengirim semua field ke `PUT /api/Pertemuan6/{id}`; respons sukses `204 No Content` |
| API Delete | Aksi hapus mengirim `DELETE /api/Pertemuan6/{id}`; respons sukses `204 No Content` |

Seluruh operasi tersebut menggunakan database SQLite lokal yang sama, sehingga perubahan POST, PUT, dan DELETE terlihat pada hasil GET. Implementasi backend menggunakan Node.js/SQLite, bukan ASP.NET Core/SQL Server seperti alat pada gambar referensi; kontrak route dan perilaku CRUD disesuaikan dengan dokumentasi tugas.

Menu **Daftar tugas** membaca 12 tugas dari JSONPlaceholder. Pengguna dapat menambah tugas (POST), mengubah status selesai (PATCH), dan menghapus tugas (DELETE). API tersebut hanya mensimulasikan perubahan dan tidak menyimpan operasi tulis secara permanen.

## Pengujian

Jalankan backend dan frontend secara bersamaan, lalu buka `http://localhost:4200`. Uji CRUD kontak melalui formulir; data tetap tersedia setelah server dimulai ulang karena disimpan di SQLite. Pengujian tambahan dengan PowerShell tersedia pada README proyek.

| Skenario | Hasil yang diharapkan |
| --- | --- |
| Membuka direktori | Daftar kontak contoh tampil dari endpoint GET |
| Menambahkan kontak | Kontak baru muncul dan tersimpan di SQLite |
| Mengubah kontak | Nilai baru tampil pada daftar |
| Menghapus kontak | Kontak hilang dari daftar dan database |
| Membuka daftar tugas | Data demo dimuat dari JSONPlaceholder |
| Menandai tugas selesai | Status tampilan berubah melalui PATCH |

## Cara menjalankan

Lihat [README.md](README.md) untuk prasyarat, perintah menjalankan, dan contoh pengujian endpoint melalui PowerShell.