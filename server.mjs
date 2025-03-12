import express from 'express';
import session from 'express-session';
import FileStore from 'session-file-store';
import log from './modules/log.mjs';
import machinesRouter from './route/machineRoute.mjs';
import HTTP_CODES from './utils/httpCodes.mjs';
import pool from './db.mjs'; // Import the pool correctly
import 'dotenv/config';
import path from 'path'; // Ensure path module is imported
import { fileURLToPath } from 'url';

const FileStoreInstance = FileStore(session);
const server = express();
const port = process.env.PORT || 8000;

server.set('port', port);
server.use(log());
server.use(express.static('public'));
server.use(express.json());

// Session middleware setup
server.use(session({
    store: new FileStoreInstance({ path: './sessions', retries: 1 }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Corrected handling of __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Print __dirname to debug
console.log('__dirname:', __dirname);

server.get('/home', (req, res) => {
    // Use path.join to construct the correct path
    let indexPath = path.join(__dirname, 'public', 'index.html');

    console.log('Resolved absolute path:', indexPath); // Debugging output

    // Normalize the path to remove redundant slashes or drive letters
    indexPath = path.normalize(indexPath);

    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

// API routes
server.use('/api', machinesRouter);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
