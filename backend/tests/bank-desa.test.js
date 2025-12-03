/**
 * ============================================
 * AUTOMATED QA TEST SUITE
 * Modul Buku Bank Desa
 * ============================================
 * 
 * Cara menjalankan:
 *   cd backend
 *   node tests/bank-desa.test.js
 * 
 * Pastikan:
 *   1. Backend sudah running di localhost:3001
 *   2. Database sudah di-seed dengan data test
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';

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

async function testRBACUnauthorized() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ RBAC TESTS (Unauthorized) ━━━${colors.reset}`);
  
  // Clear cookies to simulate unauthenticated user
  const originalCookies = cookies;
  cookies = '';
  
  // Test GET without auth
  const getRes = await request('GET', '/bank-desa');
  assert(getRes.status === 401, 'GET /bank-desa tanpa auth - Status 401');
  
  // Test POST without auth
  const postRes = await request('POST', '/bank-desa', {
    tanggal: '2024-12-01',
    uraian: 'Test entry',
    setoran: 100000
  });
  assert(postRes.status === 401, 'POST /bank-desa tanpa auth - Status 401');
  
  // Restore cookies
  cookies = originalCookies;
}

async function testBankDesaModule() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ MODUL BUKU BANK DESA ━━━${colors.reset}`);
  
  // 1. GET all entries
  console.log(`\n${colors.blue}[GET] List Bank Entries${colors.reset}`);
  const listRes = await request('GET', '/bank-desa');
  assert(listRes.ok, 'GET /bank-desa - Status 200');
  assert(Array.isArray(listRes.data), 'GET /bank-desa - Response adalah array');
  
  const initialCount = listRes.data?.length || 0;
  console.log(`  ${colors.yellow}Info: ${initialCount} entries dalam database${colors.reset}`);
  
  // 2. POST create entry (setoran)
  console.log(`\n${colors.blue}[POST] Create Bank Entry - Setoran${colors.reset}`);
  const createRes = await request('POST', '/bank-desa', {
    tanggal: '2024-12-01',
    uraian: 'TEST: Setoran Dana Desa Automated Test',
    bukti_transaksi: 'TEST-BANK-001',
    setoran: 5000000,
    penerimaan_bunga: 0,
    penarikan: 0,
    pajak: 0,
    biaya_admin: 0
  });
  assert(createRes.ok, 'POST /bank-desa - Status 201');
  const createdEntryId = createRes.data?.id;
  assert(!!createdEntryId, 'POST /bank-desa - ID generated');
  assert(createRes.data?.saldo_after !== undefined, 'POST /bank-desa - saldo_after dihitung');
  
  // 3. POST create entry (penarikan)
  console.log(`\n${colors.blue}[POST] Create Bank Entry - Penarikan${colors.reset}`);
  const withdrawRes = await request('POST', '/bank-desa', {
    tanggal: '2024-12-02',
    uraian: 'TEST: Penarikan untuk Belanja',
    bukti_transaksi: 'TEST-BANK-002',
    setoran: 0,
    penerimaan_bunga: 0,
    penarikan: 1000000,
    pajak: 0,
    biaya_admin: 0
  });
  assert(withdrawRes.ok, 'POST /bank-desa penarikan - Status 201');
  const withdrawId = withdrawRes.data?.id;
  
  // 4. GET updated list
  console.log(`\n${colors.blue}[GET] Verify New Entries${colors.reset}`);
  const updatedListRes = await request('GET', '/bank-desa');
  assert(updatedListRes.ok, 'GET /bank-desa after create - Status 200');
  const newCount = updatedListRes.data?.length || 0;
  assert(newCount === initialCount + 2, `Entry count increased by 2 (${initialCount} -> ${newCount})`);
  
  // 5. Verify running balance calculation
  console.log(`\n${colors.blue}[VERIFY] Running Balance${colors.reset}`);
  if (updatedListRes.data && updatedListRes.data.length > 0) {
    let runningBalance = 0;
    let balanceCorrect = true;
    
    for (const entry of updatedListRes.data) {
      const setoran = Number(entry.setoran) || 0;
      const bunga = Number(entry.penerimaan_bunga) || 0;
      const penarikan = Number(entry.penarikan) || 0;
      const pajak = Number(entry.pajak) || 0;
      const admin = Number(entry.biaya_admin) || 0;
      
      runningBalance += (setoran + bunga) - (penarikan + pajak + admin);
      
      if (Number(entry.saldo_after) !== runningBalance) {
        balanceCorrect = false;
        break;
      }
    }
    
    assert(balanceCorrect, 'Running balance calculation correct');
  }
  
  // 6. DELETE/Reversal entry
  if (withdrawId) {
    console.log(`\n${colors.blue}[DELETE] Reverse Bank Entry${colors.reset}`);
    const deleteRes = await request('DELETE', `/bank-desa/${withdrawId}`);
    assert(deleteRes.ok, 'DELETE /bank-desa/:id - Status 201 (reversal created)');
    assert(!!deleteRes.data?.reversal, 'DELETE /bank-desa/:id - Reversal entry created');
    assert(deleteRes.data?.reversed === withdrawId, 'DELETE /bank-desa/:id - Correct entry reversed');
  }
  
  // 7. Validation tests
  console.log(`\n${colors.blue}[VALIDATION] Bank Desa${colors.reset}`);
  
  const missingTanggalRes = await request('POST', '/bank-desa', {
    uraian: 'Test tanpa tanggal',
    bukti_transaksi: 'TEST-VAL',
    setoran: 100000
  });
  assert(!missingTanggalRes.ok, 'POST tanpa tanggal - Ditolak');
  
  const missingUraianRes = await request('POST', '/bank-desa', {
    tanggal: '2024-12-01',
    bukti_transaksi: 'TEST-VAL-2',
    setoran: 100000
  });
  assert(!missingUraianRes.ok, 'POST tanpa uraian - Ditolak');
  
  // 8. Cleanup - reverse the test entries
  if (createdEntryId) {
    console.log(`\n${colors.blue}[CLEANUP] Reverse Test Entries${colors.reset}`);
    const cleanupRes = await request('DELETE', `/bank-desa/${createdEntryId}`);
    assert(cleanupRes.ok, 'Cleanup: Reverse test setoran entry');
  }
}

async function testPrintEndpoint() {
  console.log(`\n${colors.cyan}${colors.bright}━━━ PRINT ENDPOINT ━━━${colors.reset}`);
  
  // Test print endpoint (just check it doesn't error)
  const printRes = await fetch(`${BASE_URL}/bank-desa/print?year=2024&month=12&autoPrint=false`, {
    headers: { 'Cookie': cookies }
  });
  
  assert(printRes.ok || printRes.status === 200, 'GET /bank-desa/print - Endpoint accessible');
  
  const contentType = printRes.headers.get('content-type');
  assert(contentType?.includes('text/html'), 'GET /bank-desa/print - Returns HTML');
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runAllTests() {
  console.log(`
${colors.bright}╔══════════════════════════════════════════════════════════╗
║       AUTOMATED QA TEST - MODUL BUKU BANK DESA           ║
╚══════════════════════════════════════════════════════════╝${colors.reset}

${colors.yellow}Base URL: ${BASE_URL}${colors.reset}
${colors.yellow}Date: ${new Date().toLocaleString('id-ID')}${colors.reset}
`);

  const startTime = Date.now();
  
  try {
    // 1. RBAC test (unauthorized)
    await testRBACUnauthorized();
    
    // 2. Auth test
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log(`\n${colors.red}❌ Auth failed! Aborting tests.${colors.reset}`);
      process.exit(1);
    }
    
    // 3. Bank Desa module tests
    await testBankDesaModule();
    
    // 4. Print endpoint test
    await testPrintEndpoint();
    
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
