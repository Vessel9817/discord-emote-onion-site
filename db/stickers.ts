import mongoose, { Schema } from 'mongoose';

export interface Sticker {
    readonly id: string;
    name: string;
    ext: string;
}

export type PartialSticker = Partial<Sticker> & { id: string };

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

    return await StickerModel.find<Sticker>({
        id: {
            $in: ids
        }
    });
}

export async function update(partialStickers: PartialSticker[] | Map<string, PartialSticker>) {
    const newEntries = Object.fromEntries(partialStickers instanceof Map
        ? partialStickers
        : partialStickers.map((e) => [e.id, e]));

    return await StickerModel.updateMany(
        {
            id: {
                $in: Object.keys(newEntries)
            }
        },
        [
            {
                $set: {
                    name: {
                        // If new name isn't blank, use it
                        $cond: {
                            if: { $eq: ['$$newName', ''] },
                            then: { $ifNull: ['$$name', ''] },
                            else: '$$newName'
                        }
                    },
                    ext: {
                        // If new file type is preferred, use it
                        $cond: {
                            if: { $gt: ['$$precedence.$$ext', '$$precedence.$$newExt'] },
                            then: '$$newExt',
                            else: '$$ext'
                        }
                    }
                }
            }
        ],
        {
            upsert: true,
            let: {
                // Defaulting fields in case we're creating a new document
                name: {
                    $cond: {
                        if: { name: { $exists: true } },
                        then: '$$name',
                        else: ''
                    }
                },
                ext: {
                    $cond: {
                        if: { ext: { $exists: true } },
                        then: '$$ext',
                        else: 'png'
                    }
                },
                // Initializing new fields
                map: newEntries,
                newEntry: '$$map.$$id',
                newName: { $ifNull: ['$$newEntry.name', ''] },
                newExt: { $ifNull: ['$$newEntry.ext', 'png'] },
                precedence: {
                    // Prefer animation, then portability
                    png: 0,
                    json: 1,
                    apng: 2,
                    gif: 3
                }
            }
        }
    );
}
