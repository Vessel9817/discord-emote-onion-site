import { type RequestHandler } from 'express';

// Prevents clickjacking
const CSP_HEADERS: Readonly<Map<string, number | string | readonly string[]>> = new Map([
    ['X-Frame-Options', 'DENY'],
    ['Content-Security-Policy', "frame-ancestors 'none'"]
]);

/**
 * Defines a general-purpose content security policy
 * @param req The request
 * @param res The response
 * @param next The callback function for the next middleware
 */
export const csp: RequestHandler = (req, res, next) => {
    res.setHeaders(CSP_HEADERS);
    next();
};
