const express = require('express')
const router = express.Router()

const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, checkRole('admin'), getAllEmployees)  
router.post('/', auth, checkRole('admin'), createEmployee)
router.put('/:id', auth, checkRole('admin'), updateEmployee)
router.delete('/:id', auth, checkRole('admin'), deleteEmployee)

module.exports = router