const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['gasto', 'ingreso'], default: 'gasto' },
    date: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Expense', expenseSchema)