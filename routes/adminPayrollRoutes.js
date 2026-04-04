const express = require('express');
const router = express.Router();
const adminPayrollController = require('../controllers/adminPayrollController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Contrats
router.get('/contracts', authMiddleware, roleMiddleware('admin'), adminPayrollController.getAllAdminContracts);
router.post('/contracts', authMiddleware, roleMiddleware('admin'), adminPayrollController.createAdminContract);
router.put('/contracts/:id', authMiddleware, roleMiddleware('admin'), adminPayrollController.updateAdminContract);
router.delete('/contracts/:id', authMiddleware, roleMiddleware('admin'), adminPayrollController.deleteAdminContract);

// Bulletins
router.get('/payrolls', authMiddleware, roleMiddleware('admin'), adminPayrollController.getAllAdminPayrolls);
router.post('/generate', authMiddleware, roleMiddleware('admin'), adminPayrollController.generateAdminPayroll);
router.put('/payrolls/:id/pay', authMiddleware, roleMiddleware('admin'), adminPayrollController.markAdminPayrollAsPaid);
router.get('/:userId', authMiddleware, adminPayrollController.getAdminPayrollByUser);

module.exports = router;