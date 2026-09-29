import app from './app';
import { connect, reconnectOnDisconnect } from './db/connection';
import { emotes } from './env';

const port = 3000;

// Starting server
reconnectOnDisconnect(emotes.uri);
void connect(emotes.uri);

app.listen(port, () => {
    console.log('Server is running!');
});
