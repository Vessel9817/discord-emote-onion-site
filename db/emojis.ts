import mongoose, { Schema } from 'mongoose';

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

export async function update(partialEmojis: PartialEmoji[]) {
    const ids = partialEmojis.map((p) => p.id);
    const oldEmojis = new Map((await get(ids)).map((e) => [e.id, e]));
    const emojis: Emoji[] = partialEmojis.map((newEmoji) => {
        const oldEmoji = oldEmojis.get(newEmoji.id);
        const newName = newEmoji.name ?? '';

        return {
            id: newEmoji.id,
            name: newName.length > 0 ? newName : (oldEmoji?.name ?? ''),
            animated: oldEmoji?.animated === true || (newEmoji.animated ?? false)
        };
    });
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
