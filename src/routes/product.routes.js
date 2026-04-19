const express = require('express')
const router = express.Router()

const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, getAllProducts)  
router.get('/:id', auth, getProductById)
router.post('/', auth, checkRole('admin'), createProduct)
router.put('/:id', auth, checkRole('admin'), updateProduct)
router.delete('/:id', auth, checkRole('admin'), deleteProduct)

module.exports = router