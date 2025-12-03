#!/bin/bash

# API Testing Script for Buku Kas Umum
# Usage: ./test_kas_umum_api.sh

API_BASE_URL="http://localhost:3001/api"

echo "=============================================="
echo "   TESTING BUKU KAS UMUM API"
echo "=============================================="
echo ""

echo "=== 1. Get Kode Ekonomi List ==="
curl -s -X GET "$API_BASE_URL/kas-umum/kode-ekonomi" | jq '.'
echo -e "\n"

echo "=== 2. Get Bidang List ==="
curl -s -X GET "$API_BASE_URL/kas-umum/bidang" | jq '.'
echo -e "\n"

echo "=== 3. Get Sub-Bidang List (bidangId=kf001) ==="
curl -s -X GET "$API_BASE_URL/kas-umum/sub-bidang?bidangId=kf001" | jq '.'
echo -e "\n"

echo "=== 4. Get Kegiatan List (subBidangId=kf002) ==="
curl -s -X GET "$API_BASE_URL/kas-umum/kegiatan?subBidangId=kf002" | jq '.'
echo -e "\n"

echo "=== 5. Get Current Saldo (rabId=rab001) ==="
curl -s -X GET "$API_BASE_URL/kas-umum/saldo?rabId=rab001" | jq '.'
echo -e "\n"

echo "=== 6. Create Income Transaction ==="
curl -s -X POST "$API_BASE_URL/kas-umum" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-11-05",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke001",
    "kegiatan_id": "kf003",
    "uraian": "Test Income Transaction - Penerimaan Dana Desa",
    "pemasukan": 10000000,
    "pengeluaran": 0,
    "nomor_bukti": "TEST-001"
  }' | jq '.'
echo -e "\n"

echo "=== 7. Create Expense Transaction ==="
curl -s -X POST "$API_BASE_URL/kas-umum" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal": "2025-11-05",
    "rab_id": "rab001",
    "kode_ekonomi_id": "ke003",
    "kegiatan_id": "kf003",
    "uraian": "Test Expense Transaction - Honorarium Perangkat",
    "pemasukan": 0,
    "pengeluaran": 2000000,
    "nomor_bukti": "TEST-002"
  }' | jq '.'
echo -e "\n"

echo "=== 8. Get BKU List for Current Month (2025-11) ==="
curl -s -X GET "$API_BASE_URL/kas-umum?month=2025-11&rabId=rab001" | jq '.'
echo -e "\n"

echo "=== 9. Get Updated Saldo ==="
curl -s -X GET "$API_BASE_URL/kas-umum/saldo?rabId=rab001" | jq '.'
echo -e "\n"

echo "=============================================="
echo "   TESTING COMPLETE"
echo "=============================================="
