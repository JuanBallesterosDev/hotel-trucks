import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import api from '../../api/axios'



const WorkerDashboard = () => {
    const [rooms, setRooms] = useState([])
    const { employee, logout } = useAuth()

    useEffect(() => {
        const fetchRooms = async () => {
            try{
                const res = await api.get('/rooms')
                setRooms(res.data)
            }
            catch(error){
                console.error(error)
            }
        }
        fetchRooms()
    }, [])

return(
    <div>
        <h1>Welcome, {employee.name}</h1>
        <button onClick={logout}>Logout</button>
        <h2>Rooms</h2>
        <div>
            {rooms.map((room) => (
                <div key={room._id}>
                    <p>Room {room.number}</p>
                    <p>{room.type}</p>
                    <p>{room.status}</p>
                </div>
            ))}
        </div>
    </div>
)    
}

export default WorkerDashboard