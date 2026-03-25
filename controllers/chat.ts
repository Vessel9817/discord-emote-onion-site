import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ObjectId, WithId } from 'mongodb';
import { MsgBoard } from '../db';
import { http } from '../utils';

export const getChat: RequestHandler = async (req, res) => {
    const params = req.query as { page?: string };
    const rawPage = Number(params.page);
    const page = Number.isFinite(rawPage) ? Math.min(1, rawPage) : 1;
    const msgs = await MsgBoard.getMsgs(page);
    const formattedMsgs = msgs.map((e) => ({
        id: e._id,
        name: e.name,
        content: e.content,
        lastModified: new Date(e.lastModified).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'long',
            timeZone: 'UTC'
        })
    }));
    const args = {
        msgs: formattedMsgs,
        page: page
    };

    res.render('pages/chat', args);
};

export const sendMsg: RequestHandler = async (req, res, next) => {
    // Placeholder error page
    if (!validationResult(req).isEmpty()) {
        res.statusCode = http.codes.BAD_REQUEST;
        next(validationResult(req).array()[0]);
        return;
    }

    const params = req.body as {
        name: string;
        content: string;
    };
    const msg: MsgBoard.Msg = {
        name: params.name,
        content: params.content
    };

    await MsgBoard.createMsg(msg);

    res.redirect('/chat');
};

export const editMsg: RequestHandler = async (req, res, next) => {
    // Placeholder error page
    if (!validationResult(req).isEmpty()) {
        res.statusCode = http.codes.BAD_REQUEST;
        next(validationResult(req).array()[0]);
        return;
    }

    const params = req.body as {
        name: string;
        content: string;
        id: string;
    };
    const newMsg: WithId<MsgBoard.Msg> = {
        _id: new ObjectId(params.id),
        name: params.name,
        content: params.content
    };

    await MsgBoard.editMsg(newMsg);

    res.redirect('/chat');
};

export const deleteMsg: RequestHandler = async (req, res, next) => {
    // Placeholder error page
    if (!validationResult(req).isEmpty()) {
        res.statusCode = http.codes.BAD_REQUEST;
        next(validationResult(req).array()[0]);
        return;
    }

    const params = req.body as { id: string };
    const id = new ObjectId(params.id);

    await MsgBoard.deleteMsg(id);

    res.redirect('/chat');
};
