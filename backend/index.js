import express from 'express';
const http = require('http');
const cors = require('cors');
const { Pool } = require('pg');  // example
const logger = require('./src/common/logger');
const { attachLogging, rateLimiter, securityHeaders } = require('./src/api/middleware');
const { initializeRoutes } = require('./src/api/router');

async function main() {
  // Initialize logger
  const isProduction = process.env.NODE_ENV === 'production';
  logger.initLogger('backend-api', isProduction);

  const log = logger.getLogger();

  // Database connection (example with pg Pool)
  const dbConfig = {
    connectionString: process.env.DB_URL,
    // optionally: max, idleTimeoutMillis, etc
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  };
  const pool = new Pool(dbConfig);

  try {
    // Test connection
    await pool.query('SELECT 1');
  } catch (err) {
    log.error({ err }, 'Failed to connect to DB on startup');
    process.exit(1);
  }

  const app = express();

  // Middlewares

  // Body parsing + request size limit
  app.use(express.json({ limit: '28mb' }));
  app.use(express.urlencoded({ extended: true, limit: '28mb' }));

  // Logging (request id + request logging)
  app.use(attachLogging());

  // Security headers
  app.use(securityHeaders());

  // CORS
  const corsUrls = process.env.CORS_URL || '';
  const allowedOrigins = corsUrls.split(',').map(s => s.trim()).filter(s => s);
  if (allowedOrigins.length > 0) {
    app.use(cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      exposedHeaders: ['Content-Length', 'Authorization', 'Content-Type'],
      maxAge: 12 * 60 * 60, // in seconds
    }));
  } else {
    // If no allowedOrigins configured, you could default to allow all or none
    app.use(cors());
  }

  // Rate limiter
  app.use(rateLimiter());

  // Mount routers
  // `initializeRoutes` should accept (app, dependencies) or return a router
  initializeRoutes(app, { db: pool /*, other dependencies if any */ });

  // 404 fallback
  app.use((_, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Error handling
  app.use((err, req, res, _) => {
    // Log via request logger if exists
    if (req.log) {
      req.log.error({ err }, 'Unhandled error');
    } else {
      log.error({ err }, 'Unhandled error (no req.log)');
    }
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  });

  const port = parseInt(process.env.PORT, 10) || 3000;
  const server = http.createServer(app);

  server.listen(port, () => {
    log.info(`Server listening on port ${port}`);
  });

  // Graceful shutdown logic
  const shutdown = () => {
    log.info('Received shutdown signal, closing server...');
    server.close(async (err) => {
      if (err) {
        log.error({ err }, 'Error during server close');
        process.exit(1);
      }
      try {
        // close DB
        await pool.end();
        log.info('Database pool closed');
      } catch (dbErr) {
        log.error({ dbErr }, 'Error closing DB pool');
      }
      log.info('Shutdown complete');
      process.exit(0);
    });

    // Fallback: force exit if not closed in N ms
    setTimeout(() => {
      log.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10 * 1000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Failed to start application', err);
  process.exit(1);
});
