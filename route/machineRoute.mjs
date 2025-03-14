// routes/machineRoutes.mjs
import express from 'express';
import Machine from '../models/machine.mjs';
import BorrowedMachine from '../models/borrowedMachine.mjs';
import HTTP_CODES from '../utils/httpCodes.mjs';

const router = express.Router();

// Get all machines
router.get('/', async (req, res) => {
    try {
        const machines = await Machine.getAll();
        res.status(HTTP_CODES.SUCCESS.OK).json(machines);
    } catch (err) {
        console.error('Error fetching machines:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch machines', details: err.message });
    }
});

// Create a new machine
router.post('/', async (req, res) => {
    try {
        const { serial_number, machine_name, brand, model } = req.body;

        if (!serial_number || !machine_name || !brand || !model) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Missing required fields' });
        }

        const newMachine = await Machine.create(serial_number, machine_name, brand, model);
        res.status(HTTP_CODES.SUCCESS.CREATED).json(newMachine);
    } catch (err) {
        console.error('Error creating machine:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create machine', details: err.message });
    }
});

// Delete a machine
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid machine ID' });
        }

        const deletedMachine = await Machine.delete(id);
        if (!deletedMachine) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Machine not found' });
        }

        res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Machine deleted successfully', deletedMachine });
    } catch (err) {
        console.error('Error deleting machine:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete machine', details: err.message });
    }
});

// Get machine status (if it's borrowed)
router.get('/:machineId/status', async (req, res) => {
    try {
        const machineId = parseInt(req.params.machineId);
        if (isNaN(machineId)) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid machine ID' });
        }

        const status = await BorrowedMachine.getStatus(machineId);
        res.status(HTTP_CODES.SUCCESS.OK).json(status ? { borrowed: true, details: status } : { borrowed: false });
    } catch (error) {
        console.error('Error checking machine status:', error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
});

// Update or create machine status
router.put('/:machineId/status', async (req, res) => {
    try {
        const machineId = parseInt(req.params.machineId);
        const { borrower_name, return_date, comments } = req.body;

        if (isNaN(machineId) || !borrower_name || !return_date) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid data or missing fields' });
        }

        const updatedStatus = await BorrowedMachine.createOrUpdateStatus(machineId, borrower_name, return_date, comments);
        res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Machine status updated successfully', details: updatedStatus });
    } catch (error) {
        console.error('Error updating machine status:', error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
});

// Delete borrowed machine status
router.delete('/status/:borrowId', async (req, res) => {
    try {
        const borrowId = parseInt(req.params.borrowId);
        if (isNaN(borrowId)) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid borrow ID' });
        }

        const deletedRecord = await BorrowedMachine.deleteStatus(borrowId);
        if (!deletedRecord) {
            return res.status(HTTP_CODES.CLIENT_ERROR.NOT_FOUND).json({ error: 'Borrowed machine record not found' });
        }

        res.status(HTTP_CODES.SUCCESS.OK).json({ message: 'Borrowed machine record deleted successfully', deletedRecord });
    } catch (err) {
        console.error('Error deleting borrowed machine record:', err);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete borrowed machine record', details: err.message });
    }
});

// Add a new borrowed machine status (POST)
router.post('/:machineId/status', async (req, res) => {
    try {
        const machineId = parseInt(req.params.machineId);
        const { borrower_name, return_date, comments } = req.body;

        if (isNaN(machineId) || !borrower_name || !return_date) {
            return res.status(HTTP_CODES.CLIENT_ERROR.BAD_REQUEST).json({ error: 'Invalid data or missing fields' });
        }

        const newStatus = await BorrowedMachine.createOrUpdateStatus(machineId, borrower_name, return_date, comments);
        res.status(HTTP_CODES.SUCCESS.CREATED).json({ message: 'Machine status created successfully', details: newStatus });
    } catch (error) {
        console.error('Error creating machine status:', error);
        res.status(HTTP_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
});

export default router;
