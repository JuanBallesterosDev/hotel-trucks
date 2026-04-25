import { useState, useEffect } from 'react'
import api from '../api/axios'

const ManagementPanel = () => {
    const [activeSection, setActiveSection] = useState('employees')
    const sections = ['employees', 'rooms', 'products', 'records', 'reports']
    const [employees, setEmployees] = useState([])
    const [showNewEmployee, setShowNewEmployee] = useState(false)
    const [newEmployee, setNewEmployee] = useState({ name: '', username: '', password: '', role: 'worker' })
    const [rooms, setRooms] = useState([])
    const [showNewRoom, setShowNewRoom] = useState(false)
    const [newRoom, setNewRoom] = useState({ number: '', type: 'single', price: '' })
    const [products, setProducts] = useState([])
    const [showNewProduct, setShowNewProduct] = useState(false)
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '' })
    const [records, setRecords] = useState([])
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchClient, setSearchClient] = useState('')
    const [expandedRecord, setExpandedRecord] = useState(null)

    useEffect(() => {
        fetchEmployees()
        fetchRooms()
        fetchProducts()
        fetchRecords()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees')
            setEmployees(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateEmployee = async () => {
        try {
            await api.post('/employees', newEmployee)
            setNewEmployee({ name: '', username: '', password: '', role: 'worker' })
            setShowNewEmployee(false)
            fetchEmployees()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeactivateEmployee = async (id) => {
        try {
            await api.delete(`/employees/${id}`)
            fetchEmployees()
        } catch (error) {
            console.error(error)
        }
    }

    const fetchRooms = async () => {
        try {
            const res = await api.get('/rooms')
            setRooms(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateRoom = async () => {
        try {
            await api.post('/rooms', { ...newRoom, number: Number(newRoom.number), price: Number(newRoom.price) })
            setNewRoom({ number: '', type: 'single', price: '' })
            setShowNewRoom(false)
            fetchRooms()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeactivateRoom = async (id) => {
        try {
            await api.delete(`/rooms/${id}`)
            fetchRooms()
        } catch (error) {
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

    const handleCreateProduct = async () => {
        try {
            await api.post('/products', { ...newProduct, price: Number(newProduct.price) })
            setNewProduct({ name: '', price: '', category: '' })
            setShowNewProduct(false)
            fetchProducts()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeactivateProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`)
            fetchProducts()
        } catch (error) {
            console.error(error)
        }
    }

    const fetchRecords = async () => {
        try {
            const res = await api.get('/records')
            setRecords(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const getFilteredRecords = () => {
        return records.filter(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0]
            const matchesDate = recordDate >= dateFrom && recordDate <= dateTo
            const matchesStatus = statusFilter === 'all' || record.status === statusFilter
            const matchesClient = record.client?.name?.toLowerCase().includes(searchClient.toLowerCase())
            return matchesDate && matchesStatus && matchesClient
        })
    }

    return(
        <div>
            {/*Sub-tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {sections.map((section) => (
                    <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`px-4 py-2 text-sm rounded-lg capitalize transition ${activeSection === section ? 'bg-[#4895ef] text-white' : 'bg-[#2d2d2d] text-[#a0a0a0] hover:text-[#e0e0e0]'}`}>
                        {section}    
                    </button>
                ))}
            </div>

            {activeSection === 'employees' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Employees</h3>
                        <button onClick={() => setShowNewEmployee(!showNewEmployee)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewEmployee ? 'Cancel' : '+ New Employee'}
                        </button>
                    </div>

                    {showNewEmployee && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Name" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Username" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <select value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none">
                                <option value="worker">Worker</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleCreateEmployee}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Save Employee
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {employees.map((emp) => (
                            <div key={emp._id} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{emp.name}</p>
                                    <p className="text-sm text-[#a0a0a0]">@{emp.username} — {emp.role}</p>
                                </div>
                                <button onClick={() => handleDeactivateEmployee(emp._id)}
                                    className="px-3 py-1 bg-[#e63946] text-white text-xs rounded-lg hover:opacity-80 transition">
                                    Deactivate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === 'rooms' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Rooms</h3>
                        <button onClick={() => setShowNewRoom(!showNewRoom)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewRoom ? 'Cancel' : '+ New Room'}
                        </button>
                    </div>

                    {showNewRoom && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Room number" type="number" value={newRoom.number} onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none">
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                            </select>
                            <input placeholder="Price" type="number" value={newRoom.price} onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <button onClick={handleCreateRoom}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Save Room
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {rooms.map((room) => (
                            <div key={room._id} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Room {room.number}</p>
                                    <p className="text-sm text-[#a0a0a0] capitalize">{room.type} — ${room.price.toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleDeactivateRoom(room._id)}
                                    className="px-3 py-1 bg-[#e63946] text-white text-xs rounded-lg hover:opacity-80 transition">
                                    Deactivate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Products</h3>
                        <button onClick={() => setShowNewProduct(!showNewProduct)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewProduct ? 'Cancel' : '+ New Product'}
                        </button>
                    </div>

                    {showNewProduct && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <button onClick={handleCreateProduct}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Save Product
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {products.map((product) => (
                            <div key={product._id} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-[#a0a0a0]">{product.category} — ${product.price.toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleDeactivateProduct(product._id)}
                                    className="px-3 py-1 bg-[#e63946] text-white text-xs rounded-lg hover:opacity-80 transition">
                                    Deactivate
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeSection === 'records' && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Records</h3>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="checkout">Checkout</option>
                        </select>
                        <input placeholder="Search client..." value={searchClient} onChange={(e) => setSearchClient(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none flex-1" />
                    </div>

                    {/* Records list */}
                    <div className="flex flex-col gap-2">
                        {getFilteredRecords().map((record) => (
                            <div key={record._id} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl overflow-hidden">
                                <div className="p-4 flex justify-between items-center cursor-pointer hover:border-[#4895ef] transition"
                                    onClick={() => setExpandedRecord(expandedRecord === record._id ? null : record._id)}>
                                    <div>
                                        <p className="font-medium">{record.client?.name}</p>
                                        <p className="text-sm text-[#a0a0a0]">Room {record.room?.number} — {new Date(record.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm">${record.totalDay?.toLocaleString()}</p>
                                        <p className={`text-sm font-semibold ${record.balance < 0 ? 'text-[#e63946]' : 'text-[#4cc9f0]'}`}>
                                            {record.balance < 0 ? `-$${Math.abs(record.balance).toLocaleString()}` : `$${record.balance?.toLocaleString()}`}
                                        </p>
                                        <p className={`text-xs capitalize ${record.status === 'active' ? 'text-[#4cc9f0]' : 'text-[#a0a0a0]'}`}>{record.status}</p>
                                    </div>
                                </div>

                                {expandedRecord === record._id && (
                                    <div className="border-t border-[#2d2d2d] px-4 pb-4 pt-3 text-sm">
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Room price</span><span>${record.roomPrice?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Consumptions</span><span>${record.totalConsumptions?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Total</span><span>${record.totalDay?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Paid</span><span>${record.paid?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1 border-t border-[#3d3d3d] mt-1 pt-1">
                                            <span className="text-[#a0a0a0]">Balance</span>
                                            <span className={record.balance < 0 ? 'text-[#e63946]' : 'text-[#4cc9f0]'}>
                                                {record.balance < 0 ? `-$${Math.abs(record.balance).toLocaleString()}` : `$${record.balance?.toLocaleString()}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeSection === 'reports' && <p className="text-[#a0a0a0]">Reports coming soon...</p>}
        
        </div>
    )
}

export default ManagementPanel