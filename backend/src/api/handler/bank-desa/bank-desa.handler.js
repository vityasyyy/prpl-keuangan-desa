import * as repo from '../../../repository/bank-desa/bank-desa.repo.js'; // Import repository functions
import { logInfo, logError } from '../../../common/logger/logger.js';
import crypto from 'crypto';

/**
 * Helper function (internal to this handler) to calculate the new balance.
 * This remains a pure function.
 */
function _calculateNewBalance(latestSaldo = 0, entryData, log = null) {
  const {
    setoran = 0,
    penerimaan_bunga = 0,
    penarikan = 0,
    pajak = 0,
    biaya_admin = 0,
  } = entryData;

  const numLatestSaldo = Number(latestSaldo) || 0;
  const numSetoran = Number(setoran) || 0;
  const numPenerimaanBunga = Number(penerimaan_bunga) || 0;
  const numPenarikan = Number(penarikan) || 0;
  const numPajak = Number(pajak) || 0;
  const numBiayaAdmin = Number(biaya_admin) || 0;

  const totalMasuk = numSetoran + numPenerimaanBunga;
  const totalKeluar = numPenarikan + numPajak + numBiayaAdmin;

  const newSaldo = numLatestSaldo + totalMasuk - totalKeluar;
  logInfo(`Calculating balance: ${numLatestSaldo} + ${totalMasuk} - ${totalKeluar} = ${newSaldo}`, 
    { layer: 'handler', operation: 'calculateBalance' }, 10, log);
  return newSaldo;
}


/**
 * Handler for creating a new bank transaction entry (POST /api/bank-desa).
 * Orchestrates fetching last balance, calculating new balance, and inserting via repository.
 * Manages the database transaction.
 * @param {object} db - The database pool passed from the router.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export async function createBukuBankEntry(db, req, res, next) {
  const log = req?.log;
  const entryData = req.body;
  logInfo('Handling request to create bank entry', 
    { layer: 'handler', route: 'POST /bank-desa', entryData }, 10, log);

  // Validate basic required fields
  if (!entryData.tanggal || !entryData.uraian) {
     logInfo('Validation failed: Tanggal and Uraian are required', 
       { layer: 'handler', route: 'POST /bank-desa' }, 10, log);
     return res.status(400).json({ message: 'Tanggal and Uraian are required' });
  }

  let client; // Declare client outside try block for visibility in finally
  try {
    client = await db.connect(); // Get a client for transaction
    logInfo('Database client acquired for createBukuBankEntry', 
      { layer: 'handler', route: 'POST /bank-desa' }, 10, log);
    await client.query('BEGIN'); // Start transaction

    // 1. Get the last saldo using the repository
    const latestEntry = await repo.findLatestEntry(client); // Pass client to repo function
    const latestSaldo = latestEntry ? latestEntry.saldo_after : 0;
    logInfo(`Latest saldo fetched: ${latestSaldo}`, 
      { layer: 'handler', route: 'POST /bank-desa', latestSaldo }, 10, log);

    // 2. Calculate the new balance
    const newSaldo = _calculateNewBalance(latestSaldo, entryData, log);
    logInfo(`Calculated new saldo: ${newSaldo}`, 
      { layer: 'handler', route: 'POST /bank-desa', newSaldo }, 10, log);

    // 3. Prepare the full data object for insertion
    const dataToInsert = {
      ...entryData,
      saldo_after: newSaldo,
    };

    // 4. Insert the new entry using the repository
    const newEntry = await repo.insertEntry(client, dataToInsert); // Pass client to repo function

    // 5. Commit the transaction
    await client.query('COMMIT');
    logInfo('COMMIT transaction successful', 
      { layer: 'handler', route: 'POST /bank-desa', entryId: newEntry?.id }, 10, log);

    // 6. Send response
    res.status(201).json(newEntry);

  } catch (error) {
    logError(error, 'Error during createBukuBankEntry handling', 
      { layer: 'handler', route: 'POST /bank-desa' }, log);
    // Rollback transaction if a client was acquired
    if (client) {
      try {
        await client.query('ROLLBACK');
        logInfo('ROLLBACK transaction due to error', 
          { layer: 'handler', route: 'POST /bank-desa' }, 10, log);
      } catch (rollbackError) {
        logError(rollbackError, 'Failed to rollback transaction', 
          { layer: 'handler', route: 'POST /bank-desa' }, log);
      }
    }
    next(error); // Pass error to the central error handler
  } finally {
    // ALWAYS release the client
    if (client) {
      client.release();
      logInfo('Database client released for createBukuBankEntry', 
        { layer: 'handler', route: 'POST /bank-desa' }, 10, log);
    }
  }
}

/**
 * Handler for fetching all bank transaction entries (GET /api/bank-desa).
 * @param {object} db - The database pool passed from the router.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export async function getBukuBankEntries(db, req, res, next) {
  const log = req?.log;
  try {
    logInfo('Handling request to get all bank entries', 
      { layer: 'handler', route: 'GET /bank-desa' }, 10, log);
    // Fetch data using the repository, passing the pool directly
    const entries = await repo.findAllEntries(db);

    // Recalculate running balance on the fly to ensure correctness
    // regardless of insertion order or backdated entries.
    let runningBalance = 0;
    const recalculatedEntries = entries.map(entry => {
        const setoran = Number(entry.setoran) || 0;
        const bunga = Number(entry.penerimaan_bunga) || 0;
        const penarikan = Number(entry.penarikan) || 0;
        const pajak = Number(entry.pajak) || 0;
        const admin = Number(entry.biaya_admin) || 0;

        const totalMasuk = setoran + bunga;
        const totalKeluar = penarikan + pajak + admin;

        runningBalance = runningBalance + totalMasuk - totalKeluar;

        return {
            ...entry,
            saldo_after: runningBalance
        };
    });

    logInfo('Bank entries fetched successfully', 
      { layer: 'handler', route: 'GET /bank-desa', count: recalculatedEntries.length }, 10, log);
    res.status(200).json(recalculatedEntries);
  } catch (error) {
    logError(error, 'Error during getBukuBankEntries handling', 
      { layer: 'handler', route: 'GET /bank-desa' }, log);
    next(error); // Pass error to the central error handler
  }
}

/**
 * Handler for creating a reversal entry for an existing transaction (DELETE semantics).
 * It inserts a new opposite entry to neutralize the original and recomputes saldo.
 * @param {object} db - pool
 */
export async function reverseBukuBankEntry(db, req, res, next) {
  const log = req?.log;
  const id = req.params?.id;
  const tanggalOverride = req.query?.tanggal; // optional YYYY-MM-DD
  logInfo('Handling request to reverse bank entry', 
    { layer: 'handler', route: 'DELETE /bank-desa/:id', id, tanggalOverride }, 10, log);

  let client;
  try {
    const original = await repo.findById(db, id);
    if (!original) {
      logInfo('Entry not found for reversal', 
        { layer: 'handler', route: 'DELETE /bank-desa/:id', id }, 10, log);
      return res.status(404).json({ message: 'Entry not found' });
    }

    // Build reversed payload
    const tanggal = tanggalOverride || original.tanggal;
    const toNum = (v) => (v == null ? 0 : Number(v));
    const neg = (v) => (v == null ? 0 : -Math.abs(Number(v)));

    const reversalBody = {
      tanggal,
      uraian: `[REVERSAL] ${original.uraian || original.bukti_transaksi || original.id}`,
      bukti_transaksi: original.bukti_transaksi ? `${String(original.bukti_transaksi).slice(0, 45)}-REV` : 'REV',
      setoran: neg(toNum(original.setoran)),
      penerimaan_bunga: neg(toNum(original.penerimaan_bunga)),
      penarikan: neg(toNum(original.penarikan)),
      pajak: neg(toNum(original.pajak)),
      biaya_admin: neg(toNum(original.biaya_admin)),
    };

    client = await db.connect();
    await client.query('BEGIN');

    // Get latest saldo
    const latestEntry = await repo.findLatestEntry(client);
    const latestSaldo = latestEntry ? latestEntry.saldo_after : 0;
    const newSaldo = _calculateNewBalance(latestSaldo, reversalBody, log);

    const dataToInsert = { ...reversalBody, saldo_after: newSaldo };
    const newEntry = await repo.insertEntry(client, dataToInsert);

    await client.query('COMMIT');
    logInfo('Reversal entry created successfully', 
      { layer: 'handler', route: 'DELETE /bank-desa/:id', reversedId: id, reversalId: newEntry?.id }, 10, log);
    return res.status(201).json({ reversed: id, reversal: newEntry });
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    logError(error, 'Error during reverseBukuBankEntry handling', 
      { layer: 'handler', route: 'DELETE /bank-desa/:id', id }, log);
    next(error);
  } finally {
    if (client) client.release();
  }
}
