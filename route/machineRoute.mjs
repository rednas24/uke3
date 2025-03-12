import express from 'express';
import pool from '../db.mjs';
import HTTP_CODES from '../utils/httpCodes.mjs';

const router = express.Router();

router.get('/machines', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lending_machines');
        res.status(HTTP_CODES.SUCCESS.OK).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Failed to fetch machines', details: err.message });
    }
});

router.post('/machines', async (req, res) => {
    try {
        const { serial_number, machine_name, brand, model } = req.body;

        if (!serial_number || !machine_name || !brand || !model) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(
            'INSERT INTO lending_machines (serial_number, machine_name, brand, model) VALUES ($1, $2, $3, $4) RETURNING *',
            [serial_number, machine_name, brand, model]
        );

        res.status(HTTP_CODES.SUCCESS.CREATED).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Failed to create machine', details: err.message });
    }
});

router.delete('/machines/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure id is a number
        if (isNaN(id)) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid machine ID' });
        }

        const result = await pool.query('DELETE FROM lending_machines WHERE machine_id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Machine not found' });
        }

        res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Machine deleted successfully', deletedMachine: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete machine', details: err.message });
    }
});

export default router;
