// Validates and exports env vars
import assert from 'node:assert';

const MONGODB_URI = process.env.MONGODB_URI;
assert.ok(MONGODB_URI, 'MongoDB URI of emote DB is missing from env');

export const emotes = {
    uri: MONGODB_URI,
};

assert.ok(process.env.ONION_HOSTNAME, 'Onion hostname is missing from env');
export const domain = process.env.ONION_HOSTNAME;
