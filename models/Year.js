const pool = require('../config/db');

class Year {
    static async findAll() {
        const query = `SELECT * FROM years ORDER BY start_date DESC`;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM years WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async getCurrent() {
        const query = `SELECT * FROM years WHERE is_current = true LIMIT 1`;
        const { rows } = await pool.query(query);
        return rows[0];
    }

    static async create({ label, start_date, end_date, is_current }) {
        if (is_current) {
            await pool.query(`UPDATE years SET is_current = false`);
        }
        const query = `
            INSERT INTO years (label, start_date, end_date, is_current)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [label, start_date, end_date, is_current || false];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { label, start_date, end_date, is_current }) {
        if (is_current) {
            await pool.query(`UPDATE years SET is_current = false`);
        }
        const query = `
            UPDATE years
            SET label = $1, start_date = $2, end_date = $3, is_current = $4
            WHERE id = $5
            RETURNING *
        `;
        const values = [label, start_date, end_date, is_current, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM years WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Year;