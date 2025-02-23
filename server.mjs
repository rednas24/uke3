import express from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import log from './modules/log.mjs';
import HTTP_CODES from './utils/httpCodes.mjs';
import routes from './route/routes.mjs';
import gameRoutes from './route/gameTreeRoutes.mjs';
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

server.use('/', routes);
server.use('/games', gameRoutes);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
