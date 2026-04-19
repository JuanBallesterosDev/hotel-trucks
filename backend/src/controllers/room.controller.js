const Room = require('../models/Room')

const getAllRooms = async (req, res) => {
    try{
        const rooms = await Room.find({ active: true })
        res.json(rooms)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})

    }
}

const getRoomById = async (req, res) => {
    try{
        const room = await Room.findById(req.params.id)
        if(!room){
            return res.status(404).json({ message: 'Room not found.' })
        }
        res.json(room)
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.'})
    }
}

const createRoom = async (req, res) => {
    try{
        const { number, type, price } = req.body
        const room = await Room.create({ number, type, price})
        res.status(201).json(room)

    }
    catch(error) {
        res.status(500).json({ message: 'Server error.'})
    }
}

const updateRoom = async (req, res) => {
    try{
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if(!room){
            return res.status(404).json( { message: 'Room not found.' })
         }
         res.json(room)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})
    }
}

const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        )
        if (!room) {
            return res.status(404).json({ message: 'Room not found.' })
        }
        res.json({ message: 'Room deactivated successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}
module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom }