const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    
    date: { type: Date, default: Date.now },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    roomPrice: { type: Number, required: true },
    totalConsumptions: {type: Number, default: 0 },
    totalDay: { type: Number, default: 0},
    paid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'checkout'], default: 'active' },
    receiptSent: { type: Boolean, default: false },
    receiptChannel: { type: String, enum: ['whatsapp', 'email', 'printed']}

}, { timestamps: true })

recordSchema.pre('save', function(next) {
    this.totalDay = this.roomPrice + this.totalConsumptions
    this.balance = this.paid - this.totalDay
    next()
})

module.exports = mongoose.model('Record', recordSchema)