const pool = require('../config/db');

class Subject {
    static async findAll() {
        const query = `
            SELECT s.*, c.name as class_name
            FROM subjects s
            JOIN classes c ON s.class_id = c.id
            ORDER BY c.level_order, s.name
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT s.*, c.name as class_name
            FROM subjects s
            JOIN classes c ON s.class_id = c.id
            WHERE s.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async findByClass(classId) {
        const query = `SELECT * FROM subjects WHERE class_id = $1 ORDER BY name`;
        const { rows } = await pool.query(query, [classId]);
        return rows;
    }

    static async create({ name, coefficient, class_id }) {
        const query = `
            INSERT INTO subjects (name, coefficient, class_id)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [name, coefficient, class_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { name, coefficient, class_id }) {
        const query = `
            UPDATE subjects
            SET name = COALESCE($1, name),
                coefficient = COALESCE($2, coefficient),
                class_id = COALESCE($3, class_id)
            WHERE id = $4
            RETURNING *
        `;
        const values = [name, coefficient, class_id, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM subjects WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Subject;