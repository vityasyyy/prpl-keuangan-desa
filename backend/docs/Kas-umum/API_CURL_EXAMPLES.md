# API cURL Examples - Buku Kas Umum

## Base URL
```bash
API_BASE_URL="http://localhost:3001/api"
```

---

## 1. Create Buku Kas Umum Entry (POST)

### Required Fields
- `tanggal` (string, format: YYYY-MM-DD) - Transaction date
- `rab_id` (string) - RAB (Rencana Anggaran Biaya) ID reference
- `kode_ekonomi_id` (string) - Economic code ID from kode_ekonomi table
- `kegiatan_id` (string) - Activity ID from kode_fungsi table (level=3)
- `pemasukan` (number) - Income amount (must be > 0 if pengeluaran is 0)
- `pengeluaran` (number) - Expense amount (must be > 0 if pemasukan is 0)

### Optional Fields
- `uraian` (string) - Description/notes
- `nomor_bukti` (string) - Receipt/proof number

### Business Rules
- Either `pemasukan` OR `pengeluaran` must be filled (not both)
- The system automatically calculates `saldo_after` based on previous balance

### Example 1: Income Transaction (Pemasukan)

```bash
curl -X POST http://localhost:3001/api/kas-umum \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-01-15",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke001",
    "kegiatan_id": "kf003",
    "uraian": "Penerimaan Dana Desa Tahap 1",
    "pemasukan": 50000000,
    "pengeluaran": 0,
    "nomor_bukti": "BKT-001/2025"
  }'
```

### Example 2: Expense Transaction (Pengeluaran)

```bash
curl -X POST http://localhost:3001/api/kas-umum \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-01-16",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke003",
    "kegiatan_id": "kf003",
    "uraian": "Pembayaran Honorarium Perangkat Desa",
    "pemasukan": 0,
    "pengeluaran": 5000000,
    "nomor_bukti": "BKT-002/2025"
  }'
```

### Success Response (201 Created)
```json
{
  "message": "Data Kas Umum berhasil ditambahkan",
  "data": {
    "id": "bku123456",
    "tanggal": "2025-01-15T00:00:00.000Z",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke001",
    "kode_fungsi_id": "kf003",
    "uraian": "Penerimaan Dana Desa Tahap 1",
    "penerimaan": 50000000,
    "pengeluaran": 0,
    "no_bukti": "BKT-001/2025",
    "saldo_after": 50000000,
    "kode_ekonomi_full": "4",
    "kode_ekonomi_uraian": "BELANJA",
    "kode_fungsi_full": "1.1.01",
    "kode_fungsi_uraian": "Administrasi Pemerintahan Desa"
  }
}
```

### Error Responses

**Missing tanggal (400 Bad Request)**
```json
{
  "status": 400,
  "error": "tanggal_required",
  "hint": "Format: YYYY-MM-DD"
}
```

**Missing rab_id (400 Bad Request)**
```json
{
  "status": 400,
  "error": "rab_id_required",
  "hint": "RAB ID tidak ditemukan"
}
```

**Missing kode_ekonomi_id (400 Bad Request)**
```json
{
  "status": 400,
  "error": "kode_ekonomi_required",
  "hint": "Kode Ekonomi harus dipilih"
}
```

**Missing kegiatan_id (400 Bad Request)**
```json
{
  "status": 400,
  "error": "kegiatan_required",
  "hint": "Kegiatan harus dipilih dari dropdown"
}
```

**Missing both amounts (400 Bad Request)**
```json
{
  "status": 400,
  "error": "amount_required",
  "hint": "Harus mengisi Pemasukan atau Pengeluaran"
}
```

**Both amounts filled (400 Bad Request)**
```json
{
  "status": 400,
  "error": "amount_conflict",
  "hint": "Tidak boleh mengisi Pemasukan dan Pengeluaran sekaligus"
}
```

---

## 2. Get Buku Kas Umum List (GET)

### Query Parameters
- `month` (required, string) - Format: YYYY-MM or YYYY-MM-DD
- `rabId` (optional, string) - Filter by specific RAB ID
- `rkkId` (optional, string) - Filter by RKK ID (if rabId not provided)

### Example 1: Get by Month

```bash
curl -X GET "http://localhost:3001/api/kas-umum?month=2025-01"
```

### Example 2: Get by Month and RAB ID

```bash
curl -X GET "http://localhost:3001/api/kas-umum?month=2025-01&rabId=rab001"
```

### Success Response (200 OK)
```json
{
  "meta": {
    "month": "2025-01"
  },
  "summary": {
    "total_pemasukan": "50000000",
    "total_pengeluaran": "5000000",
    "total_netto": "45000000"
  },
  "rows": [
    {
      "no": 1,
      "tanggal": "2025-01-15T00:00:00.000Z",
      "kode_rekening": "4",
      "uraian": "Penerimaan Dana Desa Tahap 1",
      "pemasukan": "50000000",
      "pengeluaran": "0",
      "no_bukti": "BKT-001/2025",
      "netto_transaksi": "50000000",
      "saldo": "50000000"
    },
    {
      "no": 2,
      "tanggal": "2025-01-16T00:00:00.000Z",
      "kode_rekening": "4.1.1",
      "uraian": "Pembayaran Honorarium Perangkat Desa",
      "pemasukan": "0",
      "pengeluaran": "5000000",
      "no_bukti": "BKT-002/2025",
      "netto_transaksi": "-5000000",
      "saldo": "45000000"
    }
  ]
}
```

---

## 3. Get Bidang List (GET)

```bash
curl -X GET http://localhost:3001/api/kas-umum/bidang
```

### Success Response (200 OK)
```json
[
  {
    "id": "kf001",
    "full_code": "1",
    "uraian": "URUSAN PEMERINTAHAN DESA"
  }
]
```

---

## 4. Get Sub-Bidang List (GET)

```bash
curl -X GET "http://localhost:3001/api/kas-umum/sub-bidang?bidangId=kf001"
```

### Success Response (200 OK)
```json
[
  {
    "id": "kf002",
    "full_code": "1.1",
    "uraian": "Penyelenggaraan Pemerintahan Desa"
  }
]
```

---

## 5. Get Kegiatan List (GET)

```bash
curl -X GET "http://localhost:3001/api/kas-umum/kegiatan?subBidangId=kf002"
```

### Success Response (200 OK)
```json
[
  {
    "id": "kf003",
    "full_code": "1.1.01",
    "uraian": "Administrasi Pemerintahan Desa"
  },
  {
    "id": "kf004",
    "full_code": "1.1.02",
    "uraian": "Administrasi Kependudukan"
  }
]
```

---

## 6. Get Kode Ekonomi List (GET)

```bash
curl -X GET http://localhost:3001/api/kas-umum/kode-ekonomi
```

### Success Response (200 OK)
```json
[
  {
    "id": "ke001",
    "full_code": "4",
    "uraian": "BELANJA"
  },
  {
    "id": "ke002",
    "full_code": "4.1",
    "uraian": "BELANJA PEGAWAI"
  },
  {
    "id": "ke003",
    "full_code": "4.1.1",
    "uraian": "Honorarium"
  }
]
```

---

## 7. Get Last Saldo (GET)

### Example 1: Get Global Last Saldo

```bash
curl -X GET http://localhost:3001/api/kas-umum/saldo
```

### Example 2: Get Last Saldo by RAB ID

```bash
curl -X GET "http://localhost:3001/api/kas-umum/saldo?rabId=rab001"
```

### Success Response (200 OK)
```json
{
  "saldo": 45000000
}
```

---

## Testing Workflow

### Complete Testing Flow

```bash
#!/bin/bash

API_BASE_URL="http://localhost:3001/api"

echo "=== 1. Get Kode Ekonomi List ==="
curl -X GET "$API_BASE_URL/kas-umum/kode-ekonomi"
echo -e "\n"

echo "=== 2. Get Bidang List ==="
curl -X GET "$API_BASE_URL/kas-umum/bidang"
echo -e "\n"

echo "=== 3. Get Sub-Bidang List ==="
curl -X GET "$API_BASE_URL/kas-umum/sub-bidang?bidangId=kf001"
echo -e "\n"

echo "=== 4. Get Kegiatan List ==="
curl -X GET "$API_BASE_URL/kas-umum/kegiatan?subBidangId=kf002"
echo -e "\n"

echo "=== 5. Get Current Saldo ==="
curl -X GET "$API_BASE_URL/kas-umum/saldo?rabId=rab001"
echo -e "\n"

echo "=== 6. Create Income Transaction ==="
curl -X POST "$API_BASE_URL/kas-umum" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-11-05",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke001",
    "kegiatan_id": "kf003",
    "uraian": "Test Income Transaction",
    "pemasukan": 10000000,
    "pengeluaran": 0,
    "nomor_bukti": "TEST-001"
  }'
echo -e "\n"

echo "=== 7. Create Expense Transaction ==="
curl -X POST "$API_BASE_URL/kas-umum" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-11-05",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke003",
    "kegiatan_id": "kf003",
    "uraian": "Test Expense Transaction",
    "pemasukan": 0,
    "pengeluaran": 2000000,
    "nomor_bukti": "TEST-002"
  }'
echo -e "\n"

echo "=== 8. Get BKU List for Current Month ==="
curl -X GET "$API_BASE_URL/kas-umum?month=2025-11&rabId=rab001"
echo -e "\n"

echo "=== 9. Get Updated Saldo ==="
curl -X GET "$API_BASE_URL/kas-umum/saldo?rabId=rab001"
echo -e "\n"
```

Save this as `test_kas_umum_api.sh`, make it executable (`chmod +x test_kas_umum_api.sh`), and run it.

---

## Notes

1. **Date Format**: Always use `YYYY-MM-DD` format for dates
2. **Amount Format**: Use plain numbers without separators (e.g., `50000000` not `50.000.000`)
3. **Transaction Logic**: You can only fill either `pemasukan` (income) OR `pengeluaran` (expense), never both
4. **Saldo Calculation**: The system automatically calculates running balance (`saldo_after`) based on the previous transaction
5. **Required References**: Make sure `rab_id`, `kode_ekonomi_id`, and `kegiatan_id` exist in their respective tables

---

## Common Database IDs (from seed data)

### Kode Ekonomi
- `ke001`: 4 - BELANJA
- `ke002`: 4.1 - BELANJA PEGAWAI
- `ke003`: 4.1.1 - Honorarium

### Kode Fungsi (Bidang - Level 1)
- `kf001`: 1 - URUSAN PEMERINTAHAN DESA

### Kode Fungsi (Sub-Bidang - Level 2)
- `kf002`: 1.1 - Penyelenggaraan Pemerintahan Desa

### Kode Fungsi (Kegiatan - Level 3)
- `kf003`: 1.1.01 - Administrasi Pemerintahan Desa
- `kf004`: 1.1.02 - Administrasi Kependudukan
- `kf005`: 1.1.03 - Administrasi Pertanahan

### RAB
- `rab001`: Available RAB ID

