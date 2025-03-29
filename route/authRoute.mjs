// routes/authRoutes.mjs
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.mjs';
import HTTP_CODES from '../utils/httpCodes.mjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
}

// User registation

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Username and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create(username, hashedPassword);
        res.status(HTTP_CODES.SUCCESS.CREATED).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to register user', details: err.message });
    }
});


//User Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Username and password are required' });
        }

        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(HTTP_CODES.CLIENT_ERROR.UNAUTHORIZED).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        // Store the token in the session
        req.session.token = token;

        res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Login successful', token });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to login', details: err.message });
    }
});

router.post('/logout', (req, res) => {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                return res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to log out' });
            }
            res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Logout successful' });
        });
    } catch (err) {
        console.error('Error logging out:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to log out', details: err.message });
    }
});

export default router;
