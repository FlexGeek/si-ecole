const pool = require('../config/db');

class StudentCard {
    static async findAll() {
        const query = `
            SELECT sc.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
            FROM student_cards sc
            JOIN enrollments e ON sc.enrollment_id = e.id
            JOIN students s ON e.student_id = s.id
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            ORDER BY sc.generated_at DESC
        `;
        const { rows } = await pool.query(query);
        return rows;
    }

    static async findById(id) {
        const query = `SELECT * FROM student_cards WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async findByEnrollment(enrollmentId) {
        const query = `SELECT * FROM student_cards WHERE enrollment_id = $1 ORDER BY generated_at DESC LIMIT 1`;
        const { rows } = await pool.query(query, [enrollmentId]);
        return rows[0];
    }

    static async create({ enrollment_id, qr_code, pdf_url }) {
        const query = `
            INSERT INTO student_cards (enrollment_id, qr_code, pdf_url)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const values = [enrollment_id, qr_code, pdf_url];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM student_cards WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = StudentCard;