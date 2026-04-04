const pool = require('../config/db');

class TeacherContract {
  static async findAll() {
    const query = `
      SELECT tc.*, t.first_name, t.last_name, y.label as year_label
      FROM teacher_contracts tc
      JOIN teachers t ON tc.teacher_id = t.id
      JOIN years y ON tc.year_id = y.id
      ORDER BY y.start_date DESC, t.last_name
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM teacher_contracts WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ teacher_id, year_id, base_salary, contract_type, hours_per_month }) {
    const query = `
      INSERT INTO teacher_contracts (teacher_id, year_id, base_salary, contract_type, hours_per_month)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (teacher_id, year_id) DO UPDATE SET
        base_salary = EXCLUDED.base_salary,
        contract_type = EXCLUDED.contract_type,
        hours_per_month = EXCLUDED.hours_per_month
      RETURNING *
    `;
    const values = [teacher_id, year_id, base_salary, contract_type, hours_per_month];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { base_salary, contract_type, hours_per_month }) {
    const query = `
      UPDATE teacher_contracts
      SET base_salary = COALESCE($1, base_salary),
          contract_type = COALESCE($2, contract_type),
          hours_per_month = COALESCE($3, hours_per_month)
      WHERE id = $4
      RETURNING *
    `;
    const values = [base_salary, contract_type, hours_per_month, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM teacher_contracts WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = TeacherContract;