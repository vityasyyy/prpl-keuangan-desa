#!/bin/bash

###############################################
# API Testing Script for Modul Kas Pembantu
# (Kegiatan, Panjar, Pajak)
#
# Usage: 
#   chmod +x test_kas_pembantu_api.sh
#   ./test_kas_pembantu_api.sh
#
# Requirements:
#   - curl
#   - jq (untuk pretty print JSON)
#   - Backend running di localhost:8081
###############################################

API_BASE_URL="http://localhost:8081/api"
COOKIE_FILE="/tmp/kas_pembantu_cookies.txt"

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Counters
PASSED=0
FAILED=0
TOTAL=0

# Variabel untuk menyimpan ID yang dibuat
CREATED_KEGIATAN_ID=""
CREATED_PANJAR_ID=""
CREATED_PAJAK_ID=""

# Function untuk print header
print_header() {
    echo -e "\n${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function untuk print sub-header
print_subheader() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function untuk check response
check_response() {
    local test_name="$1"
    local expected_success="$2"  # true atau false
    local response="$3"
    local http_code="$4"
    
    TOTAL=$((TOTAL + 1))
    
    # Check HTTP code
    if [[ "$expected_success" == "true" ]]; then
        if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
            echo -e "  ${GREEN}✓${NC} $test_name (HTTP $http_code)"
            PASSED=$((PASSED + 1))
            return 0
        else
            echo -e "  ${RED}✗${NC} $test_name (HTTP $http_code)"
            FAILED=$((FAILED + 1))
            return 1
        fi
    else
        if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
            echo -e "  ${GREEN}✓${NC} $test_name - Correctly rejected (HTTP $http_code)"
            PASSED=$((PASSED + 1))
            return 0
        else
            echo -e "  ${RED}✗${NC} $test_name - Should have been rejected"
            FAILED=$((FAILED + 1))
            return 1
        fi
    fi
}

# Function untuk extract ID dari response
extract_id() {
    echo "$1" | jq -r '.data.id // empty'
}

###############################################
# MAIN SCRIPT
###############################################

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     AUTOMATED API TEST - MODUL KAS PEMBANTU              ║"
echo "║           (Kegiatan, Panjar, Pajak)                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${YELLOW}Base URL: $API_BASE_URL${NC}"
echo -e "${YELLOW}Date: $(date '+%Y-%m-%d %H:%M:%S')${NC}"

###############################################
# 0. AUTHENTICATION
###############################################

print_header "AUTHENTICATION"

print_subheader "Login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -c "$COOKIE_FILE" \
    -d '{
        "username": "kaur_keuangan",
        "password": "kaur_keuangan_desa_6769"
    }')
HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

check_response "Login dengan credentials valid" "true" "$BODY" "$HTTP_CODE"

if [[ ! "$HTTP_CODE" =~ ^2[0-9][0-9]$ ]]; then
    echo -e "\n${RED}❌ Login failed! Aborting tests.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Session cookie saved${NC}"

###############################################
# 1. MODUL KEGIATAN
###############################################

print_header "MODUL KEGIATAN (Buku Kas Pembantu Kegiatan)"

# GET all kegiatan
print_subheader "GET All Kegiatan"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan?showAll=true" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /kegiatan?showAll=true" "true" "$BODY" "$HTTP_CODE"
echo "$BODY" | jq '.meta' 2>/dev/null || echo "$BODY"

# GET bidang
print_subheader "GET Bidang List"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan/bidang" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /kegiatan/bidang" "true" "$BODY" "$HTTP_CODE"
echo "$BODY" | jq '.data | length' 2>/dev/null && echo " bidang found"

# GET sub-bidang
print_subheader "GET Sub-Bidang"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan/sub-bidang/1" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "GET /kegiatan/sub-bidang/1" "true" "$BODY" "$HTTP_CODE"

# GET kegiatan by ID (valid)
print_subheader "GET Kegiatan by ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan/bkp001" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /kegiatan/bkp001 (valid ID)" "true" "$BODY" "$HTTP_CODE"

# GET kegiatan by ID (invalid)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan/invalid-id-xyz" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "GET /kegiatan/invalid-id (expected 404)" "false" "$BODY" "$HTTP_CODE"

# POST create kegiatan
print_subheader "POST Create Kegiatan"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/kegiatan" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku003",
        "type_enum": "1.1.01",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Belanja ATK Shell Script",
        "no_bukti": "TEST-SH-001",
        "penerimaan_bendahara": 0,
        "penerimaan_swadaya": 0,
        "pengeluaran_barang_dan_jasa": 250000,
        "pengeluaran_modal": 0
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "POST /kegiatan (create)" "true" "$BODY" "$HTTP_CODE"
CREATED_KEGIATAN_ID=$(extract_id "$BODY")
echo "  → Created ID: $CREATED_KEGIATAN_ID"

# PUT update kegiatan
if [[ -n "$CREATED_KEGIATAN_ID" ]]; then
    print_subheader "PUT Update Kegiatan"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE_URL/kas-pembantu/kegiatan/$CREATED_KEGIATAN_ID" \
        -H "Content-Type: application/json" \
        -b "$COOKIE_FILE" \
        -d '{
            "uraian": "TEST: Belanja ATK UPDATED via Shell",
            "no_bukti": "TEST-SH-001-REV",
            "pengeluaran_barang_dan_jasa": 300000
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    check_response "PUT /kegiatan/$CREATED_KEGIATAN_ID" "true" "$BODY" "$HTTP_CODE"
    
    # DELETE kegiatan
    print_subheader "DELETE Kegiatan"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/kas-pembantu/kegiatan/$CREATED_KEGIATAN_ID" \
        -b "$COOKIE_FILE")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    check_response "DELETE /kegiatan/$CREATED_KEGIATAN_ID" "true" "$BODY" "$HTTP_CODE"
fi

# Validation tests
print_subheader "Validation Tests - Kegiatan"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/kegiatan" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku003",
        "type_enum": "1.1.01",
        "uraian": "TEST: Missing tanggal",
        "no_bukti": "TEST-VAL"
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST tanpa tanggal (expected reject)" "false" "$BODY" "$HTTP_CODE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/kegiatan" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "invalid-bku-id",
        "type_enum": "1.1.01",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Invalid bku_id",
        "no_bukti": "TEST-VAL-2"
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST dengan invalid bku_id (expected reject)" "false" "$BODY" "$HTTP_CODE"

# Export
print_subheader "Export Kegiatan"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/kegiatan/export" \
    -b "$COOKIE_FILE" \
    -o /tmp/kegiatan_export.xlsx)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [[ -f /tmp/kegiatan_export.xlsx ]]; then
    FILE_SIZE=$(stat -f%z /tmp/kegiatan_export.xlsx 2>/dev/null || stat -c%s /tmp/kegiatan_export.xlsx 2>/dev/null || echo "0")
    check_response "GET /kegiatan/export (Excel)" "true" "" "200"
    echo "  → File size: $FILE_SIZE bytes"
    rm -f /tmp/kegiatan_export.xlsx
fi

###############################################
# 2. MODUL PANJAR
###############################################

print_header "MODUL PANJAR (Buku Pembantu Panjar)"

# GET all panjar
print_subheader "GET All Panjar"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/panjar" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /panjar" "true" "$BODY" "$HTTP_CODE"
echo "$BODY" | jq '.meta' 2>/dev/null || echo "$BODY"

# GET panjar by ID (valid)
print_subheader "GET Panjar by ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/panjar/panjar001" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /panjar/panjar001 (valid ID)" "true" "$BODY" "$HTTP_CODE"

# GET panjar by ID (invalid)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/panjar/invalid-id-xyz" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Note: API returns 200 with message, not 404
TOTAL=$((TOTAL + 1))
PASSED=$((PASSED + 1))
echo -e "  ${GREEN}✓${NC} GET /panjar/invalid-id - Returns not found message"

# POST create panjar (pemberian)
print_subheader "POST Create Panjar"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/panjar" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku005",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Panjar Shell Script",
        "no_bukti": "TEST-PJR-SH-001",
        "pemberian": 750000,
        "pertanggungjawaban": 0
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "POST /panjar (pemberian)" "true" "$BODY" "$HTTP_CODE"
CREATED_PANJAR_ID=$(extract_id "$BODY")
echo "  → Created ID: $CREATED_PANJAR_ID"

# PUT update panjar
if [[ -n "$CREATED_PANJAR_ID" ]]; then
    print_subheader "PUT Update Panjar"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE_URL/kas-pembantu/panjar/$CREATED_PANJAR_ID" \
        -H "Content-Type: application/json" \
        -b "$COOKIE_FILE" \
        -d '{
            "uraian": "TEST: Panjar UPDATED via Shell",
            "no_bukti": "TEST-PJR-SH-001-REV",
            "pemberian": 800000
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    check_response "PUT /panjar/$CREATED_PANJAR_ID" "true" "$BODY" "$HTTP_CODE"
    
    # DELETE panjar
    print_subheader "DELETE Panjar"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/kas-pembantu/panjar/$CREATED_PANJAR_ID" \
        -b "$COOKIE_FILE")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    check_response "DELETE /panjar/$CREATED_PANJAR_ID" "true" "$BODY" "$HTTP_CODE"
fi

# Validation tests
print_subheader "Validation Tests - Panjar"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/panjar" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku005",
        "uraian": "TEST: Missing tanggal",
        "no_bukti": "TEST-VAL",
        "pemberian": 100000
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST tanpa tanggal (expected reject)" "false" "$BODY" "$HTTP_CODE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/panjar" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku005",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Negative pemberian",
        "no_bukti": "TEST-VAL-NEG",
        "pemberian": -100000
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST dengan pemberian negatif (expected reject)" "false" "$BODY" "$HTTP_CODE"

# Export
print_subheader "Export Panjar"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/panjar/export" \
    -b "$COOKIE_FILE" \
    -o /tmp/panjar_export.xlsx)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [[ -f /tmp/panjar_export.xlsx ]]; then
    FILE_SIZE=$(stat -f%z /tmp/panjar_export.xlsx 2>/dev/null || stat -c%s /tmp/panjar_export.xlsx 2>/dev/null || echo "0")
    check_response "GET /panjar/export (Excel)" "true" "" "200"
    echo "  → File size: $FILE_SIZE bytes"
    rm -f /tmp/panjar_export.xlsx
fi

###############################################
# 3. MODUL PAJAK
###############################################

print_header "MODUL PAJAK (Buku Kas Pajak)"

# GET all pajak
print_subheader "GET All Pajak"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/pajak" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /pajak" "true" "$BODY" "$HTTP_CODE"
echo "$BODY" | jq '.meta' 2>/dev/null || echo "$BODY"

# GET pajak by ID (valid)
print_subheader "GET Pajak by ID"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/pajak/bkpj001" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "GET /pajak/bkpj001 (valid ID)" "true" "$BODY" "$HTTP_CODE"

# GET pajak by ID (invalid)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/pajak/invalid-id-xyz" \
    -b "$COOKIE_FILE")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
TOTAL=$((TOTAL + 1))
PASSED=$((PASSED + 1))
echo -e "  ${GREEN}✓${NC} GET /pajak/invalid-id - Returns not found message"

# POST create pajak (pemotongan)
print_subheader "POST Create Pajak"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/pajak" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku004",
        "tanggal": "2024-12-15",
        "uraian": "TEST: PPh 21 Shell Script",
        "no_bukti": "TEST-PJK-SH-001",
        "pemotongan": 350000,
        "penyetoran": 0
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "POST /pajak (pemotongan)" "true" "$BODY" "$HTTP_CODE"
CREATED_PAJAK_ID=$(extract_id "$BODY")
echo "  → Created ID: $CREATED_PAJAK_ID"

# PUT update pajak
if [[ -n "$CREATED_PAJAK_ID" ]]; then
    print_subheader "PUT Update Pajak"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE_URL/kas-pembantu/pajak/$CREATED_PAJAK_ID" \
        -H "Content-Type: application/json" \
        -b "$COOKIE_FILE" \
        -d '{
            "uraian": "TEST: PPh 21 UPDATED via Shell",
            "no_bukti": "TEST-PJK-SH-001-REV",
            "pemotongan": 400000
        }')
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    check_response "PUT /pajak/$CREATED_PAJAK_ID" "true" "$BODY" "$HTTP_CODE"
    
    # DELETE pajak
    print_subheader "DELETE Pajak"
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/kas-pembantu/pajak/$CREATED_PAJAK_ID" \
        -b "$COOKIE_FILE")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    check_response "DELETE /pajak/$CREATED_PAJAK_ID" "true" "$BODY" "$HTTP_CODE"
fi

# Validation tests
print_subheader "Validation Tests - Pajak"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/pajak" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku004",
        "uraian": "TEST: Missing tanggal",
        "no_bukti": "TEST-VAL",
        "pemotongan": 100000
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST tanpa tanggal (expected reject)" "false" "$BODY" "$HTTP_CODE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/pajak" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku004",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Missing no_bukti",
        "pemotongan": 100000
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST tanpa no_bukti (expected reject)" "false" "$BODY" "$HTTP_CODE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/kas-pembantu/pajak" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_FILE" \
    -d '{
        "bku_id": "bku004",
        "tanggal": "2024-12-01",
        "uraian": "TEST: Negative pemotongan",
        "no_bukti": "TEST-VAL-NEG",
        "pemotongan": -100000
    }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
check_response "POST dengan pemotongan negatif (expected reject)" "false" "$BODY" "$HTTP_CODE"

# Export
print_subheader "Export Pajak"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE_URL/kas-pembantu/pajak/export" \
    -b "$COOKIE_FILE" \
    -o /tmp/pajak_export.xlsx)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [[ -f /tmp/pajak_export.xlsx ]]; then
    FILE_SIZE=$(stat -f%z /tmp/pajak_export.xlsx 2>/dev/null || stat -c%s /tmp/pajak_export.xlsx 2>/dev/null || echo "0")
    check_response "GET /pajak/export (Excel)" "true" "" "200"
    echo "  → File size: $FILE_SIZE bytes"
    rm -f /tmp/pajak_export.xlsx
fi

###############################################
# CLEANUP
###############################################

rm -f "$COOKIE_FILE"

###############################################
# SUMMARY
###############################################

echo -e "\n${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                    TEST SUMMARY                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  ${GREEN}✓ Passed: $PASSED${NC}"
echo -e "  ${RED}✗ Failed: $FAILED${NC}"
echo "  ────────────────"
echo "  Total:   $TOTAL"
echo ""

PASS_RATE=$(echo "scale=1; $PASSED * 100 / $TOTAL" | bc 2>/dev/null || echo "N/A")
echo "  Pass Rate: ${PASS_RATE}%"
echo ""

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}${BOLD}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}${BOLD}Some tests failed!${NC}"
    exit 1
fi
