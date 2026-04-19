const Shift = require('../models/Shift')

const openShift = async(req, res) => {
    try{
        const { initialCash } = req.body
        const shift = await Shift.create({
            employee: req.employee._id,
            initialCash

        })
        res.status(201).json(shift)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.' })
    }
}

const closeShift = async(req, res) => {
    try{
        const { finalCash } = req.body
        const shift = await Shift.findById(req.params.id)
        if(!shift){
            return res.status(404).json({ message: 'Shift not found.'})
        }
        shift.finalCash = finalCash
        shift.closedAt = Date.now()
        shift.cashDifference = finalCash - shift.totalCollected
        shift.status = 'closed'
        await shift.save()
        res.json(shift)  
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})
    }

}

const getCurrentShift = async(req, res) => {
    try{
        const shift = await Shift.findOne({
            employee: req.employee._id,
            status: 'open'
        })
        if(!shift){
            return res.status(404).json({ message: 'No open shift found.'})
        }
        res.json(shift)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})
    }
}

const getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.find().populate('employee', 'name email')
        res.json(shifts)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

module.exports = { openShift, closeShift, getCurrentShift, getAllShifts }
    