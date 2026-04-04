const pool = require('../config/db');

class AdminStaff {
  static async findAll() {
    const query = `
      SELECT asf.*, u.email, u.role
      FROM admin_staff asf
      JOIN users u ON asf.user_id = u.id
      ORDER BY asf.last_name, asf.first_name
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
  const query = `
    SELECT asf.*, u.email, u.role
    FROM admin_staff asf
    JOIN users u ON asf.user_id = u.id
    WHERE asf.id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

  static async findByUserId(userId) {
    const query = `SELECT * FROM admin_staff WHERE user_id = $1`;
    const { rows } = await pool.query(query, [userId]);
    return rows[0];
  }

  static async create({ user_id, first_name, last_name, birth_date, phone, address, hire_date, status }) {
    const query = `
      INSERT INTO admin_staff (user_id, first_name, last_name, birth_date, phone, address, hire_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [user_id, first_name, last_name, birth_date, phone, address, hire_date, status || 'actif'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { first_name, last_name, birth_date, phone, address, hire_date, status }) {
    const query = `
      UPDATE admin_staff
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          birth_date = COALESCE($3, birth_date),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          hire_date = COALESCE($6, hire_date),
          status = COALESCE($7, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const values = [first_name, last_name, birth_date, phone, address, hire_date, status, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM admin_staff WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = AdminStaff;