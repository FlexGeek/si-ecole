const pool = require('../config/db');

class SalaryComponent {
  static async findAll() {
    const query = `SELECT * FROM salary_components ORDER BY type, name`;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM salary_components WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ name, type, is_percentage, value }) {
    const query = `
      INSERT INTO salary_components (name, type, is_percentage, value)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [name, type, is_percentage, value];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { name, type, is_percentage, value }) {
    const query = `
      UPDATE salary_components
      SET name = COALESCE($1, name),
          type = COALESCE($2, type),
          is_percentage = COALESCE($3, is_percentage),
          value = COALESCE($4, value)
      WHERE id = $5
      RETURNING *
    `;
    const values = [name, type, is_percentage, value, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM salary_components WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = SalaryComponent;