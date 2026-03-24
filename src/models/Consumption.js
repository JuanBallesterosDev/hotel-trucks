const mongoose = require('mongoose')

const consumptionSchema = new mongoose.Schema({
    
    record: { type: mongoose.Schema.Types.ObjectId, ref: 'Record', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    total: {type: Number, default: 0 },
    paid: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },

}, { timestamps: true })

consumptionSchema.pre('save', function(next) {
    this.total = this.quantity * this.unitPrice
    next()
})

module.exports = mongoose.model('Consumption', consumptionSchema) 