import { logger } from './logger.js';

/**
 * A simple in-memory transport for MCP communication within the same browser tab.
 */
export class InMemoryTransport {
    constructor() {
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        this.otherSide = null;
    }

    /**
     * Connects this transport to another transport instance.
     * @param {InMemoryTransport} other 
     */
    connect(other) {
        this.otherSide = other;
        other.otherSide = this;
    }

    async start() {
        // No startup logic needed for in-memory
    }

    async send(message) {
        if (!this.otherSide) {
            logger.error('Attempted to send message over unconnected transport.');
            throw new Error('Transport not connected');
        }
        
        // Use setTimeout to ensure asynchronous delivery
        setTimeout(() => {
            if (this.otherSide.onmessage) {
                this.otherSide.onmessage(message);
            }
        }, 0);
    }

    async close() {
        logger.debug('Closing transport.');
        if (this.onclose) this.onclose();
        if (this.otherSide && this.otherSide.onclose) {
            this.otherSide.onclose();
        }
    }
}

/**
 * Creates a pair of connected in-memory transports.
 * One for the server, one for the client.
 */
export function createTransportPair() {
    const serverTransport = new InMemoryTransport();
    const clientTransport = new InMemoryTransport();
    serverTransport.connect(clientTransport);
    return { serverTransport, clientTransport };
}
