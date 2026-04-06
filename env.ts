// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.MONGODB_URI, 'MongoDB URI of emote DB is missing from env');
export const MONGODB_URI = process.env.MONGODB_URI;

export const emotes = {
    uri: MONGODB_URI,
};
