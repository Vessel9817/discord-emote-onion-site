import mongoose, { Schema } from 'mongoose';
import assert from 'node:assert';
import { DISCORD_EPOCH, MAX_LONG } from './index';

export interface Sticker {
    readonly id: string;
    name: string;
    ext: 'png' | 'json' | 'apng' | 'gif';
}

export type PartialSticker = { [P in keyof Sticker]?: Sticker[P] | null | undefined; } & { readonly id: string };

export const StickerSchema = new Schema({
    id: { type: String, index: true },
    name: String,
    ext: String
});

const extPrecedence: Record<Sticker['ext'], number> = {
    png: 0,
    json: 1,
    apng: 2,
    gif: 3
};

export const Model = mongoose.model('stickers', StickerSchema);

export function validate(
    partialSticker: unknown
): asserts partialSticker is PartialSticker {
    assert(partialSticker != null);
    assert(typeof partialSticker === 'object');
    assert('id' in partialSticker);
    assert(typeof partialSticker.id === 'string');

    const id = BigInt(partialSticker.id);

    assert(id >= DISCORD_EPOCH);
    assert(id <= MAX_LONG);

    if ('name' in partialSticker) {
        assert(typeof partialSticker.name === 'string');
        assert(partialSticker.name.length <= 30);
    }
    if ('ext' in partialSticker) {
        assert(typeof partialSticker.ext === 'string');
        assert(partialSticker.ext in extPrecedence);
    }
}

export function validateAll(
    partialStickers: unknown[]
): asserts partialStickers is PartialSticker[] {
    for (const partialEmoji of partialStickers) {
        validate(partialEmoji);
    }
}

export async function get(ids: string[] | Set<string>) {
    if ((ids instanceof Set && ids.size < 1)
            || (Array.isArray(ids) && ids.length < 1)) {
        return [];
    }

    const newIds = [...ids].filter((id) => {
        try {
            validate({ id });
        }
        catch {
            return false;
        }

        return true;
    });

    return await Model.find({ id: { $in: newIds } });
}

/**
 * Sets the default values of a sticker
 */
export function setDefault(sticker: PartialSticker): Sticker {
    return {
        id: sticker.id,
        name: sticker?.name ?? '',
        ext: sticker?.ext ?? 'png'
    };
}

/**
 * Creates a new sticker, prioritizing certain given properties
 */
export function merge(
    sticker1: PartialSticker | null | undefined,
    sticker2: PartialSticker
): Sticker {
    const newSticker = setDefault(sticker2);

    if (sticker1 == null) {
        return newSticker;
    }

    assert.strictEqual(sticker1.id, sticker2.id,
            "Can't merge stickers: mismatched IDs");

    const oldSticker = setDefault(sticker1);

    return {
        id: oldSticker.id,
        name: newSticker.name.length > 0
            ? newSticker.name
            : oldSticker.name,
        ext: extPrecedence[newSticker.ext] >= extPrecedence[oldSticker.ext]
            ? newSticker.ext
            : oldSticker.ext
    };
}

/**
 * Upserts stickers to the DB
 */
export async function update(
    partialStickers: PartialSticker[]
): Promise<mongoose.mongo.BulkWriteResult> {
    // Prioritizing properties
    validateAll(partialStickers);

    const ids = new Set(partialStickers.map((p) => p.id));
    const oldStickers = new Map<string, Sticker>(
        (await get(ids)).map((s) => [s.id, s as Sticker])
    );
    let stickers = partialStickers.map((newSticker) =>
        merge(oldStickers.get(newSticker.id), newSticker)
    );

    // Deduplicating IDs
    if (ids.size < stickers.length) {
        const dedupeMap = new Map<string, Sticker>();

        for (const sticker of stickers) {
            if (dedupeMap.has(sticker.id)) {
                dedupeMap.set(sticker.id, merge(dedupeMap.get(sticker.id), sticker))
            }
            else {
                dedupeMap.set(sticker.id, sticker);
            }
        }

        stickers = [...dedupeMap.values()];
    }

    // Writing to DB
    const writes: Parameters<typeof Model.bulkWrite>[0] = [];

    for (const sticker of stickers) {
        writes.push({
            updateOne: {
                filter: { id: sticker.id },
                update: sticker,
                upsert: true
            }
        });
    }
    
    return await Model.bulkWrite(writes);
}
