// controllers/reportController.js
const Grade = require('../models/Grade');
const Payment = require('../models/Payment');
const TeacherPayroll = require('../models/TeacherPayroll');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.exportGradesToPDF = async (req, res) => {
    try {
        const { classId, periodId } = req.query;
        const grades = await Grade.findByClassAndPeriod(classId, periodId);
        const doc = new PDFDocument();
        const filename = `bulletins_classe_${classId}_periode_${periodId}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        doc.fontSize(18).text('Bulletin de notes', { align: 'center' });
        doc.moveDown();
        // ... formatage des notes
        doc.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportPaymentsToExcel = async (req, res) => {
    try {
        const payments = await Payment.findAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Paiements');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Élève', key: 'student', width: 30 },
            { header: 'Montant', key: 'amount', width: 15 },
            { header: 'Date', key: 'date', width: 15 },
        ];
        payments.forEach(p => worksheet.addRow(p));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=paiements.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.exportPayrollToExcel = async (req, res) => {
    try {
        const payrolls = await TeacherPayroll.findAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Paies');
        worksheet.columns = [
            { header: 'Professeur', key: 'teacher', width: 30 },
            { header: 'Mois', key: 'month', width: 15 },
            { header: 'Net', key: 'net', width: 15 },
        ];
        payrolls.forEach(p => worksheet.addRow(p));
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=paies.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};