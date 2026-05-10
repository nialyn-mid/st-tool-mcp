export const logLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
};

let currentLogLevel = logLevels.INFO;

/**
 * Sets the current log level.
 * @param {number} level 
 */
export function setLogLevel(level) {
    currentLogLevel = level;
}

/**
 * Logger utility following Ephemeris pattern.
 */
export const logger = {
    error: (...args) => {
        if (currentLogLevel >= logLevels.ERROR) console.error('[MCP Hub]', ...args);
    },
    warn: (...args) => {
        if (currentLogLevel >= logLevels.WARN) console.warn('[MCP Hub]', ...args);
    },
    info: (...args) => {
        if (currentLogLevel >= logLevels.INFO) console.info('[MCP Hub]', ...args);
    },
    debug: (...args) => {
        if (currentLogLevel >= logLevels.DEBUG) console.debug('[MCP Hub]', ...args);
    },
};
