const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const employeeSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['worker', 'admin'], default: 'worker'},
    active: { type: Boolean, default:true },

}, { timestamps: true })

employeeSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

employeeSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('Employee', employeeSchema)