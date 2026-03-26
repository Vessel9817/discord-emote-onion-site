import mongoose, { Schema } from 'mongoose';
import { emotes } from '../env';

export interface Emoji {
    id: string;
    name: string;
    animated: boolean;
}

export type PartialEmoji = Partial<Emoji> & { id: string };

export const EmojiSchema = new Schema({
    id: String,
    name: String,
    animated: Boolean
});

export const EmojiModel = mongoose.model(emotes.emojis, EmojiSchema);

export async function get(ids: string[]) {
    if (ids.length < 1) {
        return [];
    }

    return await EmojiModel.find({
        id: {
            $in: ids
        }
    });
}

export async function update(partialEmojis: PartialEmoji[] | Map<string, PartialEmoji>) {
    const newEntries = Object.fromEntries(partialEmojis instanceof Map
        ? partialEmojis
        : partialEmojis.map((e) => [e.id, e]));

    return await EmojiModel.updateMany(
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
                    animated: {
                        // Prefer animation
                        $or: ['$$animated', '$$newEntry.animated']
                    }
                }
            }
        ],
        {
            upsert: true,
            $let: {
                // Defaulting fields in case we're creating a new document
                name: {
                    $cond: {
                        if: { name: { $exists: true } },
                        then: '$$name',
                        else: ''
                    }
                },
                animated: {
                    $cond: {
                        if: { ext: { $exists: true } },
                        then: '$$animated',
                        else: false
                    }
                },
                // Initializing new fields
                map: newEntries,
                newEntry: '$$map.$$id',
                newName: { $ifNull: ['$$newEntry.name', ''] }
            }
        }
    );
}
