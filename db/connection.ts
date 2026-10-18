import mongoose from 'mongoose';

const RETRY_INTERVAL_MS = 5000;

/**
 * @returns Whether the database is currently usable
 */
export function isConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}

/**
 * Connects to the database, retrying until it succeeds. Does nothing if a
 * connection is already open or being opened.
 * @param uri The connection string
 * @param retryMs How long to wait before another attempt
 */
export async function connect(
    uri: string,
    retryMs: number = RETRY_INTERVAL_MS
): Promise<void> {
    if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
        return;
    }

    try {
        await mongoose.connect(uri);
    }
    catch (err) {
        // Not the message, which can carry the connection string
        const name = err instanceof Error ? err.name : 'unknown error';

        console.error(`Database connection failed (${name}), retrying`);
        // Mongoose can fail after the driver connected, as on a '.' in the database name
        await mongoose.connection.close().catch(() => undefined);
        setTimeout(() => void connect(uri, retryMs), retryMs);
    }
}
