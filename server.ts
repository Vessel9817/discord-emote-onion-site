/**
 * Matches `onion-website/src/express/server.ts`
 */

import app from './app';
import { emotes } from './env';
import { connect, createShutdownHandler } from './onion-website/src/express/db/connection';

// Starting server
const port = 3000;

void connect(emotes.uri);

const server = app.listen(port, () => {
    console.log('Server is running!');
});

createShutdownHandler(server);
