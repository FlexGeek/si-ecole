const pool = require('../config/db');

class Timetable {
  static async findAll() {
    const query = `
      SELECT t.*, c.name as class_name, sub.name as subject_name, tc.first_name, tc.last_name
      FROM timetables t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN teachers tc ON t.teacher_id = tc.id
      ORDER BY t.class_id, t.day_of_week, t.start_time
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM timetables WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByClass(classId) {
    const query = `
      SELECT t.*, sub.name as subject_name, tc.first_name, tc.last_name
      FROM timetables t
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN teachers tc ON t.teacher_id = tc.id
      WHERE t.class_id = $1
      ORDER BY t.day_of_week, t.start_time
    `;
    const { rows } = await pool.query(query, [classId]);
    return rows;
  }

  static async create({ class_id, subject_id, teacher_id, day_of_week, start_time, end_time }) {
    const query = `
      INSERT INTO timetables (class_id, subject_id, teacher_id, day_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [class_id, subject_id, teacher_id, day_of_week, start_time, end_time];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { class_id, subject_id, teacher_id, day_of_week, start_time, end_time }) {
    const query = `
      UPDATE timetables
      SET class_id = COALESCE($1, class_id),
          subject_id = COALESCE($2, subject_id),
          teacher_id = COALESCE($3, teacher_id),
          day_of_week = COALESCE($4, day_of_week),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time)
      WHERE id = $7
      RETURNING *
    `;
    const values = [class_id, subject_id, teacher_id, day_of_week, start_time, end_time, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM timetables WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Timetable;