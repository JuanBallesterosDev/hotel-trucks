import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'


const OperationsPanel = ({ currentShift }) => {
    const [rooms, setRooms] = useState([])
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [clients, setClients] = useState([])
    const [activeRecords, setActiveRecords] = useState([])
    const [activeRecord, setActiveRecord] = useState(null)
    const [consumptions, setConsumptions] = useState([])
    const [products, setProducts] = useState([])
    const [quantities, setQuantities] = useState({})
    const [clientDebt, setClientDebt] = useState(0)
    const [debts, setDebts] = useState([])
    const [selectedDebtor, setSelectedDebtor] = useState(null)
    const [showNewClient, setShowNewClient] = useState(false)
    const [newClient, setNewClient] = useState({ name: '', idNumber: '', phone: '', truckPlate: '', email: '' })

    useEffect(() => {
        fetchRooms()
        fetchClients()
        fetchActiveRecords()
        fetchProducts()
        fetchDebts()
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

    const fetchClientDebt = async (clientId) => {
        try {
            const res = await api.get(`/records/client/${clientId}/debt`)
            setClientDebt(res.data.totalDebt)
        } catch (error) {
            console.error(error)
        }
    }
    const fetchDebts = async () => {
        try {
            const res = await api.get('/records/debts')
            setDebts(res.data)
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

    const handleCheckOut = async () => {
        const paid = prompt('Enter amount paid:')
        if (paid === null) return
        try {
            await api.put(`/records/${activeRecord._id}/checkout`, { paid: Number(paid) })
            setSelectedRoom(null)
            setActiveRecord(null)
            setConsumptions([])
            fetchRooms()
            fetchActiveRecords()
            fetchDebts()
        } catch (error) {
            console.error(error)
        }
    }

    const handlePartialPayment = async () => {
        const payment = prompt('Enter payment amount:')
        if (payment === null) return
        try {
            await api.post(`/records/client/${activeRecord.client._id}/payment`, { 
                amount: Number(payment) 
            })
            const updated = await api.get(`/records/${activeRecord._id}`)
            setActiveRecord(updated.data)
            fetchDebts()
            fetchClientDebt(activeRecord.client._id)            
        } catch (error) {
            console.error(error)
        }
    }

    const handleRoomClick = async (room) => {
        setSelectedRoom(room)
        const occupants = getOccupants(room._id)
        if (occupants > 0) {
            const recordsInRoom = activeRecords.filter(r => r.room._id.toString() === room._id.toString())
            if(recordsInRoom.length > 0){
                const record = recordsInRoom[0]
                setActiveRecord(recordsInRoom[0])
                fetchConsumptions(recordsInRoom[0]._id)
                if(record.client &&  record.client._id  )
                    fetchClientDebt(record.client._id)
            }
            
        }
    }

    const handleCreateClient = async () => {
        try {
            const res = await api.post('/clients', newClient)
            setClients([...clients, res.data])
            setNewClient({ name: '', idNumber: '', phone: '', truckPlate: '', email: '' })
            setShowNewClient(false)
        } catch (error) {
            console.error(error)
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
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0]">
        
        <div className="px-8 py-6">

            {/* Rooms */}
            <h2 className="text-xl font-semibold mb-4">Rooms</h2>
            <div className="flex flex-wrap gap-4 mb-8">
                {rooms.map((room) => {
                    const occupants = getOccupants(room._id)
                    const capacity = getCapacity(room.type)
                    const isFull = occupants >= capacity
                    const bgColor = occupants === 0 ? 'bg-[#4cc9f0]' : isFull ? 'bg-[#e63946]' : 'bg-[#e76f51]'

                    return (
                        <div key={room._id}
                            onClick={() => handleRoomClick(room)}
                            className={`${bgColor} p-4 rounded-xl cursor-pointer w-36 text-white hover:opacity-90 transition`}>
                            <p className="font-bold text-lg">Room {room.number}</p>
                            <p className="text-sm capitalize">{room.type}</p>
                            <p className="text-sm">${room.price.toLocaleString()}</p>
                            <p className="text-sm font-semibold mt-1">{occupants}/{capacity}</p>
                        </div>
                    )
                })}
            </div>

            {/* Debts */}
            <h2 className="text-xl font-semibold mb-4">Debts</h2>
            <div className="mb-8">
                {debts.length === 0 ? (
                    <p className="text-[#a0a0a0] text-sm">No debts registered.</p>
                ) : (
                    debts.map((debtor) => (
                        <div key={debtor.client._id}
                            onClick={() => setSelectedDebtor(selectedDebtor?.client._id === debtor.client._id ? null : debtor)}
                            className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-2 cursor-pointer hover:border-[#4895ef] transition">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{debtor.client.name}</p>
                                <p className="text-[#e63946] font-semibold">Owes: ${debtor.totalDebt.toLocaleString()}</p>
                            </div>
                            {selectedDebtor?.client._id === debtor.client._id && (
                                <div className="mt-3 border-t border-[#2d2d2d] pt-3">
                                    <p className="text-sm text-[#a0a0a0] mb-2">History:</p>
                                    {debtor.records.map((record) => (
                                        <div key={record._id} className="flex justify-between text-sm py-1">
                                            <p>Room {record.room.number} — {new Date(record.date).toLocaleDateString()}</p>
                                            <p className="text-[#e63946]">${Math.abs(record.balance).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Check-in Panel */}
        {selectedRoom && selectedRoom.status === 'available' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-1">Check-in — Room {selectedRoom.number}</h3>
                    <p className="text-[#a0a0a0] text-sm mb-4">Price: ${selectedRoom.price.toLocaleString()}</p>

                    <button onClick={() => setShowNewClient(!showNewClient)}
                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mb-4">
                        {showNewClient ? 'Cancel' : '+ New Client'}
                    </button>

                    {showNewClient && (
                        <div className="flex flex-col gap-2 mb-4">
                            <input placeholder="Name" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="ID Number" value={newClient.idNumber} onChange={(e) => setNewClient({...newClient, idNumber: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Truck Plate" value={newClient.truckPlate} onChange={(e) => setNewClient({...newClient, truckPlate: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <button onClick={handleCreateClient}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Save Client
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-[#a0a0a0] mb-2">Select client:</p>
                    <div className="flex flex-col gap-2 mb-4">
                        {clients.map((client) => (
                            <div key={client._id} className="flex justify-between items-center bg-[#2d2d2d] px-3 py-2 rounded-lg">
                                <p className="text-sm">{client.name} — {client.truckPlate}</p>
                                <button onClick={() => handleCheckIn(client)}
                                    className="px-3 py-1 bg-[#4895ef] text-white text-xs rounded-lg hover:bg-[#3a7bd5] transition">
                                    Check-in
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSelectedRoom(null)}
                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                        Cancel
                    </button>
                </div>
            </div>
        )}

        {/* Occupied Room Panel */}
        {selectedRoom && getOccupants(selectedRoom._id) > 0 && activeRecord && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-1">Room {selectedRoom.number} — {activeRecord.client.name}</h3>
                    
                    <div className="bg-[#2d2d2d] rounded-xl p-4 mb-4 text-sm">
                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Room price</span><span>${activeRecord.roomPrice.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Consumptions</span><span>${activeRecord.totalConsumptions.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Total</span><span>${activeRecord.totalDay.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Paid</span><span>${activeRecord.paid.toLocaleString()}</span></div>
                        <div className="flex justify-between py-1 border-t border-[#3d3d3d] mt-1 pt-1">
                            <span className="text-[#a0a0a0]">Balance</span>
                            <span className={activeRecord.balance < 0 ? 'text-[#e63946]' : 'text-[#4cc9f0]'}>
                                {activeRecord.balance < 0 ? `-$${Math.abs(activeRecord.balance).toLocaleString()}` : `$${activeRecord.balance.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-[#a0a0a0]">Total debt</span>
                            <span className="text-[#e63946]">${clientDebt.toLocaleString()}</span>
                        </div>
                    </div>

                    {consumptions.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm text-[#a0a0a0] mb-2">Consumptions:</p>
                            {consumptions.map((c) => (
                                <div key={c._id} className="flex justify-between text-sm py-1">
                                    <p>{c.productName} x{c.quantity}</p>
                                    <p>${c.total.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-[#a0a0a0] mb-2">Add consumption:</p>
                    <div className="flex flex-col gap-2 mb-4">
                        {products.map((product) => (
                            <div key={product._id} className="flex items-center justify-between bg-[#2d2d2d] px-3 py-2 rounded-lg">
                                <p className="text-sm">{product.name} — ${product.price.toLocaleString()}</p>
                                <div className="flex items-center gap-2">
                                    <input type="number" min="1"
                                        value={quantities[product._id] || 1}
                                        onChange={(e) => setQuantities({ ...quantities, [product._id]: Number(e.target.value) })}
                                        className="w-14 bg-[#1a1a1a] text-[#e0e0e0] px-2 py-1 rounded-lg text-sm outline-none text-center" />
                                    <button onClick={() => handleAddConsumption(product)}
                                        className="px-3 py-1 bg-[#4895ef] text-white text-xs rounded-lg hover:bg-[#3a7bd5] transition">
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button onClick={handlePartialPayment}
                            className="flex-1 px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                            Register Payment
                        </button>
                        <button onClick={handleCheckOut}
                            className="flex-1 px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            Check-out
                        </button>
                    </div>
                    <button onClick={() => setSelectedRoom(null)}
                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mt-2">
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
)
}

export default OperationsPanel