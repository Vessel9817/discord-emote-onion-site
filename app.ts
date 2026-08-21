import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { domain, emotes } from './env';
import { csp } from './middleware';
import { appRouter, notFoundRouter } from './routes/index';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Removing fingerprintable headers
app.disable('x-powered-by');

// Setting global app middleware
app.use(cors({ origin: domain })); // Sets CORS policy
app.use(express.json()); // Parse Content-Type: json
app.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
app.use(csp); // Restricts application permissions
app.use('/', appRouter); // Serves app
app.use('/', notFoundRouter); // Catches errors

// Starting server
try {
    await mongoose.connect(emotes.uri);
}
catch (err) {
    console.error('Failed to connect to database:', err);
}

app.listen(port, () => {
    console.log('Server is running!');
});
