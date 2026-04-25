import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import OperationsPanel from "../../components/OperationsPanel"
import api from '../../api/axios'



const WorkerDashboard = () => {
    const { employee, logout } = useAuth()
    const [currentShift, setCurrentShift] = useState(null)

    useEffect(() => {
        fetchCurrentShift()
    },[])

    const fetchCurrentShift = async () => {
        try {
            const res = await api.get('/shifts/current')
            setCurrentShift(res.data)
        } catch (error) {
            setCurrentShift(null)
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

    

    return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e0e0e0]">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-[#1a1a1a] border-b border-[#2d2d2d]">
            <h1 className="text-2xl font-bold tracking-wide">Hotel Trucks</h1>
            <div className="flex items-center gap-4">
                <span className="text-sm text-[#a0a0a0]">Welcome, {employee.name}</span>
                    {currentShift ? (
                        <button onClick={handleCloseShift} className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">Close Shift</button>
                    ) : (
                        <button onClick={handleOpenShift} className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">Open Shift</button>
                    )}
                    <button onClick={logout} className="px-4 py-2 bg-[#2d2d2d] text-[#e0e0e0] text-sm rounded-lg hover:bg-[#3d3d3d] transition">Logout</button>
            </div>
        </nav>
        <OperationsPanel currentShift={currentShift} />
    </div>
    )
}

export default WorkerDashboard

