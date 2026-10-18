import app from './app';
import { connect } from './db/connection';
import { emotes } from './env';

const port = 3000;

// Starting server
void connect(emotes.uri);

app.listen(port, () => {
    console.log('Server is running!');
});
