const pool = require('../config/db');

class PaymentSchedule {
    static async findAll() {
        const query = `
            SELECT ps.*, c.name as class_name, y.label as year_label
            FROM payment_schedules ps
            LEFT JOIN classes c ON ps.class_id = c.id
            LEFT JOIN years y ON ps.year_id = y.id
            ORDER BY ps.due_date
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM payment_schedules WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async create({ class_id, year_id, description, amount, due_date }) {
        const query = `
            INSERT INTO payment_schedules (class_id, year_id, description, amount, due_date)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [class_id || null, year_id || null, description, amount, due_date];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { class_id, year_id, description, amount, due_date }) {
        const query = `
            UPDATE payment_schedules
            SET class_id = COALESCE($1, class_id),
                year_id = COALESCE($2, year_id),
                description = COALESCE($3, description),
                amount = COALESCE($4, amount),
                due_date = COALESCE($5, due_date)
            WHERE id = $6
            RETURNING *
        `;
        const values = [class_id, year_id, description, amount, due_date, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM payment_schedules WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // Récupérer les échéances impayées pour les relances
    static async getOverduePayments() {
        const query = `
            SELECT ps.*, s.first_name, s.last_name, e.id as enrollment_id
            FROM payment_schedules ps
            JOIN enrollments e ON (ps.class_id IS NULL OR e.class_id = ps.class_id) AND (ps.year_id IS NULL OR e.year_id = ps.year_id)
            JOIN students s ON e.student_id = s.id
            WHERE ps.due_date < CURRENT_DATE
              AND NOT EXISTS (
                  SELECT 1 FROM payments p WHERE p.schedule_id = ps.id AND p.enrollment_id = e.id
              )
              AND e.status = 'actif'
            ORDER BY ps.due_date
        `;
        const { rows } = await pool.query(query);
        return rows;
    }
}

module.exports = PaymentSchedule;