const Teacher = require('../models/Teacher');

const pool = require('../config/db'); 

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Professeur non trouvé' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category } = req.body;
    if (!first_name || !last_name) return res.status(400).json({ message: 'Prénom et nom requis' });
    const teacher = await Teacher.create({ first_name, last_name, birth_date, phone, email, address, hire_date, status, photo_url, category });
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const updated = await Teacher.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Professeur non trouvé' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const deleted = await Teacher.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Professeur non trouvé' });
    res.json({ message: 'Professeur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFullTeacherData = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Enseignant non trouvé' });

    // Contrats
    const contracts = await pool.query(`
      SELECT tc.*, y.label as year_label
      FROM teacher_contracts tc
      JOIN years y ON tc.year_id = y.id
      WHERE tc.teacher_id = $1
      ORDER BY y.start_date DESC
    `, [teacherId]);

    // Bulletins de paie
    const payrolls = await pool.query(`
      SELECT tp.*, y.label as year_label, pp.month
      FROM teacher_payroll tp
      JOIN payroll_periods pp ON tp.payroll_period_id = pp.id
      JOIN years y ON pp.year_id = y.id
      WHERE tp.teacher_id = $1
      ORDER BY y.start_date DESC, pp.month
    `, [teacherId]);

    // Matières enseignées (avec classes)
    const subjects = await pool.query(`
      SELECT s.name as subject_name, c.name as class_name
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      WHERE s.class_id IN (SELECT class_id FROM enrollments GROUP BY class_id) -- simplifié
      -- Pour être précis, il faudrait une table teacher_assignments, mais on peut utiliser les matières liées aux classes où l'enseignant intervient via timetables
    `);
    // Alternative : utiliser la table timetables
    const timetables = await pool.query(`
      SELECT DISTINCT t.*, c.name as class_name, sub.name as subject_name
      FROM timetables t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects sub ON t.subject_id = sub.id
      WHERE t.teacher_id = $1
      ORDER BY c.name, sub.name
    `, [teacherId]);

    res.json({
      teacher,
      contracts: contracts.rows,
      payrolls: payrolls.rows,
      timetables: timetables.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};