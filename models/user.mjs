// models/User.mjs
import pool from '../db.mjs';

class User {
    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    static async create(username, hashedPassword) {
        try {
            const result = await pool.query(
                'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
                [username, hashedPassword]
            );
            const user = result.rows[0];
            return new User(user.id, user.username, user.password);
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Database error');
        }
    }

    static async findByUsername(username) {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );
            if (result.rows.length === 0) return null;
            const user = result.rows[0];
            return new User(user.id, user.username, user.password);
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error('Database error');
        }
    }
}

export default User;
