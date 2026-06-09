const Shift = require('../models/Shift')
const Expense = require('../models/Expense')

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

const addExpense = async (req, res) => {
    try {
        const { description, amount } = req.body
        const shift = await Shift.findOne({ employee: req.employee._id, status: 'open' })
        if (!shift) {
            return res.status(400).json({ message: 'No open shift found.' })
        }
        const expense = await Expense.create({
            shift: shift._id,
            description,
            amount
        })
        shift.totalExpenses += amount
        await shift.save()
        res.status(201).json({ expense, shift })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const getShiftExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ shift: req.params.id })
        res.json(expenses)
    } catch (error) {
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
        shift.cashDifference = finalCash - (shift.initialCash + shift.totalCash - shift.totalExpenses)
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

const addIncome = async (req, res) => {
    try {
        const { description, amount } = req.body
        const shift = await Shift.findOne({ employee: req.employee._id, status: 'open' })
        if (!shift) {
            return res.status(400).json({ message: 'No open shift found.' })
        }

        await Expense.create({
            shift: shift._id,
            description,
            amount,
            type: 'ingreso'
        })

        shift.totalCash += amount
        await shift.save()
        res.status(201).json({ shift })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

module.exports = { openShift, closeShift, getCurrentShift, getAllShifts, addExpense, getShiftExpenses, addIncome }