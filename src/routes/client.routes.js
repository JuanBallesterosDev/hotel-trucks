const express = require('express')
const router = express.Router()

const { getAllClients, getClientById, createClient, updateClient, deleteClient } = require('../controllers/client.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, getAllClients)  
router.get('/:id', auth, getClientById)
router.post('/', auth, checkRole('admin'), createClient)
router.put('/:id', auth, checkRole('admin'), updateClient)
router.delete('/:id', auth, checkRole('admin'), deleteClient)

module.exports = router