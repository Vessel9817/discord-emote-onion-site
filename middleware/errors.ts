import { ErrorRequestHandler, RequestHandler } from 'express';
import { http } from '../utils';

/**
 * Displays an internal error page
 * @param err The error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    // Logging stack trace internally, NOT handing over to client.
    // More advanced error handling could be used
    // (e.g, for nested validation errors)
    let newErr: unknown = err;

    if (typeof newErr === 'object' && newErr != null) {
        if ('msg' in newErr) {
            // Likely a validation error
            newErr = newErr.msg;
        }
        else if (newErr instanceof Error) {
            newErr = newErr.message;
        }
    }
    else if (typeof newErr === 'string') {
        newErr = newErr.trim();
    }

    if (newErr == null) {
        next();
        return;
    }

    console.error('Handled uncaught error:', newErr);

    // Giving limited error information to the client
    // res.statusMessage can be undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    res.statusMessage ??= http.names[res.statusCode];

    if (res.statusCode < 400 || res.statusCode >= 600) {
        res.statusCode = http.codes.INTERNAL_SERVER_ERROR;
        res.statusMessage = http.names[http.codes.INTERNAL_SERVER_ERROR];
    }

    const args = {
        code: res.statusCode, // Default: 404
        name: res.statusMessage
    };

    res.render('pages/home/error', args);
};

/**
 * Throws a 404 Not Found error
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const errorPage: RequestHandler = (req, res, next) => {
    res.status(http.codes.NOT_FOUND);
    res.statusMessage = http.names[http.codes.NOT_FOUND];

    next(`Path not found: ${req.url}`);
};
