const AdminStaff = require('../models/AdminStaff');

exports.getAllAdminStaff = async (req, res) => {
  try {
    const staff = await AdminStaff.findAll();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAdminStaffById = async (req, res) => {
  try {
    const staff = await AdminStaff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Personnel non trouvé' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAdminStaff = async (req, res) => {
  try {
    const { user_id, first_name, last_name, birth_date, phone, address, hire_date, status } = req.body;
    if (!user_id || !first_name || !last_name) return res.status(400).json({ message: 'user_id, prénom et nom requis' });
    const staff = await AdminStaff.create({ user_id, first_name, last_name, birth_date, phone, address, hire_date, status });
    res.status(201).json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAdminStaff = async (req, res) => {
  try {
    const updated = await AdminStaff.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Personnel non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAdminStaff = async (req, res) => {
  try {
    const deleted = await AdminStaff.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Personnel non trouvé' });
    res.json({ message: 'Personnel supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};