import { RequestHandler } from 'express';
import { http } from '../utils';

/**
 * For security reasons, blocks the TRACE method
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const blockTrace: RequestHandler = (req, res, next) => {
    if (req.method === 'TRACE') {
        res.status(http.codes.METHOD_NOT_ALLOWED).send(http.names[http.codes.METHOD_NOT_ALLOWED]);
    }
    next();
};
