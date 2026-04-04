const pool = require('../config/db');

class AdminContract {
  static async findAll() {
    const query = `
      SELECT ac.*, u.nom_complet, u.email, u.role, y.label as year_label
      FROM admin_contracts ac
      JOIN users u ON ac.user_id = u.id
      JOIN years y ON ac.year_id = y.id
      ORDER BY y.start_date DESC, u.nom_complet
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM admin_contracts WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ user_id, year_id, base_salary, contract_type }) {
    const query = `
      INSERT INTO admin_contracts (user_id, year_id, base_salary, contract_type)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, year_id) DO UPDATE SET
        base_salary = EXCLUDED.base_salary,
        contract_type = EXCLUDED.contract_type
      RETURNING *
    `;
    const values = [user_id, year_id, base_salary, contract_type];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async update(id, { base_salary, contract_type }) {
    const query = `
      UPDATE admin_contracts
      SET base_salary = COALESCE($1, base_salary),
          contract_type = COALESCE($2, contract_type)
      WHERE id = $3
      RETURNING *
    `;
    const values = [base_salary, contract_type, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM admin_contracts WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = AdminContract;