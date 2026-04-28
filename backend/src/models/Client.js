const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    idNumber: { type: String, required: true },
    phone: { type: String, required: true },
    truckPlate: { type: String },
    usualRoom: { type: Number },
    email: { type: String },
    active: { type: Boolean, default: true },

}, { timestamps: true })

module.exports = mongoose.model('Client', clientSchema)