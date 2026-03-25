// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.MONGODB_URI, 'MongoDB URI is missing from env');
export const MONGODB_URI = process.env.MONGODB_URI;
