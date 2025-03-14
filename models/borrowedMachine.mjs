// models/BorrowedMachine.mjs
import pool from '../db.mjs';

class BorrowedMachine {
    constructor(borrow_id, machine_id, borrower_name, return_date, comments) {
        this.borrow_id = borrow_id;
        this.machine_id = machine_id;
        this.borrower_name = borrower_name;
        this.return_date = return_date;
        this.comments = comments;
    }

    // Get all borrowed machines
    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM borrowed_machines');
            return result.rows.map(borrowedMachine => 
                new BorrowedMachine(
                    borrowedMachine.borrow_id,
                    borrowedMachine.machine_id,
                    borrowedMachine.borrower_name,
                    borrowedMachine.return_date,
                    borrowedMachine.comments
                )
            );
        } catch (error) {
            console.error('Error fetching borrowed machines:', error);
            throw new Error('Database error');
        }
    }

    // Get borrowed machine by borrow_id
    static async getById(borrow_id) {
        try {
            const result = await pool.query('SELECT * FROM borrowed_machines WHERE borrow_id = $1', [borrow_id]);
            if (result.rows.length === 0) return null;
            const borrowedMachine = result.rows[0];
            return new BorrowedMachine(
                borrowedMachine.borrow_id,
                borrowedMachine.machine_id,
                borrowedMachine.borrower_name,
                borrowedMachine.return_date,
                borrowedMachine.comments
            );
        } catch (error) {
            console.error('Error fetching borrowed machine:', error);
            throw new Error('Database error');
        }
    }

    // Get status of a machine by machine_id
    static async getStatus(machine_id) {
        try {
            const result = await pool.query('SELECT * FROM borrowed_machines WHERE machine_id = $1', [machine_id]);
            if (result.rows.length === 0) return null;
            const borrowedMachine = result.rows[0];
            return new BorrowedMachine(
                borrowedMachine.borrow_id,
                borrowedMachine.machine_id,
                borrowedMachine.borrower_name,
                borrowedMachine.return_date,
                borrowedMachine.comments
            );
        } catch (error) {
            console.error('Error fetching machine status:', error);
            throw new Error('Database error');
        }
    }

    // Create or update borrowed machine status
    static async createOrUpdateStatus(machine_id, borrower_name, return_date, comments) {
        try {
            const existingStatus = await BorrowedMachine.getStatus(machine_id);
            if (existingStatus) {
                const result = await pool.query(
                    'UPDATE borrowed_machines SET borrower_name = $1, return_date = $2, comments = $3 WHERE machine_id = $4 RETURNING *',
                    [borrower_name, return_date, comments, machine_id]
                );
                if (result.rows.length === 0) return null;
                const borrowedMachine = result.rows[0];
                return new BorrowedMachine(
                    borrowedMachine.borrow_id,
                    borrowedMachine.machine_id,
                    borrowedMachine.borrower_name,
                    borrowedMachine.return_date,
                    borrowedMachine.comments
                );
            } else {
                const result = await pool.query(
                    'INSERT INTO borrowed_machines (machine_id, borrower_name, return_date, comments) VALUES ($1, $2, $3, $4) RETURNING *',
                    [machine_id, borrower_name, return_date, comments]
                );
                const borrowedMachine = result.rows[0];
                return new BorrowedMachine(
                    borrowedMachine.borrow_id,
                    borrowedMachine.machine_id,
                    borrowedMachine.borrower_name,
                    borrowedMachine.return_date,
                    borrowedMachine.comments
                );
            }
        } catch (error) {
            console.error('Error updating borrowed machine status:', error);
            throw new Error('Database error');
        }
    }

    // Delete borrowed machine status by borrow_id
    static async deleteStatus(borrow_id) {
        try {
            const result = await pool.query('DELETE FROM borrowed_machines WHERE borrow_id = $1 RETURNING *', [borrow_id]);
            if (result.rows.length === 0) return null;
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting borrowed machine:', error);
            throw new Error('Database error');
        }
    }
}

export default BorrowedMachine;
