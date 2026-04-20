import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from '../../api/axios'



const WorkerDashboard = () => {
    const [rooms, setRooms] = useState([])
    const [currentShift, setCurrentShift] = useState(null)
    const { employee, logout } = useAuth()
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [clients, setClients] = useState([])
    const [activeRecords, setActiveRecords] = useState([])
    const [activeRecord, setActiveRecord] = useState(null)
    const [consumptions, setConsumptions] = useState([])
    const [products, setProducts] = useState([])
    const [quantities, setQuantities] = useState({})

    useEffect(() => {
        fetchRooms()
        fetchCurrentShift()
        fetchClients()
        fetchActiveRecords()
        fetchProducts()
    }, [])

    const fetchRooms = async () => {
        try{
            const res = await api.get('/rooms')
            setRooms(res.data)
        }
        catch(error){
            console.error(error)
        }
    }

    const fetchCurrentShift = async () => {
        try{
            const res = await api.get('/shifts/current')
            setCurrentShift(res.data)
        }
        catch(error){
            setCurrentShift(null)
        }
    }

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients')
            setClients(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchActiveRecords = async () => {
        try {
            const res = await api.get('/records')
            const active = res.data.filter(r => r.status === 'active')
            setActiveRecords(active)
        } 
        catch (error) {
            console.error(error)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products')
            setProducts(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchConsumptions = async (recordId) => {
        try {
            const res = await api.get(`/consumptions/record/${recordId}`)
            setConsumptions(res.data)
        } catch (error) {
            console.error(error)
        }
    }
    
    const getCapacity = (type) => {
        if(type === 'single') return 1
        if(type === 'double') return 2
        if(type === 'triple') return 3
        return 1
    }

    const getOccupants = (roomId) => {
        return activeRecords.filter(r => r.room._id.toString() === roomId.toString()).length
    }


    const handleOpenShift = async () => {
        const initialCash = prompt('Enter initial cash amount:')
        if (!initialCash) return
        try {
            const res = await api.post('/shifts', { initialCash: Number(initialCash) })
            setCurrentShift(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCloseShift = async () => {
        const finalCash = prompt('Enter final cash amount:')
        if (!finalCash) return
        try {
            await api.put(`/shifts/${currentShift._id}/close`, { finalCash: Number(finalCash) })
            setCurrentShift(null)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCheckIn = async (client) => {
        if (!currentShift) {
            alert('You must open a shift first.')
            return
        }
        try {
            await api.post('/records', {
                client: client._id,
                room: selectedRoom._id,
                roomPrice: selectedRoom.price
            })
            setSelectedRoom(null)
            fetchRooms()
            fetchActiveRecords()
        } 
        catch (error) {
            console.error(error)
        }
    }

    const handleRoomClick = async (room) => {
        setSelectedRoom(room)
        const occupants = getOccupants(room._id)
        if (occupants > 0) {
            const recordsInRoom = activeRecords.filter(r => r.room._id.toString() === room._id.toString())
            setActiveRecord(recordsInRoom[0])
            fetchConsumptions(recordsInRoom[0]._id)
        }
    }

    const handleAddConsumption = async (product) => {
        try {
            const quantity = quantities[product._id] || 1
            await api.post('/consumptions', {
                record: activeRecord._id,
                product: product._id,
                quantity: quantity
            })

            const res = await api.get(`/records/${activeRecord._id}`)
            setActiveRecord(res.data)
            fetchConsumptions(activeRecord._id)
            fetchActiveRecords()
            setQuantities({})
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <nav>
                <h1>Hotel Trucks</h1>
                <p>Welcome, {employee.name}</p>
                {currentShift ? (
                    <button onClick={handleCloseShift}>Close Shift</button>
                ) : (
                    <button onClick={handleOpenShift}>Open Shift</button>
                )}
                <button onClick={logout}>Logout</button>
            </nav>

            <h2>Rooms</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {rooms.map((room) => {
                    const occupants = getOccupants(room._id)
                    const capacity = getCapacity(room.type)
                    const isFull = occupants >= capacity

                    return(
                        <div key={room._id} 
                            onClick={() => handleRoomClick(room)}
                            style={{ 
                                backgroundColor: occupants   === 0? 'green' : isFull ? 'red' : 'orange',
                                padding: '20px',
                                margin: '10px',
                                cursor: 'pointer',
                                width: '150px'
                            }}>
                            <p>Room {room.number}</p>
                            <p>{room.type}</p>
                            <p>${room.price}</p>
                            <p>{occupants}/{capacity}</p>
                        </div>
                    )
                })}
                    
            </div>

            {selectedRoom && selectedRoom.status === 'available' && (
                <div>
                    <h3>Check-in - Room {selectedRoom.number}</h3>
                    <p>Price: ${selectedRoom.price}</p>
                    <h4>Select client:</h4>
                    {clients.map((client) => (
                        <div key={client._id}>
                            <p>{client.name} - {client.truckPlate}</p>
                            <button onClick={() => handleCheckIn(client)}>Check-in</button>
                        </div>
                    ))}
                    <button onClick={() => setSelectedRoom(null)}>Cancel</button>
                </div>
            )}

            {selectedRoom && getOccupants(selectedRoom._id) > 0 && activeRecord && (
                <div>
                    <h3>Room {selectedRoom.number} - {activeRecord.client.name}</h3>
                    <p>Room price: ${activeRecord.roomPrice}</p>
                    <p>Consumptions: ${activeRecord.totalConsumptions}</p>
                    <p>Total: ${activeRecord.totalDay}</p>
                    <p>Paid: ${activeRecord.paid}</p>
                    <p>Balance: ${activeRecord.balance}</p>

                    <h4>Consumptions:</h4>
                    {consumptions.map((c) => (
                        <div key={c._id}>
                            <p>{c.productName} x{c.quantity} — ${c.total}</p>
                        </div>
                    ))}

                    <h4>Add consumption:</h4>
                    {products.map((product) => (
                        <div key={product._id}>
                            <p>{product.name} — ${product.price}</p>
                            <input
                                type="number"
                                min="1"
                                value={quantities[product._id] || 1}
                                onChange={(e) => setQuantities({ ...quantities, [product._id]: Number(e.target.value) })}
                            />
                            <button onClick={() => handleAddConsumption(product)}>Add</button>
                        </div>
                    ))}

                    <button onClick={() => setSelectedRoom(null)}>Close</button>
                </div>
            )}
        </div>
    )
}

export default WorkerDashboard

