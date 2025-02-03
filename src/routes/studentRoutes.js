const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const markController = require('../controllers/markController');
const { validateStudent, validateMarks } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

// Student routes
router.get('/students', authMiddleware, studentController.getAllStudents);
router.post('/students', [authMiddleware, validateStudent], studentController.createStudent);
router.get('/students/:id', authMiddleware, studentController.getStudentById);
router.put('/students/:id', [authMiddleware, validateStudent], studentController.updateStudent);
router.delete('/students/:id', authMiddleware, studentController.deleteStudent);

// Mark routes
router.get('/students/:id/marks', authMiddleware, markController.getStudentMarks);
router.post('/students/:id/marks', [authMiddleware, validateMarks], markController.addStudentMarks);
router.put('/students/:id/marks/:markId', [authMiddleware, validateMarks], markController.updateStudentMark);
router.delete('/students/:id/marks/:markId', authMiddleware, markController.deleteStudentMark);

module.exports = router;