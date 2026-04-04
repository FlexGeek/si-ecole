const Absence = require('../models/Absence');

exports.getAllAbsences = async (req, res) => {
  try {
    const absences = await Absence.findAll();
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsenceById = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id);
    if (!absence) return res.status(404).json({ message: 'Absence non trouvée' });
    res.json(absence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAbsencesByEnrollment = async (req, res) => {
  try {
    const absences = await Absence.findByEnrollment(req.params.enrollmentId);
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAbsence = async (req, res) => {
  try {
    const { enrollment_id, absence_date, is_justified, justification } = req.body;
    if (!enrollment_id || !absence_date) {
      return res.status(400).json({ message: 'enrollment_id et absence_date requis' });
    }
    const absence = await Absence.create({ enrollment_id, absence_date, is_justified, justification });
    res.status(201).json(absence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAbsence = async (req, res) => {
  try {
    const updated = await Absence.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Absence non trouvée' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAbsence = async (req, res) => {
  try {
    const deleted = await Absence.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Absence non trouvée' });
    res.json({ message: 'Absence supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};