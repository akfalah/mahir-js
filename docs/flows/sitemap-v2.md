# Sitemap Mahir.js V2

## 1. Tujuan Sitemap

Sitemap digunakan untuk menggambarkan struktur halaman pada sistem Mahir.js. Sitemap menjadi dasar dalam pembuatan rancangan antarmuka di Figma dan pengembangan routing pada aplikasi frontend.

---

## 2. Struktur Halaman Publik

Halaman publik dapat diakses oleh Guest dan Student.

```txt
/
├── Landing Page
│
├── /concepts
│   └── Daftar Concept
│
├── /concepts/[conceptSlug]
│   └── Detail Concept
│       └── Daftar Material
│
├── /concepts/[conceptSlug]/materials/[materialSlug]
│   └── Detail Material
│       └── Daftar Study Case
│
└── /concepts/[conceptSlug]/materials/[materialSlug]/study-cases/[studyCaseSlug]
    └── Detail Study Case
        ├── Instruksi soal
        ├── Code editor
        ├── Run test
        ├── Submit jawaban
        └── Feedback pengujian
```

## 3. Struktur Halaman Autentikasi

Halaman autentikasi digunakan oleh Guest untuk masuk atau mendaftar ke sistem.

```txt
/sign-in
└── Halaman Sign In

/sign-up
└── Halaman Sign Up
```

## 4. Struktur Halaman Student

Halaman Student hanya dapat diakses oleh pengguna dengan role Student.

```txt
/learn
├── Learning Dashboard
│   ├── Ringkasan progress belajar
│   ├── Learning path
│   └── Submission terbaru
│
├── /learn/progress
│   └── Detail Progress Belajar
│
├── /learn/submissions
│   └── Riwayat Submission
│       └── Detail Submission
│
└── /profile
    └── Profile Student
```

## 5. Struktur Halaman Admin

Halaman Admin hanya dapat diakses oleh pengguna dengan role Admin.

```txt
/admin
├── Admin Dashboard
│
├── /admin/users
│   ├── Daftar User
│   ├── Tambah User
│   └── Edit User
│
├── /admin/concepts
│   ├── Daftar Concept
│   ├── Tambah Concept
│   └── Edit Concept
│
├── /admin/materials
│   ├── Daftar Material
│   ├── Tambah Material
│   └── Edit Material
│
├── /admin/study-cases
│   ├── Daftar Study Case
│   ├── Tambah Study Case
│   └── Edit Study Case
│
├── /admin/test-cases
│   ├── Daftar Test Case
│   ├── Tambah Test Case
│   └── Edit Test Case
│
└── /admin/submissions
    ├── Daftar Submission
    └── Detail Submission
```

## 6. Ringkasan Sitemap

Sitemap Mahir.js V2 dibagi menjadi empat kelompok utama, yaitu halaman publik, halaman autentikasi, halaman Student, dan halaman Admin. Halaman publik berfokus pada akses konten pembelajaran. Halaman Student berfokus pada proses belajar, pengerjaan study case, progress, dan riwayat submission. Halaman Admin berfokus pada pengelolaan data sistem dan konten pembelajaran.