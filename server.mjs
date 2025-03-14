import express from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import log from './modules/log.mjs';
import machinesRouter from './route/machineRoute.mjs';
import authRouter from './route/authRoute.mjs';
import HTTP_CODES from './utils/httpCodes.mjs';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const FileStoreInstance = FileStore(session);
const server = express();
const port = process.env.PORT || 8000;

server.set('port', port);
server.use(log());
server.use(express.static('public', { index: false }));
server.use(express.json());

// Session middleware setup
server.use(session({
    store: new FileStoreInstance({ path: './sessions', retries: 1 }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Helper function to check if the user is authenticated
function isAuthenticated(req, res, next) {
    // Check if there's a valid session token
    if (!req.session.token) {
        return res.redirect('/'); // Redirect to login page if no token found
    }
    next();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


server.get('/', (req, res) => {
    let indexPath = path.join(__dirname, 'public', '/html/login.html');

    indexPath = path.normalize(indexPath);

    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// Protect the /home must check for token first
server.get('/home', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

server.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/html/register.html');
});

// API routes
server.use('/api/machines', machinesRouter);
server.use('/api/auth', authRouter);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
