const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Composants
router.get('/components', authMiddleware, payrollController.getAllComponents);
router.post('/components', authMiddleware, roleMiddleware('admin'), payrollController.createComponent);
router.put('/components/:id', authMiddleware, roleMiddleware('admin'), payrollController.updateComponent);
router.delete('/components/:id', authMiddleware, roleMiddleware('admin'), payrollController.deleteComponent);

// Contrats
router.get('/contracts', authMiddleware, payrollController.getAllContracts);
router.post('/contracts', authMiddleware, roleMiddleware('admin'), payrollController.createContract);
router.put('/contracts/:id', authMiddleware, roleMiddleware('admin'), payrollController.updateContract);
router.delete('/contracts/:id', authMiddleware, roleMiddleware('admin'), payrollController.deleteContract);

// Périodes
router.get('/periods', authMiddleware, payrollController.getAllPayrollPeriods);
router.post('/periods/generate', authMiddleware, roleMiddleware('admin'), payrollController.generatePayrollPeriods);
router.put('/periods/:id', authMiddleware, roleMiddleware('admin'), payrollController.updatePeriod);

// Bulletins
router.get('/', authMiddleware, payrollController.getAllPayrolls);
router.post('/generate', authMiddleware, roleMiddleware('admin'), payrollController.generatePayroll);
router.put('/:id/pay', authMiddleware, roleMiddleware('admin'), payrollController.markAsPaid);

module.exports = router;