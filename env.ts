// Validates and exports env vars
import assert from 'node:assert';

assert.ok(process.env.MONGODB_URI, 'MongoDB URI of emote DB is missing from env');
export const MONGODB_URI = process.env.MONGODB_URI;

assert.ok(process.env.EMOJI_COLLECTION_NAME, 'Emoji collection name of emote DB is missing from env');
export const EMOJI_COLLECTION_NAME = process.env.EMOJI_COLLECTION_NAME;

assert.ok(process.env.STICKER_COLLECTION_NAME, 'Sticker collection name of emote DB is missing from env');
export const STICKER_COLLECTION_NAME = process.env.STICKER_COLLECTION_NAME;

export const emotes = {
    uri: MONGODB_URI,
    emojis: EMOJI_COLLECTION_NAME,
    stickers: STICKER_COLLECTION_NAME
};
