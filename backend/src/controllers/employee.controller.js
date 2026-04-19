const Employee = require('../models/Employee')

const getAllEmployees = async (req, res) => {
    try{
        const employees = await Employee.find({ active: true }).select('-password')
        res.json(employees)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})

    }
}

const createEmployee = async (req, res) => {
    try{
        const { name, username, password, role, active } = req.body
        const employee = await Employee.create({ name, username, password, role, active})
        res.status(201).json(employee)

    }
    catch(error) {
        res.status(500).json({ message: 'Server error.'})
    }
}

const updateEmployee = async (req, res) => {
    try{
        const employee = await Employee.findByIdAndUpdate(req.params.id)
        if(!employee){
            return res.status(404).json( { message: 'Employee not found.' })
         }
         Object.assign(employee, req.body)
         await employee.save()
         res.json(employee)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})
    }
}

const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        )
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' })
        }
        res.json({ message: 'Employee deactivated successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}
module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee }