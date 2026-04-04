// controllers/cardController.js
const StudentCard = require('../models/StudentCard');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateCard = async (req, res) => {
    try {
        const { enrollment_id } = req.body;
        if (!enrollment_id) return res.status(400).json({ message: 'enrollment_id requis' });
        // Récupérer les infos de l'élève et de l'inscription
        const enrollment = await Enrollment.findById(enrollment_id);
        if (!enrollment) return res.status(404).json({ message: 'Inscription non trouvée' });
        const student = await Student.findById(enrollment.student_id);
        const classItem = await Class.findById(enrollment.class_id);
        const year = await Year.findById(enrollment.year_id);

        // Générer QR code
        const qrData = JSON.stringify({ student_id: student.id, enrollment_id });
        const qrCodePath = path.join(__dirname, '../uploads/cards/qrcode_' + Date.now() + '.png');
        await QRCode.toFile(qrCodePath, qrData);

        // Générer PDF
        const pdfPath = path.join(__dirname, '../uploads/cards/card_' + enrollment_id + '.pdf');
        const doc = new PDFDocument({ size: 'A6', margin: 20 });
        doc.pipe(fs.createWriteStream(pdfPath));
        doc.fontSize(16).text('CARTE D\'ÉTUDIANT', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Nom: ${student.last_name} ${student.first_name}`);
        doc.text(`Classe: ${classItem.name}`);
        doc.text(`Année: ${year.label}`);
        if (student.photo_url) doc.image(student.photo_url, { fit: [100, 100] });
        doc.image(qrCodePath, { fit: [80, 80], align: 'right' });
        doc.end();

        // Sauvegarder en base
        const card = await StudentCard.create({ enrollment_id, qr_code: qrCodePath, pdf_url: pdfPath });
        res.json({ message: 'Carte générée', card });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCardByEnrollment = async (req, res) => {
    try {
        const card = await StudentCard.findByEnrollment(req.params.enrollmentId);
        if (!card) return res.status(404).json({ message: 'Carte non trouvée' });
        res.json(card);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};