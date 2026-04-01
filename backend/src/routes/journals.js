const express = require('express');
const { getJournals, getJournalById, createJournal, deleteJournal, addColumn } = require('../controllers/journalController');
const { upsertGrade } = require('../controllers/gradeController');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Grades route MUST be before /:id to avoid Express matching "grades" as an id param
router.put('/grades/upsert', authenticate, adminOnly, upsertGrade);

router.get('/', authenticate, getJournals);
router.get('/:id', authenticate, getJournalById);
router.post('/', authenticate, adminOnly, createJournal);
router.delete('/:id', authenticate, adminOnly, deleteJournal);
router.post('/:id/columns', authenticate, adminOnly, addColumn);

module.exports = router;
