// controllers/payrollController.js
const SalaryComponent = require('../models/SalaryComponent');
const TeacherContract = require('../models/TeacherContract');
const PayrollPeriod = require('../models/PayrollPeriod');
const TeacherPayroll = require('../models/TeacherPayroll');

// ----- Composants de salaire -----
exports.getAllComponents = async (req, res) => {
    try {
        const components = await SalaryComponent.findAll();
        res.json(components);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createComponent = async (req, res) => {
    try {
        const { name, type, is_percentage, value } = req.body;
        if (!name || !type || value === undefined) return res.status(400).json({ message: 'Nom, type et valeur requis' });
        const component = await SalaryComponent.create({ name, type, is_percentage, value });
        res.status(201).json(component);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateComponent = async (req, res) => {
    try {
        const updated = await SalaryComponent.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Composant non trouvé' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteComponent = async (req, res) => {
    try {
        const deleted = await SalaryComponent.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Composant non trouvé' });
        res.json({ message: 'Composant supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ----- Contrats des professeurs -----
exports.getAllContracts = async (req, res) => {
    try {
        const contracts = await TeacherContract.findAll();
        res.json(contracts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createContract = async (req, res) => {
    try {
        const { teacher_id, year_id, base_salary, contract_type, hours_per_month } = req.body;
        if (!teacher_id || !year_id || base_salary === undefined) return res.status(400).json({ message: 'Teacher, année et salaire requis' });
        const contract = await TeacherContract.create({ teacher_id, year_id, base_salary, contract_type, hours_per_month });
        res.status(201).json(contract);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const updated = await TeacherContract.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Contrat non trouvé' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const deleted = await TeacherContract.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Contrat non trouvé' });
        res.json({ message: 'Contrat supprimé' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ----- Périodes de paie -----
exports.getAllPayrollPeriods = async (req, res) => {
    try {
        const periods = await PayrollPeriod.findAll();
        res.json(periods);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.generatePayrollPeriods = async (req, res) => {
    try {
        const { year_id } = req.body;
        if (!year_id) return res.status(400).json({ message: 'year_id requis' });
        const periods = await PayrollPeriod.generateForYear(year_id);
        res.status(201).json(periods);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ----- Bulletins de paie -----
exports.generatePayroll = async (req, res) => {
    try {
        const { period_id } = req.body;
        if (!period_id) return res.status(400).json({ message: 'period_id requis' });
        const payrolls = await TeacherPayroll.generateForPeriod(period_id);
        res.status(201).json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllPayrolls = async (req, res) => {
    try {
        const payrolls = await TeacherPayroll.findAll();
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const payroll = await TeacherPayroll.markPaid(id, req.body.payment_date);
        if (!payroll) return res.status(404).json({ message: 'Bulletin non trouvé' });
        res.json(payroll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.updatePeriod = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await PayrollPeriod.update(req.params.id, { status });
        if (!updated) return res.status(404).json({ message: 'Période non trouvée' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};