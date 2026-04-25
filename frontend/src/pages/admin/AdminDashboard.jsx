import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import OperationsPanel from '../../components/OperationsPanel'
import ManagementPanel from '../../components/ManagementPanel'
import api from '../../api/axios'

const AdminDashboard = () => {
    const { employee, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('operations')
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
                    <span className="text-sm text-[#a0a0a0]">Admin: {employee.name}</span>
                    <button onClick={logout} className="px-4 py-2 bg-[#2d2d2d] text-[#e0e0e0] text-sm rounded-lg hover:bg-[#3d3d3d] transition">Logout</button>
                </div>
            </nav>

            {/* Tabs */}
            <div className="flex border-b border-[#2d2d2d] px-8">
                <button
                    onClick={() => setActiveTab('operations')}
                    className={`px-6 py-3 text-sm font-medium transition border-b-2 ${activeTab === 'operations' ? 'border-[#4895ef] text-[#4895ef]' : 'border-transparent text-[#a0a0a0] hover:text-[#e0e0e0]'}`}>
                    Operations
                </button>
                <button
                    onClick={() => setActiveTab('management')}
                    className={`px-6 py-3 text-sm font-medium transition border-b-2 ${activeTab === 'management' ? 'border-[#4895ef] text-[#4895ef]' : 'border-transparent text-[#a0a0a0] hover:text-[#e0e0e0]'}`}>
                    Management
                </button>
            </div>

            <div className="px-8 py-6">
                {activeTab === 'operations' && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">Operations</h2>
                            {currentShift ? (
                                <button onClick={handleCloseShift} className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">Close Shift</button>
                            ) : (
                                <button onClick={handleOpenShift} className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">Open Shift</button>
                            )}
                        </div>
                        <OperationsPanel currentShift={currentShift} />
                    </>
                )}
                {activeTab === 'management' && <ManagementPanel />}

            </div>
        </div>
    )
}

export default AdminDashboard


