import mongoose, { Schema } from 'mongoose';
import assert from 'node:assert';

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

export const EmojiModel = mongoose.model('emojis', EmojiSchema);

export async function get(ids: string[]) {
    if (ids.length < 1) {
        return [];
    }

    return await EmojiModel.find({ id: { $in: ids } });
}

/**
 * Sets the default values of an emoji
 */
export function setDefault(emoji: PartialEmoji): Emoji {
    return {
        id: emoji.id,
        name: emoji?.name ?? '',
        animated: emoji?.animated ?? false
    };
}

/**
 * Creates a new sticker, prioritizing certain given properties
 */
export function merge(
    emoji1: PartialEmoji | null | undefined,
    emoji2: PartialEmoji
): Emoji {
    const newEmoji = setDefault(emoji2);

    if (emoji1 == null) {
        return newEmoji;
    }

    assert.strictEqual(emoji1.id, emoji2.id,
            "Can't merge stickers: IDs don't match");

    const oldEmoji = setDefault(emoji1);

    return {
        id: oldEmoji.id,
        name: newEmoji.name.length > 0
            ? newEmoji.name
            : oldEmoji.name,
        animated: oldEmoji.animated || newEmoji.animated
    };

}

export async function update(partialEmojis: PartialEmoji[]) {
    const ids = partialEmojis.map((p) => p.id);
    const oldEmojis = new Map<string, Emoji>(
        (await get(ids)).map((e) => [e.id, e as Emoji])
    );
    const emojis: Emoji[] = partialEmojis.map((newEmoji) =>
        merge(oldEmojis.get(newEmoji.id), newEmoji)
    );
    const writes: Parameters<typeof EmojiModel.bulkWrite>[0] = [];

    for (const emoji of emojis) {
        writes.push({
            updateOne: {
                filter: { id: emoji.id },
                update: emoji,
                upsert: true
            }
        });
    }
    
    return await EmojiModel.bulkWrite(writes);
}
