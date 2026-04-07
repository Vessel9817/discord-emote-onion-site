import mongoose, { Schema } from 'mongoose';
import assert from 'node:assert';

export interface Sticker {
    readonly id: string;
    name: string;
    ext: 'png' | 'json' | 'apng' | 'gif';
}

export type PartialSticker = { [P in keyof Sticker]?: Sticker[P] | null | undefined; } & { readonly id: string };

export const StickerSchema = new Schema({
    id: String,
    name: String,
    ext: String
});

export const StickerModel = mongoose.model('stickers', StickerSchema);

export async function get(ids: string[] | Set<string>) {
    if ((ids instanceof Set && ids.size < 1)
            || (Array.isArray(ids) && ids.length < 1)) {
        return [];
    }

    return await StickerModel.find({ id: { $in: [...ids] } });
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

const extPrecedence: Record<Sticker['ext'], number> = {
    png: 0,
    json: 1,
    apng: 2,
    gif: 3
};

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
    const writes: Parameters<typeof StickerModel.bulkWrite>[0] = [];

    for (const sticker of stickers) {
        writes.push({
            updateOne: {
                filter: { id: sticker.id },
                update: sticker,
                upsert: true
            }
        });
    }
    
    return await StickerModel.bulkWrite(writes);
}
