import logger from '../../common/logger/logger.js'; // Adjust path if needed

const log = logger.getLogger();

/**
 * Repository function to find the very last entry in the buku_bank table.
 * Used to get the most recent saldo_after.
 * @param {object} db - The database pool or client.
 * @returns {Promise<object | null>} The last entry object or null if table is empty.
 */
export async function findLatestEntry(db) {
  const query = 'SELECT saldo_after FROM buku_bank ORDER BY tanggal DESC, id DESC LIMIT 1';
  try {
    log.debug('Executing query: findLatestEntry');
    const result = await db.query(query);
    log.info(`findLatestEntry found ${result.rowCount} row(s)`);
    return result.rows[0] || null; // Return the first row or null
  } catch (err) {
    log.error({ err, query }, 'Error executing findLatestEntry query');
    throw err; // Re-throw the error to be handled upstream
  }
}

/**
 * Repository function to insert a new transaction entry into the buku_bank table.
 * Should be called within a transaction managed by the handler/service.
 * @param {object} client - The database client obtained from pool.connect().
 * @param {object} entryData - The complete data for the new entry, including calculated saldo_after.
 * @returns {Promise<object>} The newly inserted entry object.
 */
export async function insertEntry(client, entryData) {
  const {
    tanggal,
    uraian,
    bukti_transaksi,
    setoran,
    penerimaan_bunga,
    penarikan,
    pajak,
    biaya_admin,
    saldo_after // This is calculated in the handler
  } = entryData;

  const insertQuery = `
    INSERT INTO buku_bank 
      (tanggal, uraian, bukti_transaksi, setoran, penerimaan_bunga, penarikan, pajak, biaya_admin, saldo_after)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *; -- Return the full row that was inserted
  `;
  const values = [
    tanggal,
    uraian,
    bukti_transaksi || null,
    Number(setoran) || 0,
    Number(penerimaan_bunga) || 0,
    Number(penarikan) || 0,
    Number(pajak) || 0,
    Number(biaya_admin) || 0,
    Number(saldo_after) || 0
  ];

  try {
    log.debug({ query: insertQuery.replace(/\$\d+/g, '?'), values }, 'Executing query: insertEntry');
    const result = await client.query(insertQuery, values);
    log.info('insertEntry successful, 1 row inserted');
    return result.rows[0];
  } catch (err) {
    log.error({ err, query: insertQuery, values }, 'Error executing insertEntry query');
    throw err;
  }
}

/**
 * Repository function to fetch all entries from the buku_bank table.
 * Orders by date and then ID for consistency.
 * @param {object} db - The database pool.
 * @returns {Promise<Array<object>>} An array of all transaction entries.
 */
export async function findAllEntries(db) {
  const query = 'SELECT * FROM buku_bank ORDER BY tanggal ASC, id ASC';
  try {
    log.debug('Executing query: findAllEntries');
    const result = await db.query(query);
    log.info(`findAllEntries fetched ${result.rowCount} rows`);
    return result.rows;
  } catch (err) {
    log.error({ err, query }, 'Error executing findAllEntries query');
    throw err;
  }
}