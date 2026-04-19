const express = require('express')
const router = express.Router()

const { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require('../controllers/room.controller.js')

const auth  = require('../middlewares/auth')
const checkRole = require('../middlewares/roles')

router.get('/', auth, getAllRooms)  
router.get('/:id', auth, getRoomById)
router.post('/', auth, checkRole('admin'), createRoom)
router.put('/:id', auth, checkRole('admin'), updateRoom)
router.delete('/:id', auth, checkRole('admin'), deleteRoom)

module.exports = router