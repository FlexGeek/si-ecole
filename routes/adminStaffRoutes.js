const express = require('express');
const router = express.Router();
const adminStaffController = require('../controllers/adminStaffController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin'), adminStaffController.getAllAdminStaff);
router.get('/:id', authMiddleware, roleMiddleware('admin'), adminStaffController.getAdminStaffById);
router.post('/', authMiddleware, roleMiddleware('admin'), adminStaffController.createAdminStaff);
router.put('/:id', authMiddleware, roleMiddleware('admin'), adminStaffController.updateAdminStaff);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), adminStaffController.deleteAdminStaff);

module.exports = router;