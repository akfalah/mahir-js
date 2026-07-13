# User Flow Mahir.js V2

## 1. Tujuan User Flow

User flow digunakan untuk menggambarkan alur utama pengguna ketika menggunakan sistem Mahir.js. Alur ini menjadi dasar dalam penyusunan sitemap, rancangan antarmuka, dan pengembangan fitur sistem.

Aktor utama dalam sistem Mahir.js terdiri atas Guest, Student, dan Admin.

---

## 2. User Flow Guest

Guest merupakan pengguna yang belum masuk ke dalam sistem. Guest dapat mengakses halaman publik untuk melihat informasi umum dan konten pembelajaran yang dipublikasikan.

```txt
Guest membuka landing page
↓
Guest melihat informasi sistem Mahir.js
↓
Guest membuka daftar concept
↓
Guest memilih concept
↓
Guest membaca material atau melihat study case
↓
Guest memilih sign in / sign up jika ingin mengerjakan study case
```

**Catatan**

Guest hanya dapat mengakses konten yang bersifat publik. Untuk menjalankan test, submit jawaban, melihat progress, dan riwayat submission, Guest harus masuk sebagai Student.

## 3. User Flow Student

Student merupakan pengguna yang telah login dan dapat mengikuti proses pembelajaran secara penuh.

```txt
Student melakukan sign in
↓
Sistem mengarahkan Student ke learning dashboard
↓
Student melihat ringkasan progress belajar
↓
Student memilih concept
↓
Student memilih material
↓
Student membaca materi
↓
Student membuka study case
↓
Student membaca instruksi soal
↓
Student menulis kode pada code editor
↓
Student menjalankan test
↓
Sistem menampilkan hasil pengujian
↓
Jika test gagal, Student memperbaiki kode
↓
Jika seluruh test passed, Student mengirim jawaban
↓
Sistem menyimpan submission
↓
Sistem memperbarui progress belajar
↓
Student melihat feedback dan status progress
```

**Catatan**

Fitur run test digunakan untuk menguji kode tanpa menyimpan submission. Fitur submit digunakan untuk menyimpan jawaban dan memperbarui progress jika seluruh test berhasil.

## 4. User Flow Admin

Admin merupakan pengguna yang memiliki hak akses untuk mengelola data sistem dan konten pembelajaran.

```txt
Admin melakukan sign in
↓
Sistem mengarahkan Admin ke admin dashboard
↓
Admin melihat ringkasan data sistem
↓
Admin memilih menu pengelolaan
↓
Admin mengelola pengguna, concept, material, study case, test case, atau submission
↓
Admin menambah, mengubah, menghapus, atau mempublikasikan data
↓
Sistem menyimpan perubahan
↓
Data diperbarui dan dapat digunakan pada halaman pembelajaran
```

## 5. User Flow Automated Grading

Automated grading merupakan proses internal sistem ketika Student menjalankan test atau mengirim jawaban.

```txt
Student menjalankan test atau submit jawaban
↓
Frontend mengirim kode dan studyCaseId ke backend
↓
Backend memvalidasi request
↓
Backend mengambil data study case dan test case
↓
Backend mengirim kode ke automated grading worker
↓
Worker membuat file sementara untuk kode dan test
↓
Worker menjalankan Jest
↓
Worker membaca hasil pengujian
↓
Backend menerima hasil grading
↓
Jika submit, backend menyimpan submission dan test result
↓
Jika seluruh test passed, backend memperbarui progress belajar
↓
Frontend menampilkan feedback kepada Student
```

## 6. Ringkasan Alur Utama

Alur utama sistem Mahir.js berpusat pada proses pembelajaran Student. Student membaca materi, mengerjakan study case, menjalankan test, memperbaiki kode berdasarkan feedback, dan mengirim jawaban. Admin mendukung proses tersebut dengan mengelola konten pembelajaran dan test case yang digunakan oleh automated grading system.