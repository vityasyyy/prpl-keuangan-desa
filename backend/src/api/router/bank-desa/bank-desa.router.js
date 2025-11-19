import { Router } from 'express';
// Import the handler functions
import {
  createBukuBankEntry,
  getBukuBankEntries,
  reverseBukuBankEntry,
} from '../../handler/bank-desa/bank-desa.handler.js'; // Correct path to handler
import { generateBukuBankPrintHtml } from '../../../service/bank-desa/bank-desa.service.js';
// import { requireAuth } from '../../middleware/auth.middleware.js'; // Keep commented for now

/**
 * Creates and configures the router for Buku Bank endpoints.
 * @param {object} dependencies - Dependencies injected from initializeRoutes (e.g., db pool).
 * @returns {Router} Configured Express router.
 */
export default function bankDesaRouter(dependencies) { // Renamed function for clarity
  const router = Router();
  const { db } = dependencies; // Extract the db pool

  // Define the POST route, passing 'db' to the handler
  router.post(
    '/',
    // requireAuth,
    createBukuBankEntry.bind(null, db) // Inject db into createBukuBankEntry handler
  );

  // Define the GET route, passing 'db' to the handler
  router.get(
    '/',
    // requireAuth,
    getBukuBankEntries.bind(null, db) // Inject db into getBukuBankEntries handler
  );

  // Reversal (DELETE semantics): create an opposite entry
  router.delete(
    '/:id',
    // requireAuth,
    reverseBukuBankEntry.bind(null, db)
  );

  router.get('/print', async (req, res, next) => {
    try {
      const year = Number(req.query.year);
      const month = Number(req.query.month);
      const autoPrint = req.query.autoPrint === 'false' ? false : true;
      const meta = {
        desa: req.query.desa,
        kecamatan: req.query.kecamatan,
        bankCabang: req.query.bankCabang,
        rekNo: req.query.rekNo,
      };
      const html = await generateBukuBankPrintHtml(db, { year, month, meta, autoPrint });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err) {
      if (err?.status) {
        res.status(err.status).send(err.message);
      } else {
        next(err);
      }
    }
  });

  // Add other routes for bank-desa here if needed (e.g., GET /:id, PUT /:id, DELETE /:id)

  return router;
}