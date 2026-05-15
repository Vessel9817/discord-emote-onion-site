import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { emotes } from './env.ts';
import { APP_ROUTER, NOT_FOUND_ROUTER } from './routes/index.ts';

const APP = express();
const PORT = 3000;

APP.set('view engine', 'ejs');

// Removing fingerprintable headers
APP.disable('x-powered-by');

// Setting global app middleware
APP.use(cors()); // Sets CORS policy
APP.use(express.json()); // Parse Content-Type: json
APP.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
APP.use('/', APP_ROUTER); // Serves app
APP.use('/', NOT_FOUND_ROUTER); // Catches errors

// Starting server
try {
    await mongoose.connect(emotes.uri);
}
catch (err) {
    console.error('Failed to connect to database:', err);
}

APP.listen(PORT, () => {
    console.log('Server is running!');
});
