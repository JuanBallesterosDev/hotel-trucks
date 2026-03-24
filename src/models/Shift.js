const mongoose = require('mongoose')

const shiftSchema = new mongoose.Schema({
    
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, },
    initialCash: { type: Number, required: true },
    finalCash: { type: Number },
    totalCollected: {type: Number, default: 0 },
    cashDifference: { type: Number},
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    note: { type: String },

}, { timestamps: true })

module.exports = mongoose.model('Shift', shiftSchema)