

const express = require('express')
const {
    createNote,
    getNotesByJob,
    getNote,
    getAllNotes,
    updateNote,
    deleteNote
} = require('../controllers/note.controller')
const { authUser } = require('../middlewares/auth.middleware')
const { validateNote, validateNoteUpdate } = require('../middlewares/validation.middleware')

const router = express.Router()

router.use(authUser)

router.post('/', validateNote, createNote)
router.get('/job/:jobId', getNotesByJob)
router.get('/:id', getNote)
router.get('/', getAllNotes)
router.put('/:id', validateNoteUpdate, updateNote)
router.delete('/:id', deleteNote)

module.exports = router
