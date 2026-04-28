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
            .populate({
                path: 'shift',
                populate: {
                    path: 'employee',
                    select: 'name'
                }
            })
        res.json(records)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const getAllDebts = async (req, res) => {
    try {
        const records = await Record.find({ balance: { $lt: 0 } })
            .populate('client', 'name idNumber phone')
            .populate('room', 'number')

        const debtsByClient = {}
        records.forEach(record => {
            const clientId = record.client._id.toString()
            if(!debtsByClient[clientId]){
                debtsByClient[clientId] = {
                    client:  record.client,
                    totalDebt: 0,
                    records: []
                }
            }
            debtsByClient[clientId].totalDebt += Math.abs(record.balance)
            debtsByClient[clientId].records.push(record)
        })
        res.json(Object.values(debtsByClient    ))
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

        let payment = req.body.paid || 0
        if(payment > 0){
            const records = await Record.find({
                client: record.client,
                balance: { $lt: 0 }
            }).sort({ date: 1 })

            for(const r of records){
                if(payment <= 0) break
                const debt = Math.abs(r.balance)
                if(payment >= debt){
                    r.paid += debt
                    payment -= debt
                }
                else{
                    r.paid += payment
                    payment = 0
                }
                await r.save()
            }
        }
        record.status = 'checkout'
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

const registerPayment = async (req, res) => {
    try {
        let payment = req.body.amount
        
        const records = await Record.find({
            client: req.params.clientId,
            balance: { $lt: 0 }
        }).sort({ date: 1 })

        if (records.length === 0) {
            return res.status(404).json({ message: 'No debts found for this client.' })
        }

        for (const record of records) {
            if (payment <= 0) break
            const debt = Math.abs(record.balance)
            if (payment >= debt) {
                record.paid += debt
                payment -= debt
            } else {
                record.paid += payment
                payment = 0
            }
            await record.save()
        }

        res.json({ message: 'Payment registered successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }

}

const moveRecord = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id)
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' })
        }

        const oldRoomId = record.room
        const newRoomId = req.body.newRoom

        record.room = newRoomId
        record.roomPrice = req.body.roomPrice || record.roomPrice
        await record.save()

        const activeInOldRoom = await Record.find({ room: oldRoomId, status: 'active' })
        if (activeInOldRoom.length === 0) {
            await Room.findByIdAndUpdate(oldRoomId, { status: 'available' })
        }

        await Room.findByIdAndUpdate(newRoomId, { status: 'occupied' })

        res.json(record)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}


module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, checkOut, getClientDebt, getAllDebts, registerPayment, moveRecord }