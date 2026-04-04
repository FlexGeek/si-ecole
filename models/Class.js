const pool = require('../config/db');

class Class {
    static async findAll() {
        const query = `SELECT * FROM classes ORDER BY level_order ASC`;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM classes WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async create({ name, level_order, fees }) {
        const query = `
            INSERT INTO classes (name, level_order, fees)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, level_order, fees || 0];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { name, level_order, fees }) {
        const query = `
            UPDATE classes
            SET name = COALESCE($1, name),
                level_order = COALESCE($2, level_order),
                fees = COALESCE($3, fees)
            WHERE id = $4
            RETURNING *
        `;
        const values = [name, level_order, fees, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM classes WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Class;