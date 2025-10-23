import { Router } from 'express';
// Import the handler functions
import {
  createBukuBankEntry,
  getBukuBankEntries,
} from '../../handler/bank-desa/bank-desa.handler.js'; // Correct path to handler
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

  // Add other routes for bank-desa here if needed (e.g., GET /:id, PUT /:id, DELETE /:id)

  return router;
}