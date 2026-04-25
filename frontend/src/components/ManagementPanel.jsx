import { useState, useEffect } from 'react'
import api from '../api/axios'

const ManagementPanel = () => {
    const [activeSection, setActiveSection] = useState('employees')
    const sections = ['employees', 'rooms', 'products', 'records', 'reports']
    const [employees, setEmployees] = useState([])
    const [showNewEmployee, setShowNewEmployee] = useState(false)
    const [newEmployee, setNewEmployee] = useState({ name: '', username: '', password: '', role: 'worker' })

    useEffect(() => {
        fetchEmployees()
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
            
            {activeSection === 'rooms' && <p className="text-[#a0a0a0]">Rooms coming soon...</p>}
            {activeSection === 'products' && <p className="text-[#a0a0a0]">Products coming soon...</p>}
            {activeSection === 'records' && <p className="text-[#a0a0a0]">Records coming soon...</p>}
            {activeSection === 'reports' && <p className="text-[#a0a0a0]">Reports coming soon...</p>}
        
        </div>
    )
}

export default ManagementPanel