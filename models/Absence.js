const pool = require('../config/db');

class Absence {
  static async findAll() {
    const query = `
      SELECT a.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
      FROM absences a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN students s ON e.student_id = s.id
      JOIN classes c ON e.class_id = c.id
      JOIN years y ON e.year_id = y.id
      ORDER BY a.absence_date DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM absences WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByEnrollment(enrollmentId) {
    const query = `SELECT * FROM absences WHERE enrollment_id = $1 ORDER BY absence_date DESC`;
    const { rows } = await pool.query(query, [enrollmentId]);
    return rows;
  }

  static async create({ enrollment_id, absence_date, is_justified, justification }) {
    const query = `
      INSERT INTO absences (enrollment_id, absence_date, is_justified, justification)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [enrollment_id, absence_date, is_justified || false, justification];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { absence_date, is_justified, justification }) {
    const query = `
      UPDATE absences
      SET absence_date = COALESCE($1, absence_date),
          is_justified = COALESCE($2, is_justified),
          justification = COALESCE($3, justification)
      WHERE id = $4
      RETURNING *
    `;
    const values = [absence_date, is_justified, justification, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM absences WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Absence;