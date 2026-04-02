const Client = require('../models/Client')

const getAllClients = async (req, res) => {
    try{
        const clients = await Client.find({ active: true })
        res.json(clients)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})

    }
}

const getClientById = async (req, res) => {
    try{
        const client = await Client.findById(req.params.id)
        if(!client){
            return res.status(404).json({ message: 'Client not found.' })
        }
        res.json(client)
    }
    catch (error) {
        res.status(500).json({ message: 'Server error.'})
    }
}

const createClient = async (req, res) => {
    try{
        const { name, idNumber, phone, truckPlate, usualRoom, email } = req.body
        const client = await Client.create({ name, idNumber, phone, truckPlate, usualRoom, email })
        res.status(201).json(client)

    }
    catch(error) {
        res.status(500).json({ message: 'Server error.'})
    }
}

const updateClient = async (req, res) => {
    try{
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        if(!client){
            return res.status(404).json( { message: 'Client not found.' })
         }
         res.json(client)
    }
    catch(error){
        res.status(500).json({ message: 'Server error.'})
    }
}

const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        )
        if (!client) {
            return res.status(404).json({ message: 'Client not found.' })
        }
        res.json({ message: 'Client deactivated successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}
module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient }