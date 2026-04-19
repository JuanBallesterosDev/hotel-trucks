const express = require('express')
const router = express.Router()

const { createConsumption, getConsumptionsByRecord, deleteConsumption } = require('../controllers/consumption.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')
  
router.get('/record/:recordId', auth, getConsumptionsByRecord)
router.post('/', auth, createConsumption)
router.delete('/:id', auth, deleteConsumption)

module.exports = router