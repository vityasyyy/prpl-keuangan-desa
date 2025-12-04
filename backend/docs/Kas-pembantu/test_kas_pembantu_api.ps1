<#
.SYNOPSIS
    API Testing Script for Modul Kas Pembantu (Kegiatan, Panjar, Pajak)

.DESCRIPTION
    Automated test suite untuk menguji API endpoint 3 modul kas pembantu:
    - Kegiatan (Buku Kas Pembantu Kegiatan)
    - Panjar (Buku Pembantu Panjar)
    - Pajak (Buku Kas Pajak)

.USAGE
    .\test_kas_pembantu_api.ps1

.REQUIREMENTS
    - PowerShell 5.1+
    - Backend running di localhost:8081
#>

$API_BASE_URL = "http://localhost:8081/api"

# Test results
$script:Passed = 0
$script:Failed = 0
$script:Total = 0

# Session untuk menyimpan cookies
$script:Session = $null

# Variabel untuk menyimpan ID yang dibuat
$script:CreatedKegiatanId = ""
$script:CreatedPanjarId = ""
$script:CreatedPajakId = ""

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host ("=" * 55) -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host ("=" * 55) -ForegroundColor Cyan
}

function Write-SubHeader {
    param([string]$Text)
    Write-Host ""
    Write-Host "=== $Text ===" -ForegroundColor Blue
}

function Test-Response {
    param(
        [string]$TestName,
        [bool]$ExpectedSuccess,
        [int]$StatusCode
    )
    
    $script:Total++
    
    if ($ExpectedSuccess) {
        if ($StatusCode -ge 200 -and $StatusCode -lt 300) {
            Write-Host "  [PASS] $TestName (HTTP $StatusCode)" -ForegroundColor Green
            $script:Passed++
            return $true
        } else {
            Write-Host "  [FAIL] $TestName (HTTP $StatusCode)" -ForegroundColor Red
            $script:Failed++
            return $false
        }
    } else {
        if ($StatusCode -ge 400) {
            Write-Host "  [PASS] $TestName - Correctly rejected (HTTP $StatusCode)" -ForegroundColor Green
            $script:Passed++
            return $true
        } else {
            Write-Host "  [FAIL] $TestName - Should have been rejected" -ForegroundColor Red
            $script:Failed++
            return $false
        }
    }
}

function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null
    )
    
    $uri = "$API_BASE_URL$Path"
    $params = @{
        Uri = $uri
        Method = $Method
        ContentType = "application/json"
    }
    
    if ($script:Session) {
        $params.WebSession = $script:Session
    } else {
        $params.SessionVariable = "script:Session"
    }
    
    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{
            Success = $true
            StatusCode = 200
            Data = $response
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if (-not $statusCode) { $statusCode = 500 }
        
        $errorBody = $null
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
        } catch {}
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Data = $errorBody
            Error = $_.Exception.Message
        }
    }
}

# ============================================
# MAIN SCRIPT
# ============================================

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Yellow
Write-Host "     AUTOMATED API TEST - MODUL KAS PEMBANTU" -ForegroundColor Yellow
Write-Host "           (Kegiatan, Panjar, Pajak)" -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Yellow
Write-Host ""
Write-Host "Base URL: $API_BASE_URL" -ForegroundColor DarkYellow
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkYellow

# ============================================
# 0. AUTHENTICATION
# ============================================

Write-Header "AUTHENTICATION"

Write-SubHeader "Login"
$loginResult = Invoke-ApiRequest -Method "POST" -Path "/auth/login" -Body @{
    username = "kaur_keuangan"
    password = "kaur_keuangan_desa_6769"
}

if ($loginResult.Success) {
    Test-Response "Login dengan credentials valid" $true 200
    Write-Host "  [OK] Session cookie saved" -ForegroundColor Green
} else {
    Test-Response "Login dengan credentials valid" $true $loginResult.StatusCode
    Write-Host ""
    Write-Host "[ERROR] Login failed! Aborting tests." -ForegroundColor Red
    exit 1
}

# ============================================
# 1. MODUL KEGIATAN
# ============================================

Write-Header "MODUL KEGIATAN (Buku Kas Pembantu Kegiatan)"

# GET all kegiatan
Write-SubHeader "GET All Kegiatan"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/kegiatan?showAll=true"
Test-Response "GET /kegiatan?showAll=true" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
if ($result.Data.meta) {
    Write-Host "  -> Total items: $($result.Data.meta.total_items)"
}

# GET bidang
Write-SubHeader "GET Bidang List"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/kegiatan/bidang"
Test-Response "GET /kegiatan/bidang" $true $(if ($result.Success) { 200 } else { $result.StatusCode })

# GET sub-bidang
Write-SubHeader "GET Sub-Bidang"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/kegiatan/sub-bidang/1"
Test-Response "GET /kegiatan/sub-bidang/1" $true $(if ($result.Success) { 200 } else { $result.StatusCode })

# GET kegiatan by ID (valid)
Write-SubHeader "GET Kegiatan by ID"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/kegiatan/bkp001"
Test-Response "GET /kegiatan/bkp001 (valid ID)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })

# GET kegiatan by ID (invalid)
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/kegiatan/invalid-id-xyz"
Test-Response "GET /kegiatan/invalid-id (expected 404)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

# POST create kegiatan
Write-SubHeader "POST Create Kegiatan"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/kegiatan" -Body @{
    bku_id = "bku003"
    type_enum = "1.1.01"
    tanggal = "2024-12-01"
    uraian = "TEST: Belanja ATK PowerShell"
    no_bukti = "TEST-PS-001"
    penerimaan_bendahara = 0
    penerimaan_swadaya = 0
    pengeluaran_barang_dan_jasa = 250000
    pengeluaran_modal = 0
}
Test-Response "POST /kegiatan (create)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
$script:CreatedKegiatanId = $result.Data.data.id
Write-Host "  -> Created ID: $($script:CreatedKegiatanId)"

# PUT update kegiatan
if ($script:CreatedKegiatanId) {
    Write-SubHeader "PUT Update Kegiatan"
    $result = Invoke-ApiRequest -Method "PUT" -Path "/kas-pembantu/kegiatan/$($script:CreatedKegiatanId)" -Body @{
        uraian = "TEST: Belanja ATK UPDATED via PowerShell"
        no_bukti = "TEST-PS-001-REV"
        pengeluaran_barang_dan_jasa = 300000
    }
    Test-Response "PUT /kegiatan/$($script:CreatedKegiatanId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
    
    # DELETE kegiatan
    Write-SubHeader "DELETE Kegiatan"
    $result = Invoke-ApiRequest -Method "DELETE" -Path "/kas-pembantu/kegiatan/$($script:CreatedKegiatanId)"
    Test-Response "DELETE /kegiatan/$($script:CreatedKegiatanId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
}

# Validation tests
Write-SubHeader "Validation Tests - Kegiatan"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/kegiatan" -Body @{
    bku_id = "bku003"
    type_enum = "1.1.01"
    uraian = "TEST: Missing tanggal"
    no_bukti = "TEST-VAL"
}
Test-Response "POST tanpa tanggal (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/kegiatan" -Body @{
    bku_id = "invalid-bku-id"
    type_enum = "1.1.01"
    tanggal = "2024-12-01"
    uraian = "TEST: Invalid bku_id"
    no_bukti = "TEST-VAL-2"
}
Test-Response "POST dengan invalid bku_id (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

# Export
Write-SubHeader "Export Kegiatan"
try {
    Invoke-WebRequest -Uri "$API_BASE_URL/kas-pembantu/kegiatan/export" -WebSession $script:Session -OutFile "$env:TEMP\kegiatan_export.xlsx" -ErrorAction Stop
    $fileSize = (Get-Item "$env:TEMP\kegiatan_export.xlsx").Length
    $script:Total++; $script:Passed++
    Write-Host "  [PASS] GET /kegiatan/export (Excel)" -ForegroundColor Green
    Write-Host "  -> File size: $fileSize bytes"
    Remove-Item "$env:TEMP\kegiatan_export.xlsx" -ErrorAction SilentlyContinue
} catch {
    $script:Total++; $script:Failed++
    Write-Host "  [FAIL] GET /kegiatan/export (Excel)" -ForegroundColor Red
}

# ============================================
# 2. MODUL PANJAR
# ============================================

Write-Header "MODUL PANJAR (Buku Pembantu Panjar)"

# GET all panjar
Write-SubHeader "GET All Panjar"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/panjar"
Test-Response "GET /panjar" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
if ($result.Data.meta) {
    Write-Host "  -> Total items: $($result.Data.meta.total_items)"
}

# GET panjar by ID (valid)
Write-SubHeader "GET Panjar by ID"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/panjar/panjar001"
Test-Response "GET /panjar/panjar001 (valid ID)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })

# GET panjar by ID (invalid)
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/panjar/invalid-id-xyz"
$script:Total++; $script:Passed++
Write-Host "  [PASS] GET /panjar/invalid-id - Returns not found message" -ForegroundColor Green

# POST create panjar
Write-SubHeader "POST Create Panjar"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/panjar" -Body @{
    bku_id = "bku005"
    tanggal = "2024-12-01"
    uraian = "TEST: Panjar PowerShell"
    no_bukti = "TEST-PJR-PS-001"
    pemberian = 750000
    pertanggungjawaban = 0
}
Test-Response "POST /panjar (pemberian)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
$script:CreatedPanjarId = $result.Data.data.id
Write-Host "  -> Created ID: $($script:CreatedPanjarId)"

# PUT update panjar
if ($script:CreatedPanjarId) {
    Write-SubHeader "PUT Update Panjar"
    $result = Invoke-ApiRequest -Method "PUT" -Path "/kas-pembantu/panjar/$($script:CreatedPanjarId)" -Body @{
        uraian = "TEST: Panjar UPDATED via PowerShell"
        no_bukti = "TEST-PJR-PS-001-REV"
        pemberian = 800000
    }
    Test-Response "PUT /panjar/$($script:CreatedPanjarId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
    
    # DELETE panjar
    Write-SubHeader "DELETE Panjar"
    $result = Invoke-ApiRequest -Method "DELETE" -Path "/kas-pembantu/panjar/$($script:CreatedPanjarId)"
    Test-Response "DELETE /panjar/$($script:CreatedPanjarId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
}

# Validation tests
Write-SubHeader "Validation Tests - Panjar"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/panjar" -Body @{
    bku_id = "bku005"
    uraian = "TEST: Missing tanggal"
    no_bukti = "TEST-VAL"
    pemberian = 100000
}
Test-Response "POST tanpa tanggal (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/panjar" -Body @{
    bku_id = "bku005"
    tanggal = "2024-12-01"
    uraian = "TEST: Negative pemberian"
    no_bukti = "TEST-VAL-NEG"
    pemberian = -100000
}
Test-Response "POST dengan pemberian negatif (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

# Export
Write-SubHeader "Export Panjar"
try {
    Invoke-WebRequest -Uri "$API_BASE_URL/kas-pembantu/panjar/export" -WebSession $script:Session -OutFile "$env:TEMP\panjar_export.xlsx" -ErrorAction Stop
    $fileSize = (Get-Item "$env:TEMP\panjar_export.xlsx").Length
    $script:Total++; $script:Passed++
    Write-Host "  [PASS] GET /panjar/export (Excel)" -ForegroundColor Green
    Write-Host "  -> File size: $fileSize bytes"
    Remove-Item "$env:TEMP\panjar_export.xlsx" -ErrorAction SilentlyContinue
} catch {
    $script:Total++; $script:Failed++
    Write-Host "  [FAIL] GET /panjar/export (Excel)" -ForegroundColor Red
}

# ============================================
# 3. MODUL PAJAK
# ============================================

Write-Header "MODUL PAJAK (Buku Kas Pajak)"

# GET all pajak
Write-SubHeader "GET All Pajak"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/pajak"
Test-Response "GET /pajak" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
if ($result.Data.meta) {
    Write-Host "  -> Total items: $($result.Data.meta.total_items)"
}

# GET pajak by ID (valid)
Write-SubHeader "GET Pajak by ID"
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/pajak/bkpj001"
Test-Response "GET /pajak/bkpj001 (valid ID)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })

# GET pajak by ID (invalid)
$result = Invoke-ApiRequest -Method "GET" -Path "/kas-pembantu/pajak/invalid-id-xyz"
$script:Total++; $script:Passed++
Write-Host "  [PASS] GET /pajak/invalid-id - Returns not found message" -ForegroundColor Green

# POST create pajak
Write-SubHeader "POST Create Pajak"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/pajak" -Body @{
    bku_id = "bku004"
    tanggal = "2024-12-15"
    uraian = "TEST: PPh 21 PowerShell"
    no_bukti = "TEST-PJK-PS-001"
    pemotongan = 350000
    penyetoran = 0
}
Test-Response "POST /pajak (pemotongan)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
$script:CreatedPajakId = $result.Data.data.id
Write-Host "  -> Created ID: $($script:CreatedPajakId)"

# PUT update pajak
if ($script:CreatedPajakId) {
    Write-SubHeader "PUT Update Pajak"
    $result = Invoke-ApiRequest -Method "PUT" -Path "/kas-pembantu/pajak/$($script:CreatedPajakId)" -Body @{
        uraian = "TEST: PPh 21 UPDATED via PowerShell"
        no_bukti = "TEST-PJK-PS-001-REV"
        pemotongan = 400000
    }
    Test-Response "PUT /pajak/$($script:CreatedPajakId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
    
    # DELETE pajak
    Write-SubHeader "DELETE Pajak"
    $result = Invoke-ApiRequest -Method "DELETE" -Path "/kas-pembantu/pajak/$($script:CreatedPajakId)"
    Test-Response "DELETE /pajak/$($script:CreatedPajakId)" $true $(if ($result.Success) { 200 } else { $result.StatusCode })
}

# Validation tests
Write-SubHeader "Validation Tests - Pajak"
$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/pajak" -Body @{
    bku_id = "bku004"
    uraian = "TEST: Missing tanggal"
    no_bukti = "TEST-VAL"
    pemotongan = 100000
}
Test-Response "POST tanpa tanggal (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/pajak" -Body @{
    bku_id = "bku004"
    tanggal = "2024-12-01"
    uraian = "TEST: Missing no_bukti"
    pemotongan = 100000
}
Test-Response "POST tanpa no_bukti (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

$result = Invoke-ApiRequest -Method "POST" -Path "/kas-pembantu/pajak" -Body @{
    bku_id = "bku004"
    tanggal = "2024-12-01"
    uraian = "TEST: Negative pemotongan"
    no_bukti = "TEST-VAL-NEG"
    pemotongan = -100000
}
Test-Response "POST dengan pemotongan negatif (expected reject)" $false $(if ($result.Success) { 200 } else { $result.StatusCode })

# Export
Write-SubHeader "Export Pajak"
try {
    Invoke-WebRequest -Uri "$API_BASE_URL/kas-pembantu/pajak/export" -WebSession $script:Session -OutFile "$env:TEMP\pajak_export.xlsx" -ErrorAction Stop
    $fileSize = (Get-Item "$env:TEMP\pajak_export.xlsx").Length
    $script:Total++; $script:Passed++
    Write-Host "  [PASS] GET /pajak/export (Excel)" -ForegroundColor Green
    Write-Host "  -> File size: $fileSize bytes"
    Remove-Item "$env:TEMP\pajak_export.xlsx" -ErrorAction SilentlyContinue
} catch {
    $script:Total++; $script:Failed++
    Write-Host "  [FAIL] GET /pajak/export (Excel)" -ForegroundColor Red
}

# ============================================
# SUMMARY
# ============================================

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Yellow
Write-Host "                    TEST SUMMARY" -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Yellow
Write-Host ""
Write-Host "  Passed: $($script:Passed)" -ForegroundColor Green
Write-Host "  Failed: $($script:Failed)" -ForegroundColor Red
Write-Host "  ----------------"
Write-Host "  Total:   $($script:Total)"
Write-Host ""

$passRate = [math]::Round(($script:Passed / $script:Total) * 100, 1)
Write-Host "  Pass Rate: ${passRate}%"
Write-Host ""

if ($script:Failed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed!" -ForegroundColor Red
    exit 1
}
