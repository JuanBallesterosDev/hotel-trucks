    const Product = require('../models/Product')

    const getAllProducts = async (req, res) => {
        try{
            const products = await Product.find({ active: true })
            res.json(products)
        }
        catch(error){
            res.status(500).json({ message: 'Server error.'})
    
        }
    }
    
    const getProductById = async (req, res) => {
        try{
            const product = await Product.findById(req.params.id)
            if(!product){
                return res.status(404).json({ message: 'Product not found.' })
            }
            res.json(product)
        }
        catch (error) {
            res.status(500).json({ message: 'Server error.'})
        }
    }
    
    const createProduct = async (req, res) => {
        try{
            const { name, price, category, active } = req.body
            const product = await Product.create({ name, price, category, active })
            res.status(201).json(product)
    
        }
        catch(error) {
            res.status(500).json({ message: 'Server error.'})
        }
    }
    
    const updateProduct = async (req, res) => {
        try{
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            )
            if(!product){
                return res.status(404).json( { message: 'Product not found.' })
             }
             res.json(product)
        }
        catch(error){
            res.status(500).json({ message: 'Server error.'})
        }
    }
    
    const deleteProduct = async (req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                { active: false },
                { new: true }
            )
            if (!product) {
                return res.status(404).json({ message: 'Product not found.' })
            }
            res.json({ message: 'Product deactivated successfully.' })
        } catch (error) {
            res.status(500).json({ message: 'Server error.' })
        }
    }
    module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct }