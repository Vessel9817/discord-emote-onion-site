import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { emotes } from './env';
import { blockTrace } from './middleware';
import { APP_ROUTER, NOT_FOUND_ROUTER } from './routes';

const APP = express();
const PORT = 3000;

APP.set('view engine', 'ejs');

// Setting global app middleware
APP.use(blockTrace); // Blocks TRACE requests
APP.use(cors()); // Sets CORS policy
APP.use(express.json()); // Parse Content-Type: json
APP.use(express.urlencoded({ extended: false })); // Encodes special characters in URLs
APP.use('/', APP_ROUTER); // Serves app
APP.use('/', NOT_FOUND_ROUTER); // Catches errors

// Starting server
void (async () => {
    try {
        await mongoose.connect(emotes.uri);
    }
    catch (err) {
        console.error('Failed to connect to database:', err);
    }

    APP.listen(PORT, () => {
        console.log('Server is running!');
    });
})();
