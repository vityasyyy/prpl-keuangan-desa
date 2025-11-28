# Backend API Documentation

This folder contains API documentation and testing scripts for the PRPL Keuangan Desa backend.

## Files

### 1. API_CURL_EXAMPLES.md
Comprehensive cURL examples for all Buku Kas Umum (General Cash Book) API endpoints including:
- Creating income and expense transactions
- Retrieving transaction lists and summaries
- Getting dropdown data (bidang, sub-bidang, kegiatan, kode ekonomi)
- Checking current balance

### 2. test_kas_umum_api.sh
Executable bash script for testing the complete API workflow.

**Usage:**
```bash
# Make sure backend is running
cd /path/to/backend
docker compose -f compose.dev.yml up -d

# Run the test script
./docs/test_kas_umum_api.sh
```

**Requirements:**
- Backend server running on `http://localhost:3001`
- `curl` installed
- `jq` installed (optional, for pretty JSON output)

If you don't have `jq` installed:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

## Quick Start Testing

### Test Individual Endpoints

**Get dropdown data:**
```bash
curl http://localhost:3001/api/kas-umum/kode-ekonomi
curl http://localhost:3001/api/kas-umum/bidang
curl "http://localhost:3001/api/kas-umum/sub-bidang?bidangId=kf001"
curl "http://localhost:3001/api/kas-umum/kegiatan?subBidangId=kf002"
```

**Create a transaction:**
```bash
curl -X POST http://localhost:3001/api/kas-umum \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-11-05",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke001",
    "kegiatan_id": "kf003",
    "uraian": "Test Transaction",
    "pemasukan": 1000000,
    "pengeluaran": 0,
    "nomor_bukti": "TEST-001"
  }'
```

**Get transactions:**
```bash
curl "http://localhost:3001/api/kas-umum?month=2025-11&rabId=rab001"
```

**Check balance:**
```bash
curl "http://localhost:3001/api/kas-umum/saldo?rabId=rab001"
```

## API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/kas-umum` | Create new BKU entry |
| GET | `/api/kas-umum` | Get BKU list by month |
| GET | `/api/kas-umum/bidang` | Get bidang list (level 1) |
| GET | `/api/kas-umum/sub-bidang` | Get sub-bidang list (level 2) |
| GET | `/api/kas-umum/kegiatan` | Get kegiatan list (level 3) |
| GET | `/api/kas-umum/kode-ekonomi` | Get economic codes list |
| GET | `/api/kas-umum/saldo` | Get last balance |

See `API_CURL_EXAMPLES.md` for detailed examples with request/response formats.

## Troubleshooting

### Backend not responding
```bash
# Check if backend is running
docker ps

# View backend logs
docker compose -f compose.dev.yml logs backend-api -f
```

### Connection refused
Make sure the backend is accessible at `http://localhost:3001`. Check:
- Docker containers are running
- Port 3001 is not blocked by firewall
- CORS is properly configured

### Invalid data errors
Check the API documentation for:
- Required fields
- Data format (dates, numbers)
- Valid foreign key references (rab_id, kode_ekonomi_id, kegiatan_id)
