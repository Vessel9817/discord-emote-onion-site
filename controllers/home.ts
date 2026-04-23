import { type RequestHandler } from 'express';

export const getHome: RequestHandler = (req, res) => {
    res.render('pages/home/index');
};
