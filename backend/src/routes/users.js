const express = require('express');
const {
  getAllUsers, updateProfile, toggleAdmin, toggleTeacher, getTeachers, deleteUser,
  getGroups, createGroup, getSubjects, createSubject
} = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Groups
router.get('/groups', getGroups);
router.post('/groups', authenticate, adminOnly, createGroup);

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', authenticate, adminOnly, createSubject);

// Users
router.get('/', authenticate, adminOnly, getAllUsers);
router.get('/teachers', getTeachers);
router.put('/me', authenticate, updateProfile);
router.put('/:id/admin', authenticate, adminOnly, toggleAdmin);
router.put('/:id/teacher', authenticate, adminOnly, toggleTeacher);
router.delete('/:id', authenticate, adminOnly, deleteUser);

module.exports = router;
