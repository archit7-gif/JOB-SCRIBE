
const express = require('express')
const { createJob, getJobs, getJob, updateJob, deleteJob } = require('../controllers/job.controller')
const { authUser } = require('../middlewares/auth.middleware')
const { validateJob } = require('../middlewares/validation.middleware')

const router = express.Router()

router.use(authUser)

router.post('/', validateJob, createJob)
router.get('/', getJobs)
router.get('/:id', getJob)
router.put('/:id', validateJob, updateJob)
router.delete('/:id', deleteJob)

module.exports = router
