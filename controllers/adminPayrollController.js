const AdminContract = require('../models/AdminContract');
const AdminPayroll = require('../models/AdminPayroll');
const pool = require('../config/db'); 


exports.getAllAdminContracts = async (req, res) => {
  try {
    const contracts = await AdminContract.findAll();
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdminContract = async (req, res) => {
  try {
    const { user_id, year_id, base_salary, contract_type } = req.body;
if (!user_id || !year_id || base_salary === undefined) {
  return res.status(400).json({ message: 'user_id, année et salaire requis' });
}    const contract = await AdminContract.create({ user_id, year_id, base_salary, contract_type });
    res.status(201).json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdminContract = async (req, res) => {
  try {
    const updated = await AdminContract.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdminContract = async (req, res) => {
  try {
    const deleted = await AdminContract.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Contrat non trouvé' });
    res.json({ message: 'Contrat supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.getAdminPayrollByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Récupérer l'enregistrement admin_staff correspondant
    const staff = await pool.query(`
      SELECT asf.*, u.email, u.role, u.nom_complet
      FROM admin_staff asf
      JOIN users u ON asf.user_id = u.id
      WHERE asf.user_id = $1
    `, [userId]);
    if (staff.rows.length === 0) {
      return res.status(404).json({ message: 'Personnel administratif non trouvé' });
    }
    const adminStaffId = staff.rows[0].id;
    const userInfo = staff.rows[0];

    // Contrats
    const contracts = await pool.query(`
      SELECT ac.*, y.label as year_label
      FROM admin_contracts ac
      JOIN years y ON ac.year_id = y.id
      WHERE ac.admin_staff_id = $1
      ORDER BY y.start_date DESC
    `, [adminStaffId]);

    // Bulletins de paie
    const payrolls = await pool.query(`
      SELECT ap.*, y.label as year_label, pp.month
      FROM admin_payroll ap
      JOIN payroll_periods pp ON ap.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      WHERE ap.admin_staff_id = $1
      ORDER BY y.start_date DESC, pp.month
    `, [adminStaffId]);

    res.json({
      user: {
        id: userId,
        email: userInfo.email,
        role: userInfo.role,
        nom_complet: userInfo.nom_complet,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name
      },
      contracts: contracts.rows,
      payrolls: payrolls.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// Bulletins
exports.getAllAdminPayrolls = async (req, res) => {
  try {
    const payrolls = await AdminPayroll.findAll();
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateAdminPayroll = async (req, res) => {
  try {
    const { period_id } = req.body;
    if (!period_id) return res.status(400).json({ message: 'period_id requis' });
    const payrolls = await AdminPayroll.generateForPeriod(period_id);
    res.status(201).json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAdminPayrollAsPaid = async (req, res) => {
  try {
    const { payment_date } = req.body;
    const payroll = await AdminPayroll.markPaid(req.params.id, payment_date);
    if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};