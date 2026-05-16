import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'


const OperationsPanel = ({ currentShift }) => {
    const [rooms, setRooms] = useState([])
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [customPrice, setCustomPrice] =   useState('')
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
    const [roomRecords, setRoomRecords] = useState([])
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [errors, setErrors] = useState({ name: false, idNumber: false, phone: false })
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [showMoveRoom, setShowMoveRoom] = useState(false)
    const [shiftSummary, setShiftSummary] = useState(null)
    const [expenses, setExpenses] = useState([])
    const [showExpenses, setShowExpenses] = useState(false)
    const [newExpense, setNewExpense] = useState({ description: '', amount: '' })
    const [newIncome, setNewIncome] = useState({ description: '', amount: '' })

    useEffect(() => {
        fetchRooms()
        fetchClients()
        fetchActiveRecords()
        fetchProducts()
        fetchDebts()
        fetchShiftSummary()

        const interval = setInterval(() => {
            fetchRooms()
            fetchActiveRecords()
            fetchDebts()
        }, 30000)

        return () => clearInterval(interval)
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

    const fetchShiftSummary = async () => {
        try {
            const res = await api.get('/shifts/current')
            console.log('shiftSummary:', res.data)
            setShiftSummary(res.data)
            if (res.data) {
                const expensesRes = await api.get(`/shifts/${res.data._id}/expenses`)
                setExpenses(expensesRes.data)
            }
        } catch (error) {
            setShiftSummary(null)
        }
    }
    
    const getCapacity = (type) => {
        if(type === 'single') return 1
        if(type === 'double') return 2
        if(type === 'triple') return 3
        if(type === 'quadruple') return 4
        return 1
    }

    const getOccupants = (roomId) => {
        return activeRecords.filter(r => r.room._id.toString() === roomId.toString()).length
    }

    const handleCheckIn = async (client) => {
        if (!currentShift) {
            alert('Debe de iniciar un turno primero.')
            return
        }
        try {
            await api.post('/records', {
                client: client._id,
                room: selectedRoom._id,
                roomPrice: customPrice ? Number(customPrice) : selectedRoom.price
            })
            setSelectedRoom(null)
            setCustomPrice('')
            setShowCheckIn(false)
            fetchRooms()
            fetchActiveRecords()
        } 
        catch (error) {
            console.error(error)
        }
    }

    const handleCheckOut = async () => {
        const paid = prompt('Digite el valor pagado:')
        if (paid === null) return
        try {
            await api.put(`/records/${activeRecord._id}/checkout`, { paid: Number(paid) })
            setSelectedRoom(null)
            setActiveRecord(null)
            setConsumptions([])
            fetchRooms()
            fetchActiveRecords()
            fetchDebts()
            fetchShiftSummary()
        } catch (error) {
            console.error(error)
        }
    }

    const handlePartialPayment = async () => {
        const payment = prompt('Digite el valor pagado:')
        if (payment === null) return
        try {
            await api.post(`/records/client/${activeRecord.client._id}/payment`, { 
                amount: Number(payment) 
            })
            const updated = await api.get(`/records/${activeRecord._id}`)
            setActiveRecord(updated.data)
            fetchDebts()
            fetchClientDebt(activeRecord.client._id) 
            fetchShiftSummary()           
        } catch (error) {
            console.error(error)
        }
    }

    const handleRoomClick = async (room) => {
        setShowCheckIn(false)
        setSelectedRoom(room)
        setSelectedRecord(null)
        setActiveRecord(null)
        setConsumptions([])

        const occupants = getOccupants(room._id)
        if (occupants === 0) {
            setShowCheckIn(true)
        }
        else{
            const recordsInRoom = activeRecords.filter(r => r.room._id.toString() === room._id.toString())
            setRoomRecords(recordsInRoom)
        }
    }

    const handleSelectRecord = async (record) => {
        setSelectedRecord(record)
        setActiveRecord(record)
        fetchConsumptions(record._id)
        if (record.client && record.client._id) {
            fetchClientDebt(record.client._id)
        }
    }

    const handleCreateClient = async () => {
        const newErrors = {
            name: !newClient.name.trim(),
            idNumber: !newClient.idNumber.trim(),
            phone: !newClient.phone.trim()
        }

        setErrors(newErrors)

        if(Object.values(newErrors).some(err => err)){
            return
        }
        try {
            const res = await api.post('/clients', newClient)
            setClients([...clients, res.data])
            setNewClient({ name: '', idNumber: '', phone: '', truckPlate: '', email: '' })
            setErrors({ name: false, idNumber: false, phone: false })
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
            fetchClientDebt(activeRecord.client._id)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteConsumption = async (consumptionId) => {
        if (!window.confirm('¿Seguro de borrar este consumo?')) return;
        
        try {
            await api.delete(`/consumptions/${consumptionId}`);
            
            const res = await api.get(`/records/${activeRecord._id}`);
            setActiveRecord(res.data);
            fetchConsumptions(activeRecord._id);
            fetchActiveRecords();
            fetchClientDebt(activeRecord.client._id)
        } catch (error) {
            console.error("Error al borrar el consumo:", error);
            alert("No se pudo borrar el consumo");
        }
    };

    const handleMoveRoom = async (newRoom) => {
        try {
            await api.put(`/records/${activeRecord._id}/move`, {
                newRoom: newRoom._id,
                roomPrice: customPrice ? Number(customPrice) : newRoom.price
            })
            setShowMoveRoom(false)
            setSelectedRoom(null)
            setSelectedRecord(null)
            setActiveRecord(null)
            setCustomPrice('')
            fetchRooms()
            fetchActiveRecords()
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount) return
        try {
            const res = await api.post('/shifts/expenses', {
                description: newExpense.description,
                amount: Number(newExpense.amount)
            })
            setNewExpense({ description: '', amount: '' })
            setShiftSummary(res.data.shift)
            fetchShiftSummary()
        } catch (error) {
            console.error(error)
        }
    }

    const handleAddIncome = async () => {
        if (!newIncome.description || !newIncome.amount) return
        try {
            const res = await api.post('/shifts/income', {
                description: newIncome.description,
                amount: Number(newIncome.amount)
            })
            setNewIncome({ description: '', amount: '' })
            setShiftSummary(res.data.shift)
            fetchShiftSummary()
        } catch (error) {
            console.error(error)
        }
    }

    return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0]">
        
        <div className="px-8 py-6">

            {/* Rooms */}
            <h2 className="text-xl font-semibold mb-4">Habitaciones</h2>
            {/* Resumen de caja */}
            {shiftSummary && (
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold">Resumen de Caja</h2>
                        <button onClick={() => setShowExpenses(!showExpenses)}
                            className="px-3 py-1 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                            {showExpenses ? 'Ocultar gastos' : 'Ver gastos'}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-[#2d2d2d] rounded-lg p-3">
                            <p className="text-[#a0a0a0]">Caja inicial</p>
                            <p className="font-semibold text-lg">${shiftSummary.initialCash?.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-lg p-3">
                            <p className="text-[#a0a0a0]">Ingresos</p>
                            <p className="font-semibold text-lg text-[#4cc9f0]">+${shiftSummary.totalCollected?.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-lg p-3">
                            <p className="text-[#a0a0a0]">Gastos</p>
                            <p className="font-semibold text-lg text-[#e63946]">-${shiftSummary.totalExpenses?.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#2d2d2d] rounded-lg p-3">
                            <p className="text-[#a0a0a0]">Dinero actual</p>
                            <p className="font-semibold text-lg text-[#4895ef]">
                                ${(shiftSummary.initialCash + shiftSummary.totalCollected - shiftSummary.totalExpenses)?.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {showExpenses && (
                        <div className="mt-4 border-t border-[#2d2d2d] pt-4">
                            <p className="text-sm text-[#a0a0a0] mb-3">Registrar gasto:</p>
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                <input placeholder="Descripción" value={newExpense.description}
                                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                                    className="flex-1 bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                                <input placeholder="Monto" type="number" value={newExpense.amount}
                                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                    className="w-32 bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                                <button onClick={handleAddExpense}
                                    className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                    Agregar
                                </button>
                            </div>

                            <p className="text-sm text-[#a0a0a0] mb-3 mt-4">Registrar ingreso:</p>
                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                <input placeholder="Descripción" value={newIncome.description}
                                    onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                                    className="flex-1 bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                                <input placeholder="Monto" type="number" value={newIncome.amount}
                                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                                    className="w-32 bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                                <button onClick={handleAddIncome}
                                    className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                    Agregar
                                </button>
                            </div>

                            {expenses.length > 0 && (
                                <div>
                                    <p className="text-sm text-[#a0a0a0] mb-2">Gastos del turno:</p>
                                    {expenses.map((expense) => (
                                        <div key={expense._id} className="flex justify-between text-sm py-1">
                                            <p>{expense.description}</p>
                                            <p className="text-[#e63946]">-${expense.amount?.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
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
                            <p className="font-bold text-lg">Habitacion {room.number}</p>
                            <p className="text-sm capitalize">{room.type}</p>
                            <p className="text-sm">${room.price.toLocaleString()}</p>
                            <p className="text-sm font-semibold mt-1">{occupants}/{capacity}</p>
                        </div>
                    )
                })}
            </div>

            {/* Debts */}
            <h2 className="text-xl font-semibold mb-4">Deudas</h2>
            <div className="mb-8">
                {debts.length === 0 ? (
                    <p className="text-[#a0a0a0] text-sm">No deudas registradas.</p>
                ) : (
                    debts.map((debtor) => (
                        <div key={debtor.client._id}
                            onClick={() => setSelectedDebtor(selectedDebtor?.client._id === debtor.client._id ? null : debtor)}
                            className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-2 cursor-pointer hover:border-[#4895ef] transition">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{debtor.client.name}</p>
                                <p className="text-[#e63946] font-semibold">Debe: ${debtor.totalDebt.toLocaleString()}</p>
                            </div>
                            {selectedDebtor?.client._id === debtor.client._id && (
                                <div className="mt-3 border-t border-[#2d2d2d] pt-3">
                                    <p className="text-sm text-[#a0a0a0] mb-2">Historial:</p>
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
        {showCheckIn && selectedRoom && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-1">Check-in — Habitacion {selectedRoom.number}</h3>
                    <p className="text-[#a0a0a0] text-sm mb-4">Precio: ${selectedRoom.price.toLocaleString()}</p>

                    <div className="flex flex-col gap-1 mb-4">
                        <label className="text-xs text-[#a0a0a0]">Precio personalizado (dejar vacio para usar el precio base)</label>
                        <input
                            type="number"
                            placeholder={selectedRoom.price}
                            value={customPrice}
                            onChange={(e) => setCustomPrice(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none"
                        />
                    </div>

                    <button onClick={() => setShowNewClient(!showNewClient)}
                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mb-4">
                        {showNewClient ? 'Cancelar' : '+ Nuevo Cliente'}
                    </button>

                    {showNewClient && (
                        <div className="flex flex-col gap-3 mb-4 border-b border-[#2d2d2d] pb-4">
                            <div>
                                <input placeholder="Nombre *" value={newClient.name} 
                                    onChange={(e) => {
                                        setNewClient({...newClient, name: e.target.value})
                                        if (errors.name) setErrors({...errors, name: false})
                                    }}
                                    className={`w-full bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none border transition-colors ${errors.name ? 'border-[#e63946]' : 'border-transparent'}`} 
                                />
                                {errors.name && <p className="text-[#e63946] text-xs mt-1 ml-1">Name es requerido</p>}
                            </div>

                            <div>
                                <input placeholder="Cédula *" value={newClient.idNumber} 
                                    onChange={(e) => {
                                        setNewClient({...newClient, idNumber: e.target.value})
                                        if (errors.idNumber) setErrors({...errors, idNumber: false})
                                    }}
                                    className={`w-full bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none border transition-colors ${errors.idNumber ? 'border-[#e63946]' : 'border-transparent'}`} 
                                />
                                {errors.idNumber && <p className="text-[#e63946] text-xs mt-1 ml-1">Cédula es requerido</p>}
                            </div>

                            
                            <div>
                                <input placeholder="Teléfono *" value={newClient.phone} 
                                    onChange={(e) => {
                                        setNewClient({...newClient, phone: e.target.value})
                                        if (errors.phone) setErrors({...errors, phone: false})
                                    }}
                                    className={`w-full bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none border transition-colors ${errors.phone ? 'border-[#e63946]' : 'border-transparent'}`} 
                                />
                                {errors.phone && <p className="text-[#e63946] text-xs mt-1 ml-1">Teléfono es requerido</p>}
                            </div>

                            <input placeholder="Placa (Opcional)" value={newClient.truckPlate} onChange={(e) => setNewClient({...newClient, truckPlate: e.target.value})}
                                className="w-full bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none border border-transparent" />
                            <input placeholder="Email (Opcional)" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                                className="w-full bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none border border-transparent" />

                            <button onClick={handleCreateClient}
                                className="w-full px-4 py-2 mt-2 bg-[#4895ef] text-white text-sm font-medium rounded-lg hover:bg-[#3a7bd5] transition">
                                Guardar Cliente
                            </button>
                        </div>
                    )}

                    <p className="text-sm text-[#a0a0a0] mb-2">Seleccionar cliente:</p>
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
                    <button onClick={() => { setShowCheckIn(false); if(getOccupants(selectedRoom._id) === 0) setSelectedRoom(null) }}
                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                        Cancelar
                    </button>
                </div>
            </div>
        )}

        {/* Occupied Room Panel */}
        {selectedRoom && !showCheckIn && getOccupants(selectedRoom._id) > 0 && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    
                    {!selectedRecord ? (
                        
                        <div>
                            <h3 className="text-lg font-bold mb-1">Habitación {selectedRoom.number}</h3>
                            <p className="text-[#a0a0a0] text-sm mb-4">{getOccupants(selectedRoom._id)}/{getCapacity(selectedRoom.type)} ocupada</p>

                            <p className="text-sm text-[#a0a0a0] mb-2">Huéspedes:</p>
                            <div className="flex flex-col gap-2 mb-4">
                                {roomRecords.map((record) => (
                                    <div key={record._id}
                                        onClick={() => handleSelectRecord(record)}
                                        className="bg-[#2d2d2d] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#3d3d3d] transition flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-sm">{record.client?.name}</p>
                                            <p className="text-xs text-[#a0a0a0]">${record.roomPrice?.toLocaleString()} / noche</p>
                                        </div>
                                        <span className="text-[#e63946] text-sm font-semibold">
                                            {record.balance < 0 ? `-$${Math.abs(record.balance).toLocaleString()}` : '✓'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {getOccupants(selectedRoom._id) < getCapacity(selectedRoom.type) && (
                                <button onClick={() => setShowCheckIn(true)}
                                    className="w-full px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition mb-2">
                                    + Agregar Huésped
                                </button>
                            )}

                            <button onClick={() => { setSelectedRoom(null); setRoomRecords([]) }}
                                className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                                Cerrar
                            </button>
                        </div>
                    ) : (
                         
                        <div>
                            <button onClick={() => { setSelectedRecord(null); setActiveRecord(null) }}
                                className="text-[#a0a0a0] text-sm mb-4 hover:text-[#e0e0e0] transition">
                                ← Atras
                            </button>
                            <h3 className="text-lg font-bold mb-1">Habitacion {selectedRoom.number} — {activeRecord?.client?.name}</h3>
                            
                            <div className="bg-[#2d2d2d] rounded-xl p-4 mb-4 text-sm">
                                <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Precio habitación</span><span>${activeRecord?.roomPrice?.toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Consumos</span><span>${activeRecord?.totalConsumptions?.toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Total</span><span>${activeRecord?.totalDay?.toLocaleString()}</span></div>
                                <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Pagado</span><span>${activeRecord?.paid?.toLocaleString()}</span></div>
                                <div className="flex justify-between py-1 border-t border-[#3d3d3d] mt-1 pt-1">
                                    <span className="text-[#a0a0a0]">Saldo</span>
                                    <span className={activeRecord?.balance < 0 ? 'text-[#e63946]' : 'text-[#4cc9f0]'}>
                                        {activeRecord?.balance < 0 ? `-$${Math.abs(activeRecord?.balance).toLocaleString()}` : `$${activeRecord?.balance?.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-[#a0a0a0]">Deuda total</span>
                                    <span className="text-[#e63946]">${clientDebt.toLocaleString()}</span>
                                </div>
                            </div>

                            {consumptions.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-[#a0a0a0] mb-2">Consumos:</p>
                                    {consumptions.map((c) => (
                                        <div key={c._id} className="flex justify-between text-sm py-1">
                                            <p>{c.productName} x{c.quantity}</p>
                                            <p>${c.total.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-sm text-[#a0a0a0] mb-2">Agregar consumo:</p>
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
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <button onClick={handlePartialPayment}
                                    className="flex-1 px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition">
                                    Registrar Pago
                                </button>
                                <button onClick={handleCheckOut}
                                    className="flex-1 px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                    Check-out
                                </button>
                            </div>
                            <button onClick={() => setShowMoveRoom(true)}
                                className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mt-2">
                                Mover a otra habitación
                            </button>

                            {showMoveRoom && (
                                <div className="mt-4 border-t border-[#2d2d2d] pt-4">
                                    <p className="text-sm text-[#a0a0a0] mb-2">Seleccionar nueva habitación:</p>
                                    <div className="flex flex-col gap-1 mb-3">
                                        <label className="text-xs text-[#a0a0a0]">Precio personalizado (dejar vacío para usar el precio base)</label>
                                        <input
                                            type="numero"
                                            placeholder="Precio personalizado"
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {rooms
                                            .filter(r => r._id !== selectedRoom._id && getOccupants(r._id) < getCapacity(r.type))
                                            .map((room) => (
                                                <div key={room._id}
                                                    onClick={() => handleMoveRoom(room)}
                                                    className="bg-[#2d2d2d] px-4 py-3 rounded-lg cursor-pointer hover:bg-[#3d3d3d] transition flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-sm">Habitación {room.number}</p>
                                                        <p className="text-xs text-[#a0a0a0] capitalize">{room.type} — ${room.price.toLocaleString()}</p>
                                                    </div>
                                                    <span className="text-sm text-[#4cc9f0]">{getOccupants(room._id)}/{getCapacity(room.type)}</span>
                                                </div>
                                            ))}
                                    </div>
                                    <button onClick={() => setShowMoveRoom(false)}
                                        className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mt-2">
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            <button onClick={() => { setSelectedRoom(null); setSelectedRecord(null); setActiveRecord(null) }}
                                className="w-full px-4 py-2 bg-[#2d2d2d] text-sm rounded-lg hover:bg-[#3d3d3d] transition mt-2">
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}        
    </div>
          
)
}

export default OperationsPanel
