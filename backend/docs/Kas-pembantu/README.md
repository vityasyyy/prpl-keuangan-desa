# 📖 Kas Pembantu API Documentation
## (Kegiatan, Panjar, Pajak)

---

## 🔐 Authentication

Semua endpoint memerlukan autentikasi. Token disimpan dalam httpOnly cookie setelah login.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Login success",
  "data": {
    "user": { "id": "uuid", "email": "admin@example.com", "name": "Admin" }
  }
}
```

---

## 📚 API Endpoints

### Base URL
```
http://localhost:8081/api
```

---

## 1️⃣ KEGIATAN (Buku Kas Pembantu Kegiatan)

### Get All Kegiatan
```http
GET /api/kas-pembantu/kegiatan?showAll=true
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| showAll | boolean | No | true = semua data, false = per bulan |

**Response:** `200 OK`
```json
{
  "status": true,
  "data": [
    {
      "id": "uuid",
      "tanggal": "2024-01-15",
      "no_bukti": "BKT-001",
      "kode_rekening": "5.1.1.01",
      "uraian": "Belanja ATK",
      "penerimaan": 0,
      "pengeluaran": 500000,
      "saldo": 500000,
      "bku_id": "uuid"
    }
  ]
}
```

### Get Kegiatan by ID
```http
GET /api/kas-pembantu/kegiatan/:id
```

### Get Bidang List
```http
GET /api/kas-pembantu/kegiatan/bidang
```

### Get Sub-Bidang by Bidang ID
```http
GET /api/kas-pembantu/kegiatan/sub-bidang/:id
```

### Get Kegiatan by Sub-Bidang ID
```http
GET /api/kas-pembantu/kegiatan/sub-bidang/kegiatan/:id
```

### Create Kegiatan
```http
POST /api/kas-pembantu/kegiatan
Content-Type: application/json

{
  "tanggal": "2024-01-15",
  "no_bukti": "BKT-001",
  "kode_rekening": "5.1.1.01",
  "uraian": "Belanja ATK",
  "penerimaan": 0,
  "pengeluaran": 500000,
  "bku_id": "uuid"
}
```

**Response:** `201 Created`

### Update Kegiatan
```http
PUT /api/kas-pembantu/kegiatan/:id
Content-Type: application/json

{
  "tanggal": "2024-01-16",
  "no_bukti": "BKT-001-REV",
  "uraian": "Belanja ATK (Revisi)",
  "pengeluaran": 550000
}
```

**Response:** `200 OK`

### Delete Kegiatan
```http
DELETE /api/kas-pembantu/kegiatan/:id
```

**Response:** `200 OK` atau `204 No Content`

### Export Kegiatan
```http
GET /api/kas-pembantu/kegiatan/export
```

**Response:** Excel file (.xlsx)

---

## 2️⃣ PANJAR (Buku Kas Pembantu Panjar)

### Get All Panjar
```http
GET /api/kas-pembantu/panjar
```

### Get Panjar by ID
```http
GET /api/kas-pembantu/panjar/:id
```

### Create Panjar
```http
POST /api/kas-pembantu/panjar
Content-Type: application/json

{
  "tanggal": "2024-01-15",
  "no_bukti": "PJR-001",
  "uraian": "Panjar perjalanan dinas",
  "pemberian": 1000000,
  "pertanggungjawaban": 0,
  "bku_id": "uuid"
}
```

**Field Description:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tanggal | date | Yes | Tanggal transaksi |
| no_bukti | string | Yes | Nomor bukti |
| uraian | string | Yes | Keterangan |
| pemberian | number | No* | Jumlah pemberian panjar |
| pertanggungjawaban | number | No* | Jumlah pertanggungjawaban |
| bku_id | uuid | Yes | ID referensi BKU |

*Salah satu harus diisi (pemberian ATAU pertanggungjawaban)

### Update Panjar
```http
PUT /api/kas-pembantu/panjar/:id
Content-Type: application/json
```

### Delete Panjar
```http
DELETE /api/kas-pembantu/panjar/:id
```

### Export Panjar
```http
GET /api/kas-pembantu/panjar/export
```

---

## 3️⃣ PAJAK (Buku Kas Pembantu Pajak)

### Get All Pajak
```http
GET /api/kas-pembantu/pajak
```

### Get Pajak by ID
```http
GET /api/kas-pembantu/pajak/:id
```

### Create Pajak
```http
POST /api/kas-pembantu/pajak
Content-Type: application/json

{
  "tanggal": "2024-01-15",
  "no_bukti": "PJK-001",
  "uraian": "PPh 21 Januari",
  "pemotongan": 500000,
  "penyetoran": 0,
  "bku_id": "uuid"
}
```

**Field Description:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| tanggal | date | Yes | Tanggal transaksi |
| no_bukti | string | Yes | Nomor bukti |
| uraian | string | Yes | Keterangan |
| pemotongan | number | No* | Jumlah pajak dipotong |
| penyetoran | number | No* | Jumlah pajak disetor |
| bku_id | uuid | Yes | ID referensi BKU |

*Salah satu harus diisi (pemotongan ATAU penyetoran)

### Update Pajak
```http
PUT /api/kas-pembantu/pajak/:id
Content-Type: application/json
```

### Delete Pajak
```http
DELETE /api/kas-pembantu/pajak/:id
```

### Export Pajak
```http
GET /api/kas-pembantu/pajak/export
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation error",
  "errors": ["tanggal is required", "bku_id is required"]
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Internal server error"
}
```

---

## 🧪 Testing

File test tersedia di direktori ini:
- `test_kegiatan.rest` - Test cases untuk modul Kegiatan
- `test_panjar.rest` - Test cases untuk modul Panjar  
- `test_pajak.rest` - Test cases untuk modul Pajak
- `TEST_SCENARIOS.md` - Daftar skenario testing
- `TEST_RESULTS.md` - Template hasil testing

### Menjalankan Test dengan REST Client (VS Code)
1. Install extension "REST Client" di VS Code
2. Buka file `.rest`
3. Klik "Send Request" pada setiap request
4. Login terlebih dahulu sebelum test endpoint lain

---

## 📞 Contact

Jika ada pertanyaan, hubungi tim development.
