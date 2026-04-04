const pool = require('../config/db');

class TeacherPayroll {
  static async findAll() {
    const query = `
      SELECT tp.*, t.first_name, t.last_name, pp.month, y.label as year_label
      FROM teacher_payroll tp
      JOIN teachers t ON tp.teacher_id = t.id
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      ORDER BY y.start_date DESC, pp.month, t.last_name
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `SELECT * FROM teacher_payroll WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByPeriod(periodId) {
    const query = `
      SELECT tp.*, t.first_name, t.last_name
      FROM teacher_payroll tp
      JOIN teachers t ON tp.teacher_id = t.id
      WHERE tp.payroll_period_id = $1
      ORDER BY t.last_name
    `;
    const { rows } = await pool.query(query, [periodId]);
    return rows;
  }

  static async generateForPeriod(periodId) {
    const period = await pool.query(`SELECT * FROM payroll_periods WHERE id = $1`, [periodId]);
    if (!period.rows[0]) throw new Error('Période non trouvée');
    const { year_id } = period.rows[0];
    
    const teachers = await pool.query(`
      SELECT t.id, tc.base_salary
      FROM teachers t
      JOIN teacher_contracts tc ON t.id = tc.teacher_id AND tc.year_id = $1
      WHERE t.status = 'actif'
    `, [year_id]);
    
    const components = await pool.query(`SELECT * FROM salary_components ORDER BY type`);
    
    const payrolls = [];
    for (const teacher of teachers.rows) {
      let totalEarnings = 0;
      let totalDeductions = 0;
      const details = [];
      
      for (const comp of components.rows) {
        let amount = 0;
        if (comp.type === 'base') {
          amount = teacher.base_salary;
        } else if (comp.is_percentage) {
          amount = (teacher.base_salary * comp.value) / 100;
        } else {
          amount = comp.value;
        }
        if (comp.type === 'prime' || comp.type === 'base') {
          totalEarnings += amount;
        } else if (comp.type === 'deduction') {
          totalDeductions += amount;
        }
        details.push({ component_id: comp.id, amount });
      }
      const netSalary = totalEarnings - totalDeductions;
      
      const payroll = await pool.query(`
        INSERT INTO teacher_payroll (teacher_id, payroll_period_id, total_earnings, total_deductions, net_salary, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        ON CONFLICT (teacher_id, payroll_period_id) DO UPDATE SET
          total_earnings = EXCLUDED.total_earnings,
          total_deductions = EXCLUDED.total_deductions,
          net_salary = EXCLUDED.net_salary,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [teacher.id, periodId, totalEarnings, totalDeductions, netSalary]);
      
      await pool.query(`DELETE FROM payroll_details WHERE teacher_payroll_id = $1`, [payroll.rows[0].id]);
      for (const det of details) {
        await pool.query(`
          INSERT INTO payroll_details (teacher_payroll_id, component_id, amount)
          VALUES ($1, $2, $3)
        `, [payroll.rows[0].id, det.component_id, det.amount]);
      }
      payrolls.push(payroll.rows[0]);
    }
    return payrolls;
  }

  static async markPaid(id, paymentDate) {
    const query = `
      UPDATE teacher_payroll
      SET status = 'paid', payment_date = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const values = [paymentDate || new Date(), id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async delete(id) {
    const query = `DELETE FROM teacher_payroll WHERE id = $1 RETURNING id`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = TeacherPayroll;