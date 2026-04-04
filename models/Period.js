const pool = require('../config/db');

class Period {
    static async findAll() {
        const query = `
            SELECT p.*, y.label as year_label
            FROM periods p
            JOIN years y ON p.year_id = y.id
            ORDER BY y.start_date, p.start_date
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `
            SELECT p.*, y.label as year_label
            FROM periods p
            JOIN years y ON p.year_id = y.id
            WHERE p.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async findByYear(yearId) {
        const query = `SELECT * FROM periods WHERE year_id = $1 ORDER BY start_date`;
        const { rows } = await pool.query(query, [yearId]);
        return rows;
    }

    static async create({ year_id, name, start_date, end_date }) {
        const query = `
            INSERT INTO periods (year_id, name, start_date, end_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [year_id, name, start_date, end_date];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { name, start_date, end_date }) {
        const query = `
            UPDATE periods
            SET name = COALESCE($1, name),
                start_date = COALESCE($2, start_date),
                end_date = COALESCE($3, end_date)
            WHERE id = $4
            RETURNING *
        `;
        const values = [name, start_date, end_date, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM periods WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Period;