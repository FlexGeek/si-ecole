const pool = require('../config/db');

class Payment {
    static async findAll() {
        const query = `
            SELECT p.*, s.first_name, s.last_name, ps.description as schedule_description
            FROM payments p
            JOIN enrollments e ON p.enrollment_id = e.id
            JOIN students s ON e.student_id = s.id
            LEFT JOIN payment_schedules ps ON p.schedule_id = ps.id
            ORDER BY p.payment_date DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM payments WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async findByEnrollment(enrollmentId) {
        const query = `SELECT * FROM payments WHERE enrollment_id = $1 ORDER BY payment_date DESC`;
        const { rows } = await pool.query(query, [enrollmentId]);
        return rows;
    }

    static async create({ enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes }) {
        const query = `
            INSERT INTO payments (enrollment_id, schedule_id, amount, payment_date, payment_method, receipt_number, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [enrollment_id, schedule_id || null, amount, payment_date, payment_method, receipt_number, notes];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { amount, payment_date, payment_method, receipt_number, notes }) {
        const query = `
            UPDATE payments
            SET amount = COALESCE($1, amount),
                payment_date = COALESCE($2, payment_date),
                payment_method = COALESCE($3, payment_method),
                receipt_number = COALESCE($4, receipt_number),
                notes = COALESCE($5, notes)
            WHERE id = $6
            RETURNING *
        `;
        const values = [amount, payment_date, payment_method, receipt_number, notes, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM payments WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = Payment;