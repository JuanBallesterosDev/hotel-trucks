const Consumption = require('../models/Consumption')
const Product = require('../models/Product')
const Record = require('../models/Record')

const createConsumption = async (req, res) => {
    try {
        const { record, product, quantity } = req.body

        const productData = await Product.findById(product)
        if (!productData) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        const consumption = await Consumption.create({
            record,
            product,
            productName: productData.name,
            quantity,
            unitPrice: productData.price
        })

        const recordData = await Record.findById(record)
        recordData.totalConsumptions += consumption.total
        await recordData.save()

        res.status(201).json(consumption)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getConsumptionsByRecord = async (req, res) => {
    try {
        const consumptions = await Consumption.find({ record: req.params.recordId })
        res.json(consumptions)
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

const deleteConsumption = async (req, res) => {
    try {
        const consumption = await Consumption.findById(req.params.id)
        if (!consumption) {
            return res.status(404).json({ message: 'Consumption not found.' })
        }

        const record = await Record.findById(consumption.record)
        record.totalConsumptions -= consumption.total
        await record.save()

        await Consumption.findByIdAndDelete(req.params.id)
        res.json({ message: 'Consumption deleted successfully.' })
    } catch (error) {
        res.status(500).json({ message: 'Server error.' })
    }
}

module.exports = { createConsumption, getConsumptionsByRecord, deleteConsumption }