import express from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import log from './modules/log.mjs';
import HTTP_CODES from './utils/httpCodes.mjs';
import routes from './route/routes.mjs';
import gameRoutes from './route/gameTreeRoutes.mjs';
import { gameCollection } from './gameTree/gameCollection.mjs';
import 'dotenv/config';

const FileStoreInstance = FileStore(session);
const server = express();
const port = process.env.PORT || 8000;

server.set('port', port);
server.use(log());
server.use(express.static('public'));
server.use(express.json());

server.use(session({
    store: new FileStoreInstance({ path: './sessions', retries: 1 }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Add static categories for testing will be removed when conneting too database
gameCollection.addCategory('Card Games');
gameCollection.addCategory('Puzzle Games');
gameCollection.addCategory('Action Games');

gameCollection.addGameToCategory('Card Games', { name: 'Poker', description: 'A classic card game', difficulty: 'Medium' });
gameCollection.addGameToCategory('Puzzle Games', { name: 'Sudoku', description: 'A number placement game', difficulty: 'Hard' });
gameCollection.addGameToCategory('Action Games', { name: 'Pac-Man', description: 'Eat pellets while avoiding ghosts', difficulty: 'Easy' });

server.use('/', routes);
server.use('/games', gameRoutes);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
