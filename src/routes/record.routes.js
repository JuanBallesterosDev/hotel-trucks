const express = require('express')
const router = express.Router()

const { createRecord, getAllRecords, getRecordById, updateRecord, checkOut   } = require('../controllers/record.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, getAllRecords)  
router.get('/:id', auth, getRecordById)
router.post('/', auth, createRecord)
router.put('/:id',auth, updateRecord)
router.put('/:id/checkout', auth, checkOut)

module.exports = router