// models/Machine.mjs
import pool from '../db.mjs';

class Machine {
    constructor(serial_number, machine_name, brand, model, machine_id) {
        this.serial_number = serial_number;
        this.machine_name = machine_name;
        this.brand = brand;
        this.model = model;
        this.machine_id = machine_id;
    }

    static async getAll() {
        try {
            const result = await pool.query('SELECT * FROM lending_machines');
            return result.rows.map(machine => new Machine(machine.serial_number, machine.machine_name, machine.brand, machine.model, machine.machine_id));
        } catch (error) {
            console.error('Error fetching machines:', error);
            throw new Error('Database error');
        }
    }

    static async create(serial_number, machine_name, brand, model) {
        try {
            const result = await pool.query(
                'INSERT INTO lending_machines (serial_number, machine_name, brand, model) VALUES ($1, $2, $3, $4) RETURNING *',
                [serial_number, machine_name, brand, model]
            );
            const machine = result.rows[0];
            return new Machine(machine.serial_number, machine.machine_name, machine.brand, machine.model, machine.machine_id);
        } catch (error) {
            console.error('Error creating machine:', error);
            throw new Error('Database error');
        }
    }

    static async delete(id) {
        try {
            const result = await pool.query('DELETE FROM lending_machines WHERE machine_id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return null; // If no machine is deleted, return `null`
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting machine:', error);
            throw new Error('Database error');
        }
    }
}

export default Machine;
