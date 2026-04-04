// controllers/studentController.js
const Student = require('../models/Student');
const pool = require('../config/db'); // Ajouter cette ligne

exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Élève non trouvé' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address } = req.body;
        if (!first_name || !last_name) return res.status(400).json({ message: 'Prénom et nom requis' });
        const newStudent = await Student.create({ first_name, last_name, birth_date, photo_url, parent_phone, parent_email, address });
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const updated = await Student.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Élève non trouvé' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const deleted = await Student.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Élève non trouvé' });
        res.json({ message: 'Élève supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getFullStudentData = async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // 1. Informations de base de l'élève
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Élève non trouvé' });

    // 2. Toutes les inscriptions de l'élève (avec classe, année)
    const enrollments = await pool.query(`
      SELECT e.*, c.name as class_name, y.label as year_label, y.id as year_id
      FROM enrollments e
      JOIN classes c ON e.class_id = c.id
      JOIN years y ON e.year_id = y.id
      WHERE e.student_id = $1
      ORDER BY y.start_date DESC
    `, [studentId]);
    
    // 3. Notes par inscription (avec matière, période)
    const grades = await pool.query(`
      SELECT g.*, sub.name as subject_name, p.name as period_name, y.label as year_label
      FROM grades g
      JOIN subjects sub ON g.subject_id = sub.id
      JOIN periods p ON g.period_id = p.id
      JOIN years y ON p.year_id = y.id
      WHERE g.student_id = $1
      ORDER BY y.start_date DESC, p.start_date, sub.name
    `, [studentId]);

    // 4. Absences par inscription
    const absences = await pool.query(`
      SELECT a.*, y.label as year_label, c.name as class_name
      FROM absences a
      JOIN enrollments e ON a.enrollment_id = e.id
      JOIN years y ON e.year_id = y.id
      JOIN classes c ON e.class_id = c.id
      WHERE e.student_id = $1
      ORDER BY a.absence_date DESC
    `, [studentId]);

    // 5. Paiements
    const payments = await pool.query(`
      SELECT p.*, ps.description, y.label as year_label
      FROM payments p
      JOIN enrollments e ON p.enrollment_id = e.id
      JOIN years y ON e.year_id = y.id
      LEFT JOIN payment_schedules ps ON p.schedule_id = ps.id
      WHERE e.student_id = $1
      ORDER BY p.payment_date DESC
    `, [studentId]);

    // Organisation des données par année
    const yearsData = {};
    for (const enrollment of enrollments.rows) {
      const yearId = enrollment.year_id;
      yearsData[yearId] = {
        year_id: yearId,
        year_label: enrollment.year_label,
        class_name: enrollment.class_name,
        enrollment_id: enrollment.id,
        grades: grades.rows.filter(g => g.year_label === enrollment.year_label),
        absences: absences.rows.filter(a => a.year_label === enrollment.year_label),
        payments: payments.rows.filter(p => p.year_label === enrollment.year_label)
      };
    }

    res.json({
      student,
      yearsData: Object.values(yearsData)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};