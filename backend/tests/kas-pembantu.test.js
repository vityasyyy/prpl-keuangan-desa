/**
 * ============================================
 * AUTOMATED QA TEST SUITE
 * Modul Kas Pembantu (Kegiatan, Panjar, Pajak)
 * ============================================
 * 
 * Cara menjalankan:
 *   cd backend
 *   node tests/kas-pembantu.test.js
 * 
 * Pastikan:
 *   1. Backend sudah running di localhost:8081
 *   2. Database sudah di-seed dengan data test
 */

const BASE_URL = 'http://localhost:8081/api';

// Warna untuk output console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Cookie storage untuk session
let cookies = '';

// Helper untuk HTTP requests
async function request(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  // Store cookies dari response
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookies = setCookie.split(';')[0];
  }
  
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  }
  
  return { status: response.status, data, ok: response.ok };
}

// Test assertion helper
function assert(condition, message) {
  if (condition) {
    results.passed++;
    results.tests.push({ name: message, status: 'PASS' });
    console.log(`  ${colors.green}✓${colors.reset} ${message}`);
    return true;
  } else {
    results.failed++;
    results.tests.push({ name: message, status: 'FAIL' });
    console.log(`  ${colors.red}✗${colors.reset} ${message}`);
    return false;
  }
}

// ============================================
// TEST SUITES
// ============================================

async function testAuth() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ AUTH TESTS ━━━${colors.reset}`);
  
  // Test Login
  const loginRes = await request('POST', '/auth/login', {
    username: 'kaur_keuangan',
    password: 'kaur_keuangan_desa_6769'
  });
  
  assert(loginRes.ok, 'Login dengan credentials valid');
  assert(loginRes.data?.message === 'Login successful', 'Response message: Login successful');
  
  return loginRes.ok;
}

async function testKegiatanModule() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ MODUL KEGIATAN (Buku Kas Pembantu Kegiatan) ━━━${colors.reset}`);
  
  // 1. GET all kegiatan
  console.log(`\n${colors.blue}[GET] List Kegiatan${colors.reset}`);
  const listRes = await request('GET', '/kas-pembantu/kegiatan?showAll=true');
  assert(listRes.ok, 'GET /kegiatan - Status 200');
  assert(Array.isArray(listRes.data?.data), 'GET /kegiatan - Response adalah array');
  assert(listRes.data?.meta?.total_items >= 0, 'GET /kegiatan - Meta pagination valid');
  
  // 2. GET bidang
  console.log(`\n${colors.blue}[GET] List Bidang${colors.reset}`);
  const bidangRes = await request('GET', '/kas-pembantu/kegiatan/bidang');
  assert(bidangRes.ok, 'GET /kegiatan/bidang - Status 200');
  assert(Array.isArray(bidangRes.data?.data), 'GET /kegiatan/bidang - Response adalah array');
  
  // 3. GET sub-bidang
  console.log(`\n${colors.blue}[GET] Sub-Bidang${colors.reset}`);
  const subBidangRes = await request('GET', '/kas-pembantu/kegiatan/sub-bidang/1');
  assert(subBidangRes.ok, 'GET /kegiatan/sub-bidang/1 - Status 200');
  
  // 4. GET kegiatan by ID (valid)
  console.log(`\n${colors.blue}[GET] Kegiatan by ID${colors.reset}`);
  const getByIdRes = await request('GET', '/kas-pembantu/kegiatan/bkp001');
  assert(getByIdRes.ok, 'GET /kegiatan/bkp001 - Status 200');
  assert(getByIdRes.data?.data?.id === 'bkp001' || getByIdRes.data?.success, 'GET /kegiatan/bkp001 - Data valid');
  
  // 5. GET kegiatan by ID (invalid)
  const getInvalidRes = await request('GET', '/kas-pembantu/kegiatan/invalid-id-xyz');
  assert(getInvalidRes.status === 404, 'GET /kegiatan/invalid-id - Status 404');
  
  // 6. POST create kegiatan
  console.log(`\n${colors.blue}[POST] Create Kegiatan${colors.reset}`);
  const createRes = await request('POST', '/kas-pembantu/kegiatan', {
    bku_id: 'bku003',
    type_enum: '1.1.01',
    tanggal: '2024-12-01',
    uraian: 'TEST: Belanja ATK Automated Test',
    no_bukti: 'TEST-AUTO-001',
    penerimaan_bendahara: 0,
    penerimaan_swadaya: 0,
    pengeluaran_barang_dan_jasa: 100000,
    pengeluaran_modal: 0
  });
  assert(createRes.ok, 'POST /kegiatan - Status 200/201');
  const createdKegiatanId = createRes.data?.data?.id;
  assert(!!createdKegiatanId, 'POST /kegiatan - ID generated');
  
  // 7. PUT update kegiatan
  if (createdKegiatanId) {
    console.log(`\n${colors.blue}[PUT] Update Kegiatan${colors.reset}`);
    const updateRes = await request('PUT', `/kas-pembantu/kegiatan/${createdKegiatanId}`, {
      uraian: 'TEST: Belanja ATK UPDATED',
      no_bukti: 'TEST-AUTO-001-REV',
      pengeluaran_barang_dan_jasa: 150000
    });
    assert(updateRes.ok, 'PUT /kegiatan/:id - Status 200');
    assert(updateRes.data?.data?.uraian?.includes('UPDATED'), 'PUT /kegiatan/:id - Data updated');
    
    // 8. DELETE kegiatan
    console.log(`\n${colors.blue}[DELETE] Delete Kegiatan${colors.reset}`);
    const deleteRes = await request('DELETE', `/kas-pembantu/kegiatan/${createdKegiatanId}`);
    assert(deleteRes.ok, 'DELETE /kegiatan/:id - Status 200');
  }
  
  // 9. Validation tests
  console.log(`\n${colors.blue}[VALIDATION] Kegiatan${colors.reset}`);
  const missingTanggalRes = await request('POST', '/kas-pembantu/kegiatan', {
    bku_id: 'bku003',
    type_enum: '1.1.01',
    uraian: 'Test tanpa tanggal',
    no_bukti: 'TEST-VAL'
  });
  assert(!missingTanggalRes.ok, 'POST tanpa tanggal - Ditolak');
  
  const invalidBkuRes = await request('POST', '/kas-pembantu/kegiatan', {
    bku_id: 'invalid-bku-id',
    type_enum: '1.1.01',
    tanggal: '2024-12-01',
    uraian: 'Test invalid bku_id',
    no_bukti: 'TEST-VAL-2'
  });
  assert(!invalidBkuRes.ok, 'POST dengan invalid bku_id - Ditolak');
}

async function testPanjarModule() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ MODUL PANJAR (Buku Pembantu Panjar) ━━━${colors.reset}`);
  
  // 1. GET all panjar
  console.log(`\n${colors.blue}[GET] List Panjar${colors.reset}`);
  const listRes = await request('GET', '/kas-pembantu/panjar');
  assert(listRes.ok, 'GET /panjar - Status 200');
  assert(Array.isArray(listRes.data?.data), 'GET /panjar - Response adalah array');
  assert(listRes.data?.meta?.total_items >= 0, 'GET /panjar - Meta pagination valid');
  
  // 2. GET panjar by ID (valid)
  console.log(`\n${colors.blue}[GET] Panjar by ID${colors.reset}`);
  const getByIdRes = await request('GET', '/kas-pembantu/panjar/panjar001');
  assert(getByIdRes.ok, 'GET /panjar/panjar001 - Status 200');
  assert(getByIdRes.data?.data?.id === 'panjar001' || getByIdRes.data?.success, 'GET /panjar/panjar001 - Data valid');
  
  // 3. GET panjar by ID (invalid)
  const getInvalidRes = await request('GET', '/kas-pembantu/panjar/invalid-id-xyz');
  // Note: API returns 200 with message instead of 404
  assert(getInvalidRes.data?.message?.includes('not found') || getInvalidRes.status === 404, 
    'GET /panjar/invalid-id - Not found response');
  
  // 4. POST create panjar (pemberian)
  console.log(`\n${colors.blue}[POST] Create Panjar${colors.reset}`);
  const createRes = await request('POST', '/kas-pembantu/panjar', {
    bku_id: 'bku005',
    tanggal: '2024-12-01',
    uraian: 'TEST: Panjar Automated Test',
    no_bukti: 'TEST-PJR-001',
    pemberian: 500000,
    pertanggungjawaban: 0
  });
  assert(createRes.ok, 'POST /panjar - Status 200/201');
  const createdPanjarId = createRes.data?.data?.id;
  assert(!!createdPanjarId, 'POST /panjar - ID generated');
  
  // 5. PUT update panjar
  if (createdPanjarId) {
    console.log(`\n${colors.blue}[PUT] Update Panjar${colors.reset}`);
    const updateRes = await request('PUT', `/kas-pembantu/panjar/${createdPanjarId}`, {
      uraian: 'TEST: Panjar UPDATED',
      no_bukti: 'TEST-PJR-001-REV',
      pemberian: 600000
    });
    assert(updateRes.ok, 'PUT /panjar/:id - Status 200');
    
    // 6. DELETE panjar
    console.log(`\n${colors.blue}[DELETE] Delete Panjar${colors.reset}`);
    const deleteRes = await request('DELETE', `/kas-pembantu/panjar/${createdPanjarId}`);
    assert(deleteRes.ok, 'DELETE /panjar/:id - Status 200');
  }
  
  // 7. Validation tests
  console.log(`\n${colors.blue}[VALIDATION] Panjar${colors.reset}`);
  const missingTanggalRes = await request('POST', '/kas-pembantu/panjar', {
    bku_id: 'bku005',
    uraian: 'Test tanpa tanggal',
    no_bukti: 'TEST-VAL',
    pemberian: 100000
  });
  assert(!missingTanggalRes.ok, 'POST tanpa tanggal - Ditolak');
  
  const negativePemberianRes = await request('POST', '/kas-pembantu/panjar', {
    bku_id: 'bku005',
    tanggal: '2024-12-01',
    uraian: 'Test negative pemberian',
    no_bukti: 'TEST-VAL-2',
    pemberian: -100000
  });
  assert(!negativePemberianRes.ok, 'POST dengan pemberian negatif - Ditolak');
}

async function testPajakModule() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ MODUL PAJAK (Buku Kas Pajak) ━━━${colors.reset}`);
  
  // 1. GET all pajak
  console.log(`\n${colors.blue}[GET] List Pajak${colors.reset}`);
  const listRes = await request('GET', '/kas-pembantu/pajak');
  assert(listRes.ok, 'GET /pajak - Status 200');
  assert(Array.isArray(listRes.data?.data), 'GET /pajak - Response adalah array');
  assert(listRes.data?.meta?.total_items >= 0, 'GET /pajak - Meta pagination valid');
  
  // 2. GET pajak by ID (valid)
  console.log(`\n${colors.blue}[GET] Pajak by ID${colors.reset}`);
  const getByIdRes = await request('GET', '/kas-pembantu/pajak/bkpj001');
  assert(getByIdRes.ok, 'GET /pajak/bkpj001 - Status 200');
  assert(getByIdRes.data?.data?.id === 'bkpj001' || getByIdRes.data?.success, 'GET /pajak/bkpj001 - Data valid');
  
  // 3. GET pajak by ID (invalid)
  const getInvalidRes = await request('GET', '/kas-pembantu/pajak/invalid-id-xyz');
  assert(getInvalidRes.data?.message?.includes('not found') || getInvalidRes.status === 404, 
    'GET /pajak/invalid-id - Not found response');
  
  // 4. POST create pajak (pemotongan)
  console.log(`\n${colors.blue}[POST] Create Pajak${colors.reset}`);
  const createRes = await request('POST', '/kas-pembantu/pajak', {
    bku_id: 'bku004',
    tanggal: '2024-12-01',
    uraian: 'TEST: PPh 21 Automated Test',
    no_bukti: 'TEST-PJK-001',
    pemotongan: 250000,
    penyetoran: 0
  });
  assert(createRes.ok, 'POST /pajak - Status 200/201');
  const createdPajakId = createRes.data?.data?.id;
  assert(!!createdPajakId, 'POST /pajak - ID generated');
  
  // 5. PUT update pajak
  if (createdPajakId) {
    console.log(`\n${colors.blue}[PUT] Update Pajak${colors.reset}`);
    const updateRes = await request('PUT', `/kas-pembantu/pajak/${createdPajakId}`, {
      uraian: 'TEST: PPh 21 UPDATED',
      no_bukti: 'TEST-PJK-001-REV',
      pemotongan: 300000
    });
    assert(updateRes.ok, 'PUT /pajak/:id - Status 200');
    
    // 6. DELETE pajak
    console.log(`\n${colors.blue}[DELETE] Delete Pajak${colors.reset}`);
    const deleteRes = await request('DELETE', `/kas-pembantu/pajak/${createdPajakId}`);
    assert(deleteRes.ok, 'DELETE /pajak/:id - Status 200');
  }
  
  // 7. Validation tests
  console.log(`\n${colors.blue}[VALIDATION] Pajak${colors.reset}`);
  const missingTanggalRes = await request('POST', '/kas-pembantu/pajak', {
    bku_id: 'bku004',
    uraian: 'Test tanpa tanggal',
    no_bukti: 'TEST-VAL',
    pemotongan: 100000
  });
  assert(!missingTanggalRes.ok, 'POST tanpa tanggal - Ditolak');
  
  const missingNoBuktiRes = await request('POST', '/kas-pembantu/pajak', {
    bku_id: 'bku004',
    tanggal: '2024-12-01',
    uraian: 'Test tanpa no_bukti',
    pemotongan: 100000
  });
  assert(!missingNoBuktiRes.ok, 'POST tanpa no_bukti - Ditolak');
}

async function testExportFeatures() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ EXPORT FEATURES ━━━${colors.reset}`);
  
  // Export endpoints return Excel files, just check they don't error
  const kegiatanExport = await request('GET', '/kas-pembantu/kegiatan/export');
  assert(kegiatanExport.ok || kegiatanExport.status === 200, 'Export Kegiatan - Endpoint accessible');
  
  const panjarExport = await request('GET', '/kas-pembantu/panjar/export');
  assert(panjarExport.ok || panjarExport.status === 200, 'Export Panjar - Endpoint accessible');
  
  const pajakExport = await request('GET', '/kas-pembantu/pajak/export');
  assert(pajakExport.ok || pajakExport.status === 200, 'Export Pajak - Endpoint accessible');
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════╗
║       AUTOMATED QA TEST - MODUL KAS PEMBANTU             ║
║         (Kegiatan, Panjar, Pajak)                        ║
╚══════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}Base URL: ${BASE_URL}${colors.reset}
${colors.yellow}Date: ${new Date().toLocaleString('id-ID')}${colors.reset}
`);

  const startTime = Date.now();
  
  try {
    // 1. Auth test
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log(`\n${colors.red}❌ Auth failed! Aborting tests.${colors.reset}`);
      process.exit(1);
    }
    
    // 2. Module tests
    await testKegiatanModule();
    await testPanjarModule();
    await testPajakModule();
    
    // 3. Export tests
    await testExportFeatures();
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Test error: ${error.message}${colors.reset}`);
    console.error(error);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                          ║
╚══════════════════════════════════════════════════════════╝${colors.reset}

  ${colors.green}✓ Passed: ${results.passed}${colors.reset}
  ${colors.red}✗ Failed: ${results.failed}${colors.reset}
  ────────────────
  Total:   ${results.passed + results.failed}
  
  Pass Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%
  Duration:  ${duration}s
`);

  // Exit with error code if any test failed
  if (results.failed > 0) {
    console.log(`${colors.red}Some tests failed!${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.green}All tests passed!${colors.reset}\n`);
    process.exit(0);
  }
}

// Run tests
runAllTests();
