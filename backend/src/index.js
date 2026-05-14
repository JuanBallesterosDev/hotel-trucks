    const express = require('express')
    const cors = require('cors')
    const dotenv = require('dotenv')
    const connectDB = require('./config/db')

    dotenv.config()
    connectDB()

    const app = express()

    const allowedOrigins = [
        'http://localhost:5173',               
        'http://192.168.2.65:5173',            
        'https://hotel-trucks.vercel.app',
        process.env.ALLOWED_ORIGIN
    ].filter(Boolean);

    app.use(cors({
        origin: function (origin, callback) {
            
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
            } else {
            console.log("Origen bloqueado por CORS:", origin);
            callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    app.use(express.json())
    app.use('/api/auth', require('./routes/auth.routes'))
    app.use('/api/rooms', require('./routes/room.routes'))
    app.use('/api/clients', require('./routes/client.routes'))
    app.use('/api/products', require('./routes/product.routes')) 
    app.use('/api/shifts', require('./routes/shift.routes'))
    app.use('/api/records', require('./routes/record.routes'))
    app.use('/api/consumptions', require('./routes/consumption.routes'))
    app.use('/api/employees', require('./routes/employee.routes'))

    app.get('/', (req, res) => {
        res.json({ message: 'API Hotel Trucks active' })
    })

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running at port ${PORT}`))