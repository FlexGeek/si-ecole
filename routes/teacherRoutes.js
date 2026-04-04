const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Routes accessibles à tous les utilisateurs connectés (lecture)
router.get('/', authMiddleware, teacherController.getAllTeachers);
router.get('/:id', authMiddleware, teacherController.getTeacherById);

// Routes d'écriture réservées à l'admin
router.post('/', authMiddleware, roleMiddleware('admin'), teacherController.createTeacher);
router.put('/:id', authMiddleware, roleMiddleware('admin'), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), teacherController.deleteTeacher);
router.get('/:id/full-data', authMiddleware, teacherController.getFullTeacherData);

module.exports = router;