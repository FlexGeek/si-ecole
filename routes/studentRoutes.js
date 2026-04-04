const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, studentController.getAllStudents);
router.get('/:id', authMiddleware, studentController.getStudentById);
router.post('/', authMiddleware, roleMiddleware('admin', 'secretariat'), studentController.createStudent);
router.put('/:id', authMiddleware, roleMiddleware('admin', 'secretariat'), studentController.updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), studentController.deleteStudent);
router.get('/:id/full-data', authMiddleware, studentController.getFullStudentData);

module.exports = router;