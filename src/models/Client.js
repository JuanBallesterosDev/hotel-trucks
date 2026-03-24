const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    idNumber: { type: String },
    phone: { type: String },
    truckPlate: { type: String },
    usualRoom: { type: Number },
    email: { type: String },

}, { timestamps: true })

module.exports = mongoose.model('Client', clientSchema)