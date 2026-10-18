import app from './app';
import { emotes } from './env';
import { connect } from './onion-website/src/express/db/connection';

const port = 3000;

// Starting server
void connect(emotes.uri);

app.listen(port, () => {
    console.log('Server is running!');
});
