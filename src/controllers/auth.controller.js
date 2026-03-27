const jwt = require('jsonwebtoken')
const Employee = require('../models/Employee')

const login = async (req, res) => {

    try{
        const { username, password } = req.body
        const employee = await Employee.findOne({ username })

    if (!employee || !employee.active) {
        return res.status(400).json({ message: 'Invalid credentials.' })
    }

    const isMatch = await employee.comparePassword(password)

    if(!isMatch){
        return   res.status(400).json({ message: 'Invalid credentials.'})
    }

    const token = jwt.sign(
        {id: employee._id, role: employee.role },
        process.env.JWT_SECRET,
        {expiresIn: '8h'}
    )

    res.json({
        token,
        employee: {
            id: employee._id,
            name: employee.name,
            role: employee.role
        }
    })  
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.' })

    }
    
}

module.exports = { login }