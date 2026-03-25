import { ObjectId, WithId } from 'mongodb';
import mongoose, { PipelineStage, Schema } from 'mongoose';

export interface Msg {
    name: string;
    content: string;
}

export interface HydratedMsg extends Msg {
    lastModified: number;
}

export const MsgSchema = new Schema({
    name: String,
    lastModified: Number,
    content: String
});

export const MsgModel = mongoose.model('messages', MsgSchema);

function hydrateMsg(partialMsg: Msg): HydratedMsg {
    const msg: HydratedMsg = {
        // No rest parameter, since partialMsg could be of type WithId<Msg>.
        // Developers can specify WithId<HydratedMsg> instead
        name: partialMsg.name,
        content: partialMsg.content,
        lastModified: Date.now()
    };

    return msg;
}

const MSG_PAGE_SIZE = 10;

export async function idExists(id: ObjectId): Promise<boolean> {
    return (await MsgModel.findById(id)) != null;
}

/**
 * Returns a message batch by page number
 * @param page The 1-indexed page index
 * @returns A message batch, paged by most recent
 */
export async function getMsgs(page: number): Promise<WithId<HydratedMsg>[]> {
    const skip = MSG_PAGE_SIZE * (page - 1);
    const rawPipeline: (PipelineStage | null)[] = [
        { $sort: { lastModified: -1 } },
        // This is O(m+n), where m is the page size and n is the total documents skipped.
        // There is supposedly a better method that achieves O(m)
        skip <= 0 ? null : { $skip: skip },
        { $limit: MSG_PAGE_SIZE }
    ];
    const pipeline = rawPipeline.filter((stage) => stage != null);
    const msgs = (await MsgModel.aggregate(
        pipeline
    ).exec()) as WithId<HydratedMsg>[];

    // Newest messages at bottom
    msgs.reverse();

    return msgs;
}

export async function createMsg(partialMsg: Msg): Promise<void> {
    const msg = hydrateMsg(partialMsg);

    await MsgModel.insertOne(msg);
}

export async function editMsg(newMsg: WithId<Msg>): Promise<void> {
    const newMsgWithoutId: HydratedMsg = hydrateMsg(newMsg);

    await MsgModel.findByIdAndUpdate(newMsg._id, newMsgWithoutId);
}

export async function deleteMsg(id: ObjectId): Promise<void> {
    await MsgModel.findByIdAndDelete(id).exec();
}
