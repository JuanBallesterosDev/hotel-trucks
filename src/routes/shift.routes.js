const express = require('express')
const router = express.Router()

const { openShift, closeShift, getCurrentShift, getAllShifts } = require('../controllers/shift.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, checkRole('admin'), getAllShifts)  
router.get('/current', auth, getCurrentShift)
router.post('/', auth, openShift)
router.put('/:id/close', auth, closeShift)

module.exports = router