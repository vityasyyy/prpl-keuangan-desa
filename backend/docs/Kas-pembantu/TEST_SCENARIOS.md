# 📋 Test Scenarios - Modul Kas Pembantu
## (Kegiatan, Panjar, Pajak)

---

## 🎯 Test Matrix

### Legend
- ✅ = Test Pass
- ❌ = Test Fail
- ⏸️ = Pending/Skipped
- 🔄 = In Progress

---

## 1️⃣ MODUL KEGIATAN (Buku Kas Pembantu Kegiatan)

### A. Functional Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-K-01 | GET /kegiatan?showAll=true | 200 OK, Array data | | |
| TC-K-02 | GET /kegiatan/:id (valid) | 200 OK, Single object | | |
| TC-K-03 | GET /kegiatan/:id (invalid) | 404 Not Found | | |
| TC-K-04 | GET /kegiatan/bidang | 200 OK, Array bidang | | |
| TC-K-05 | GET /kegiatan/sub-bidang/:id | 200 OK, Array sub-bidang | | |
| TC-K-06 | GET /kegiatan/sub-bidang/kegiatan/:id | 200 OK, Array kegiatan | | |
| TC-K-07 | POST /kegiatan (valid) | 201 Created | | |
| TC-K-08 | POST /kegiatan (missing tanggal) | 400 Bad Request | | |
| TC-K-09 | POST /kegiatan (missing bku_id) | 400 Bad Request | | |
| TC-K-10 | POST /kegiatan (invalid bku_id) | 400/404 Error | | |
| TC-K-11 | PUT /kegiatan/:id (valid) | 200 OK | | |
| TC-K-12 | PUT /kegiatan/:id (invalid) | 404 Not Found | | |
| TC-K-13 | DELETE /kegiatan/:id (valid) | 200/204 OK | | |
| TC-K-14 | DELETE /kegiatan/:id (invalid) | 404 Not Found | | |
| TC-K-15 | GET /kegiatan/export | 200 OK, Excel file | | |

### B. Business Logic Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-K-BL-01 | Saldo calculation setelah create | Saldo dihitung benar | | |
| TC-K-BL-02 | Saldo update setelah edit | Saldo diupdate benar | | |
| TC-K-BL-03 | Data grouping per bulan | Data dikelompokkan benar | | |

---

## 2️⃣ MODUL PANJAR (Buku Kas Pembantu Panjar)

### A. Functional Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-P-01 | GET /panjar | 200 OK, Array data | | |
| TC-P-02 | GET /panjar/:id (valid) | 200 OK, Single object | | |
| TC-P-03 | GET /panjar/:id (invalid) | 404 Not Found | | |
| TC-P-04 | POST /panjar (pemberian) | 201 Created | | |
| TC-P-05 | POST /panjar (pertanggungjawaban) | 201 Created | | |
| TC-P-06 | POST /panjar (missing tanggal) | 400 Bad Request | | |
| TC-P-07 | POST /panjar (missing bku_id) | 400 Bad Request | | |
| TC-P-08 | POST /panjar (invalid bku_id) | 400/404 Error | | |
| TC-P-09 | PUT /panjar/:id (valid) | 200 OK | | |
| TC-P-10 | PUT /panjar/:id (invalid) | 404 Not Found | | |
| TC-P-11 | DELETE /panjar/:id (valid) | 200/204 OK | | |
| TC-P-12 | DELETE /panjar/:id (invalid) | 404 Not Found | | |
| TC-P-13 | GET /panjar/export | 200 OK, Excel file | | |

### B. Business Logic Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-P-BL-01 | Saldo = Σpemberian - Σpertanggungjawaban | Saldo dihitung benar | | |
| TC-P-BL-02 | Saldo tidak boleh negatif? | Validasi/warning | | |
| TC-P-BL-03 | Pertanggungjawaban > pemberian? | Business rule check | | |

---

## 3️⃣ MODUL PAJAK (Buku Kas Pembantu Pajak)

### A. Functional Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-T-01 | GET /pajak | 200 OK, Array data | | |
| TC-T-02 | GET /pajak/:id (valid) | 200 OK, Single object | | |
| TC-T-03 | GET /pajak/:id (invalid) | 404 Not Found | | |
| TC-T-04 | POST /pajak (pemotongan) | 201 Created | | |
| TC-T-05 | POST /pajak (penyetoran) | 201 Created | | |
| TC-T-06 | POST /pajak (missing tanggal) | 400 Bad Request | | |
| TC-T-07 | POST /pajak (missing bku_id) | 400 Bad Request | | |
| TC-T-08 | POST /pajak (invalid bku_id) | 400/404 Error | | |
| TC-T-09 | POST /pajak (negative amount) | 400 Bad Request | | |
| TC-T-10 | PUT /pajak/:id (valid) | 200 OK | | |
| TC-T-11 | PUT /pajak/:id (invalid) | 404 Not Found | | |
| TC-T-12 | DELETE /pajak/:id (valid) | 200/204 OK | | |
| TC-T-13 | DELETE /pajak/:id (invalid) | 404 Not Found | | |
| TC-T-14 | GET /pajak/export | 200 OK, Excel file | | |

### B. Business Logic Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-T-BL-01 | Saldo = Σpemotongan - Σpenyetoran | Saldo dihitung benar | | |
| TC-T-BL-02 | Saldo tidak boleh negatif? | Validasi/warning | | |
| TC-T-BL-03 | Penyetoran > pemotongan? | Business rule check | | |

---

## 4️⃣ CROSS-MODULE TESTING

### A. Authentication Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-AUTH-01 | Akses endpoint tanpa login | 401 Unauthorized | | |
| TC-AUTH-02 | Akses dengan token expired | 401 Unauthorized | | |
| TC-AUTH-03 | Akses setelah login | 200 OK | | |

### B. Integration Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-INT-01 | Create kegiatan → cek di frontend | Data muncul di UI | | |
| TC-INT-02 | Edit kegiatan → cek di frontend | Data terupdate di UI | | |
| TC-INT-03 | Delete kegiatan → cek di frontend | Data hilang dari UI | | |
| TC-INT-04 | Relasi BKU ↔ Kegiatan | Foreign key valid | | |

---

## 5️⃣ NON-FUNCTIONAL TESTING

### A. Performance Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-PERF-01 | Response time < 2 detik | ≤ 2000ms | | |
| TC-PERF-02 | Load 100 data sekaligus | Berhasil tanpa timeout | | |

### B. Security Testing

| No | Test Case | Expected Result | Status | Notes |
|----|-----------|-----------------|--------|-------|
| TC-SEC-01 | SQL Injection di parameter | Tidak vulnerable | | |
| TC-SEC-02 | XSS di field uraian | Sanitized | | |

---

## 📝 Test Execution Log

### Session 1: [Tanggal]
**Tester:** [Nama]
**Environment:** localhost:8081 (Docker)

| Time | Test Case | Result | Bug ID |
|------|-----------|--------|--------|
| | | | |

### Bugs Found

| Bug ID | Description | Severity | Status |
|--------|-------------|----------|--------|
| | | | |

---

## ✅ Sign-Off Checklist

- [ ] Semua functional test PASS
- [ ] Semua business logic test PASS
- [ ] Authentication test PASS
- [ ] Integration test PASS
- [ ] No critical/high bugs open
- [ ] Documentation updated

**QA Sign-Off Date:** ___________
**QA Tester:** ___________
