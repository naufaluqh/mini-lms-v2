# Mini LMS V2.0 - Enterprise Learning Management System

Mini LMS V2.0 adalah platform manajemen pelatihan karyawan (Learning Management System) berbasis web yang dirancang dengan arsitektur **Full-Stack JavaScript**. Sistem ini berfokus pada efisiensi manajemen kompetensi, pengamanan data berbasis peran (RBAC), serta otomatisasi pelaporan dokumen internal divisi Learning & Development (L&D).

---

## 🚀 Fitur Utama

*   **Secure Authentication & Session Management:** Registrasi dan login menggunakan enkripsi password satu arah via `bcryptjs` dan penerbitan token digital berbasis `jsonwebtoken` (JWT) yang disimpan secara aman.
*   **Role-Based Access Control (RBAC):** Pembatasan hak akses rute API dan visualisasi dasbor yang ketat untuk 3 level pengguna: `admin`, `manager`, dan `karyawan`.
*   **Course & Content Management CMS:** Panel khusus manajemen kompetensi yang memungkinkan Admin/Manager untuk membuat kelas pelatihan baru serta menyisipkan materi modul secara dinamis ke database.
*   **Enterprise Automation & Data Reporting:**
    *   **Ekspor Laporan Excel:** Otomatisasi penarikan data seluruh karyawan dari database langsung menjadi berkas spreadsheet (.xlsx) siap pakai menggunakan `exceljs`.
    *   **Automated Certificate Generation:** Pembuatan sertifikat kelulusan dalam bentuk dokumen PDF dinamis berbasis data user menggunakan `pdf-lib` dan dikirimkan otomatis melalui integrasi `nodemailer`.
*   **Modern Responsive Dashboard:** Tampilan UI dasbor interaktif menggunakan Vanilla JavaScript (Fetch API) dan utilitas gaya modern dari **Tailwind CSS**.

---

## 🛠️ Tech Stack & Arsitektur

### Backend & Database
*   **Runtime Environment:** Node.js (v24.x)
*   **Framework:** Express.js (v5.x - Menggunakan penanganan pencocokan rute terbaru)
*   **Database ODM:** MongoDB & Mongoose (Koneksi asinkron lokal port 27017)
*   **Keamanan:** Bcrypt.js (Hashing), JWT (Tokenization)

### Frontend
*   **Struktur UI:** HTML5 & Vanilla JavaScript (DOM Manipulation & Asynchronous Fetch)
*   **Sistem Desain:** Tailwind CSS via CDN

---

## 📂 Struktur Direktori Proyek

```text
mini-lms-v2/
├── config/
│   └── db.js                # Konfigurasi koneksi asinkron MongoDB
├── controllers/
│   ├── authController.js    # Logika bisnis Registrasi & Login JWT
│   └── courseController.js  # Logika CRUD Kelas & append materi
├── middleware/
│   └── authMiddleware.js    # Middleware validasi JWT & Guarding Role (RBAC)
├── models/
│   ├── User.js              # Skema data user & pre-save hook bcrypt
│   └── Course.js            # Skema data kelas & array modul materi
├── public/                  # Folder statis frontend UI
│   ├── index.html           # Halaman Login Utama
│   ├── admin.html           # Dasbor CMS Admin & Laporan L&D
│   └── karyawan.html        # Dasbor Belajar & Sertifikat Karyawan
├── routes/
│   ├── courseRoutes.js      # Endpoint API Kelas & Modul
│   └── reportRoutes.js      # Endpoint Otomatisasi Laporan Excel/PDF
├── .env                     # File konfigurasi Environment Variables
├── server.js                # Entry point utama Express server
└── package.json             # Dependensi pihak ketiga