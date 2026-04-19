import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from '../../api/axios'



const WorkerDashboard = () => {
    const [rooms, setRooms] = useState([])
    const [currentShift, setCurrentShift] = useState(null)
    const { employee, logout } = useAuth()
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [clients, setClients] = useState([])

    useEffect(() => {
        fetchRooms()
        fetchCurrentShift()
        fetchClients()
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
        } 
        catch (error) {
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
                {rooms.map((room) => (
                    <div key={room._id} 
                    onClick={() => setSelectedRoom(room)}
                    style={{ 
                        backgroundColor: room.status === 'available' ? 'green' : 'red',
                        padding: '20px',
                        margin: '10px',
                        cursor: 'pointer',
                        width: '150px'
                    }}>
                        <p>Room {room.number}</p>
                        <p>{room.type}</p>
                        <p>${room.price}</p>
                        <p>{room.status}</p>
                    </div>
                ))}
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
                    <button onClick={() => selectedRoom(null)}>Cancel</button>
                </div>
            )}
        </div>
    )
}

export default WorkerDashboard
