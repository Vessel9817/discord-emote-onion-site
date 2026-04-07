import mongoose, { Schema } from 'mongoose';

export interface Sticker {
    readonly id: string;
    name: string;
    ext: 'png' | 'json' | 'apng' | 'gif';
}

export type PartialSticker = Partial<Sticker> & { readonly id: string };

export const StickerSchema = new Schema({
    id: String,
    name: String,
    ext: String
});

export const StickerModel = mongoose.model('stickers', StickerSchema);

export async function get(ids: string[]) {
    if (ids.length < 1) {
        return [];
    }

    return await StickerModel.find({ id: { $in: ids } });
}

export async function update(partialStickers: PartialSticker[]) {
    const extPrecedence: Record<Sticker['ext'], number> = {
        png: 0,
        json: 1,
        apng: 2,
        gif: 3
    };
    const ids = partialStickers.map((p) => p.id);
    const oldStickers = new Map((await get(ids)).map((e) => [e.id, e]));
    const stickers: Sticker[] = partialStickers.map((newSticker) => {
        const oldSticker = oldStickers.get(newSticker.id);
        const newName = newSticker.name ?? '';
        const newExt = newSticker.ext ?? 'png';
        let prioritizedExt = (oldSticker?.ext ?? 'png') as Sticker['ext'];

        if (extPrecedence[newExt] > extPrecedence[prioritizedExt]) {
            prioritizedExt = newExt;
        }

        return {
            id: newSticker.id,
            name: newName.length > 0 ? newName : (oldSticker?.name ?? ''),
            ext: prioritizedExt
        };
    });
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
