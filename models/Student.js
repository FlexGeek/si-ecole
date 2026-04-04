const pool = require('../config/db');

class Student {
    static async findAll() {
        const query = `SELECT * FROM students ORDER BY last_name, first_name`;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM students WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async create({ first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address }) {
        const query = `
            INSERT INTO students (first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address }) {
        const query = `
            UPDATE students
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                birth_date = COALESCE($3, birth_date),
                photo_url = COALESCE($4, photo_url),
                parent_phone = COALESCE($5, parent_phone),
                parent_email = COALESCE($6, parent_email),
                address = COALESCE($7, address),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `;
        const values = [first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM students WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Student;