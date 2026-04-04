const pool = require('../config/db');

class Teacher {
  static async findAll() {
    const query = `SELECT * FROM teachers ORDER BY last_name, first_name`;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM teachers WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category }) {
    const query = `
      INSERT INTO teachers (first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [first_name, last_name, birth_date, phone, email, address, hire_date, status || 'actif', photo_url, category || 'teacher'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category }) {
    const query = `
      UPDATE teachers
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          birth_date = COALESCE($3, birth_date),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          address = COALESCE($6, address),
          hire_date = COALESCE($7, hire_date),
          status = COALESCE($8, status),
          photo_url = COALESCE($9, photo_url),
          category = COALESCE($10, category),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;
    const values = [first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM teachers WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = Teacher;