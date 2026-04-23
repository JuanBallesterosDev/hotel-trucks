const Record = require('../models/Record')
const Shift = require('../models/Shift')
const Room = require('../models/Room')

const createRecord = async (req, res) => {
    try {
        const { client, room, roomPrice } = req.body

        const shift = await Shift.findOne({ 
            employee: req.employee._id, 
            status: 'open' 
        })
        if (!shift) {
            return res.status(400).json({ message: 'No open shift found. Open a shift first.' })
        }

        const record = await Record.create({
            client,
            room,
            roomPrice,
            shift: shift._id
        })
        await Room.findByIdAndUpdate(room, { status: 'occupied' })
        res.status(201).json(record)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const getAllRecords = async (req, res) => {
    try {
        const records = await Record.find()
            .populate('client', 'name idNumber')
            .populate('room', 'number type')
            .populate('shift', 'employee')
        res.json(records)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const getRecordById = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id)
            .populate('client', 'name idNumber')
            .populate('room', 'number type')
            .populate('shift', 'employee')
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' })
        }
        res.json(record)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const updateRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id)
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' })
        }
        Object.assign(record, req.body)
        await record.save()
        res.json(record)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const checkOut = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id)
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' })
        }
        if (record.status === 'checkout') {
            return res.status(400).json({ message: 'Record already checked out.' })
        }
        record.status = 'checkout'
        record.paid = req.body.paid || record.paid
        await record.save()

        const activeRecords = await Record.find({
            room: record.room,
            status: 'active'
        })
        if(activeRecords.length === 0){
            await Room.findByIdAndUpdate(record.room, { status: 'available' })
        }
        res.json(record)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const getClientDebt = async (req, res) => {
    try {
        const records = await Record.find({ 
            client: req.params.clientId,
            balance: { $lt: 0 }
        })
        const totalDebt = records.reduce((total, r) => total + Math.abs(r.balance), 0)
        res.json({ totalDebt, records })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, checkOut, getClientDebt }