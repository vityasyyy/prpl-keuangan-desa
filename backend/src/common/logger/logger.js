// utils/logger.js
import pino from "pino";

let baseLogger;

function initLogger(serviceName, isProduction) {
  const level = isProduction ? 'info' : 'debug';

  baseLogger = pino({
    level,
    base: {
      service: serviceName
    },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}

// Get the base logger
function getLogger() {
  if (!baseLogger) {
    // fallback or initialize default
    baseLogger = pino();
  }
  return baseLogger;
}

export default {
  initLogger,
  getLogger
};

export {
  initLogger,
  getLogger
};
