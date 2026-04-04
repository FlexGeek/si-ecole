const pool = require('../config/db');

class PayrollPeriod {
  static async findAll() {
    const query = `
      SELECT pp.*, y.label as year_label
      FROM payroll_periods pp
      JOIN years y ON pp.year_id = y.id
      ORDER BY y.start_date, pp.month
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM payroll_periods WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async create({ year_id, month, start_date, end_date, status }) {
    const query = `
      INSERT INTO payroll_periods (year_id, month, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (year_id, month) DO NOTHING
      RETURNING *
    `;
    const values = [year_id, month, start_date, end_date, status || 'ouvert'];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async generateForYear(yearId) {
    const year = await pool.query(`SELECT start_date, end_date FROM years WHERE id = $1`, [yearId]);
    if (!year.rows[0]) throw new Error('Année non trouvée');
    const start = new Date(year.rows[0].start_date);
    const end = new Date(year.rows[0].end_date);
    const periods = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      const month = current.getMonth() + 1;
      const periodStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const existing = await pool.query(`SELECT id FROM payroll_periods WHERE year_id = $1 AND month = $2`, [yearId, month]);
      if (existing.rows.length === 0) {
        const newPeriod = await this.create({ year_id: yearId, month, start_date: periodStart, end_date: periodEnd });
        periods.push(newPeriod);
      } else {
        periods.push(existing.rows[0]);
      }
      current.setMonth(current.getMonth() + 1);
    }
    return periods;
  }

  static async update(id, { status }) {
    const query = `
      UPDATE payroll_periods
      SET status = COALESCE($1, status)
      WHERE id = $2
      RETURNING *
    `;
    const values = [status, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM payroll_periods WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = PayrollPeriod;