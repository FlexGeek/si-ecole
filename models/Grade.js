const pool = require('../config/db');

class Grade {
    static async findAll() {
        const query = `SELECT * FROM grades ORDER BY id DESC`;
        const { rows } = await pool.query(query);
        return rows;
    }
    static async findById(id) {
        const query = `SELECT * FROM grades WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
    static async findByStudent(studentId) {
        const query = `SELECT * FROM grades WHERE student_id = $1 ORDER BY period_id, subject_id`;
        const { rows } = await pool.query(query, [studentId]);
        return rows;
    }
    static async findByClassAndPeriod(classId, periodId) {
        const query = `
            SELECT g.*, s.first_name, s.last_name, sub.name as subject_name
            FROM grades g
            JOIN students s ON g.student_id = s.id
            JOIN subjects sub ON g.subject_id = sub.id
            JOIN enrollments e ON e.student_id = s.id
            WHERE e.class_id = $1 AND g.period_id = $2
        `;
        const { rows } = await pool.query(query, [classId, periodId]);
        return rows;
    }
    static async create({ student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient }) {
        const query = `
            INSERT INTO grades (student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [student_id, subject_id, period_id, evaluation_name, evaluation_date, value, evaluation_coefficient || 1];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
    static async update(id, { evaluation_name, evaluation_date, value, evaluation_coefficient }) {
        const query = `
            UPDATE grades
            SET evaluation_name = COALESCE($1, evaluation_name),
                evaluation_date = COALESCE($2, evaluation_date),
                value = COALESCE($3, value),
                evaluation_coefficient = COALESCE($4, evaluation_coefficient)
            WHERE id = $5
            RETURNING *
        `;
        const values = [evaluation_name, evaluation_date, value, evaluation_coefficient, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }
    static async delete(id) {
        const query = `DELETE FROM grades WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
    // models/Grade.js
static async findByClassAndPeriod(classId, periodId) {
  const query = `
    SELECT g.*, s.first_name, s.last_name, sub.name as subject_name
    FROM grades g
    JOIN students s ON g.student_id = s.id
    JOIN subjects sub ON g.subject_id = sub.id
    JOIN enrollments e ON e.student_id = s.id
    WHERE e.class_id = $1 AND g.period_id = $2
  `;
  const { rows } = await pool.query(query, [classId, periodId]);
  return rows;
}
}
module.exports = Grade;



// curl -X POST http://localhost:5001/api/periods \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBlY29sZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzUzMjkyMjksImV4cCI6MTc3NTkzNDAyOX0.NcQ5U8RTqsa_RohcqTWQo_m31pK7jhyCZt3fO63HBcI" \
//   -d '{"year_id":1,"name":"Trimestre 1","start_date":"2024-09-01","end_date":"2024-12-20"}'

//   curl -X POST http://localhost:5001/api/grades \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBlY29sZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzUzMjkyMjksImV4cCI6MTc3NTkzNDAyOX0.NcQ5U8RTqsa_RohcqTWQo_m31pK7jhyCZt3fO63HBcI" \
//   -d '{"student_id":1,"subject_id":1,"period_id":1,"evaluation_name":"Devoir 1","value":15.5,"evaluation_coefficient":1}'