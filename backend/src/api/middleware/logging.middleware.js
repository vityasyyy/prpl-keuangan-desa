
// middleware/logger.js
import { pinoHttp } from 'pino-http';
import { getLogger } from '../../common/logger/logger.js';
import crypto from 'crypto';

/**
 * Middleware to ensure each request has a request_id.
 * If client provides, you can reuse; else generate a new one.
 */
function requestIdMiddleware(req, res, next) {
  const headerRequestId = req.headers['x-request-id'];
  if (headerRequestId && typeof headerRequestId === 'string' && headerRequestId.trim() !== '') {
    req.requestId = headerRequestId;
  } else {
    req.requestId = crypto.randomUUID();  // or use uuid v4
  }
  // Could also set response header
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

/**
 * pino-http middleware for logging requests.
 * It will create a child logger per request with fields: request_id, method, url, etc.
 * And attach it to req.log
 */
function requestLoggingMiddleware() {
  const base = getLogger();
  return pinoHttp({
    logger: base,
    customLogLevel: function (res, err) {
      if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    customSuccessMessage: function (req, res) {
      return 'Request completed';
    },
    serializers: {
      req: (req) => {
        // default serializer logs method, url, headers, etc.
        return {
          method: req.method,
          url: req.url,
          request_id: req.requestId,
          // you can include more fields if you like
        };
      },
      res: (res) => {
        return {
          statusCode: res.statusCode,
        };
      }
    },
    customAttributeKeys: {
      req: 'req',
      res: 'res',
      err: 'err'
    },
    wrapSerializers: true
  });
}

/**
 * Middleware to connect requestId first, then logging
 */
function attachLogging() {
  return function (req, res, next) {
    requestIdMiddleware(req, res, () => {
      // Then pino-http logging
      const logMiddleware = requestLoggingMiddleware();
      logMiddleware(req, res, next);
    });
  };
}

export {
  attachLogging,
  requestIdMiddleware,
  requestLoggingMiddleware
};
