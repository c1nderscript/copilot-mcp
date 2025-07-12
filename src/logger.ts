import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';

// Use stderr for logs to avoid interfering with JSON-RPC stdout transport
const logger = pino({ level }, pino.destination({ fd: 2 }));

export default logger;
