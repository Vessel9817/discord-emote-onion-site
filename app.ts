import express from 'express';
import { csp, errorHandler } from './middleware';
import { appRouter, notFoundRouter } from './routes/index';

const app = express();

app.set('view engine', 'ejs');

// Removing fingerprintable headers
app.disable('x-powered-by');

// Setting global app middleware
app.use(express.json()); // Parse Content-Type: json
app.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
app.use(csp); // Restricts application permissions
app.use('/', appRouter); // Serves app
app.use('/', notFoundRouter); // Catches 404 errors
app.use('/', errorHandler); // Catches errors, preventing stack trace leaks

export default app;
