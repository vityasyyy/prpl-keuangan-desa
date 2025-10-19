// router/container.router.js
// This file aggregates all route modules and initializes them

/**
 * Initialize all routes
 * @param {import('express').Application} app - Express application
 * @param {Object} dependencies - Shared dependencies (e.g., db pool)
 */
export function initializeRoutes(app, dependencies) {
  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  // Mount module-specific routers here
  // Example:
  // import kasUmumRouter from './kas-umum/kas-umum.router.js';
  // app.use('/api/kas-umum', kasUmumRouter(dependencies));
  
  // Add more routes as needed
}
