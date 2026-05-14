import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { useState, useEffect } from 'react'
import api from '../api/axios'

const ManagementPanel = () => {
    const [activeSection, setActiveSection] = useState('employees')
    const sections = ['empleados', 'habitaciones', 'productos', 'records', 'reportes']
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
    const [reportDateFrom, setReportDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
    const [reportDateTo, setReportDateTo] = useState(new Date().toISOString().split('T')[0])

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

    const handleGenerateReport = async () => {
        try{
            const res = await api.get('/records')
            const shiftsRes = await api.get('/shifts')

            const filteredRecords = res.data.filter(record => {
                const recordDate = new Date(record.date).toISOString().split('T')[0]
                return recordDate >= reportDateFrom && recordDate <= reportDateTo
            })

            const workbook = new ExcelJS.Workbook()
            workbook.creator = 'Hotel Trucks System'
            workbook.created = new Date()

            const summarySheet = workbook.addWorksheet('Summary')
        
            summarySheet.mergeCells('A1:C1')
            summarySheet.getCell('A1').value = 'HOTEL TRUCKS — REPORT SUMMARY'
            summarySheet.getCell('A1').font = { bold: true, size: 14 }
            summarySheet.getCell('A1').alignment = { horizontal: 'center' }

            summarySheet.addRow([])
            summarySheet.addRow(['Generated:', new Date().toLocaleString()])
            summarySheet.addRow(['Period:', `${reportDateFrom} to ${reportDateTo}`])
            summarySheet.addRow([])

            const totalRevenue = filteredRecords.reduce((sum, r) => sum + (r.totalDay || 0), 0)
            const totalPaid = filteredRecords.reduce((sum, r) => sum + (r.paid || 0), 0)
            const totalDebt = filteredRecords.reduce((sum, r) => r.balance < 0 ? sum + Math.abs(r.balance) : sum, 0)
            const activeCount = filteredRecords.filter(r => r.status === 'active').length
            const checkoutCount = filteredRecords.filter(r => r.status === 'checkout').length

            summarySheet.addRow(['TOTALS', '', ''])
            summarySheet.addRow(['Total Revenue', totalRevenue])
            summarySheet.addRow(['Total Collected', totalPaid])
            summarySheet.addRow(['Total Pending Debt', totalDebt])
            summarySheet.addRow(['Active Records', activeCount])
            summarySheet.addRow(['Checkout Records', checkoutCount])
            summarySheet.addRow(['Total Records', filteredRecords.length])

            summarySheet.getColumn(1).width = 25
            summarySheet.getColumn(2).width = 20

            // ─── HOJA 2: DETALLE DE TRANSACCIONES ───
            const detailSheet = workbook.addWorksheet('Transactions')

            detailSheet.columns = [
                { header: 'Date & Time', key: 'date', width: 20 },
                { header: 'Record ID', key: 'id', width: 28 },
                { header: 'Client', key: 'client', width: 25 },
                { header: 'Room', key: 'room', width: 10 },
                { header: 'Room Type', key: 'roomType', width: 12 },
                { header: 'Room Price', key: 'roomPrice', width: 15 },
                { header: 'Consumptions', key: 'consumptions', width: 15 },
                { header: 'Total', key: 'total', width: 15 },
                { header: 'Paid', key: 'paid', width: 15 },
                { header: 'Balance', key: 'balance', width: 15 },
                { header: 'Status', key: 'status', width: 12 },
                { header: 'Employee', key: 'shift', width: 20 },
            ]

            // Style header
            detailSheet.getRow(1).font = { bold: true }
            detailSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2D2D2D' } }
            detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
            detailSheet.autoFilter = { from: 'A1', to: 'L1' }
            detailSheet.views = [{ state: 'frozen', ySplit: 1 }]

            filteredRecords.forEach(record => {
                const row = detailSheet.addRow({
                    date: new Date(record.date).toLocaleString(),
                    id: record._id,
                    client: record.client?.name || 'N/A',
                    room: record.room?.number || 'N/A',
                    roomType: record.room?.type || 'N/A',
                    roomPrice: record.roomPrice,
                    consumptions: record.totalConsumptions,
                    total: record.totalDay,
                    paid: record.paid,
                    balance: record.balance,
                    status: record.status,
                    shift: record.shift?.employee?.name || 'N/A'
                })

                // Color balance negativo en rojo
                if (record.balance < 0) {
                    row.getCell('balance').font = { color: { argb: 'FFE63946' } }
                }

                // Format currency cells
                ;['roomPrice', 'consumptions', 'total', 'paid', 'balance'].forEach(key => {
                    row.getCell(key).numFmt = '$#,##0'
                })
            })

            // Totals row
            const lastRow = filteredRecords.length + 2
            detailSheet.addRow([])
            const totalsRow = detailSheet.addRow({
                date: 'TOTALS',
                roomPrice: { formula: `SUM(F2:F${lastRow})` },
                consumptions: { formula: `SUM(G2:G${lastRow})` },
                total: { formula: `SUM(H2:H${lastRow})` },
                paid: { formula: `SUM(I2:I${lastRow})` },
                balance: { formula: `SUM(J2:J${lastRow})` },
            })
            totalsRow.font = { bold: true }

            // ─── HOJA 3: DEUDAS PENDIENTES ───
            const debtsSheet = workbook.addWorksheet('Pending Debts')

            debtsSheet.columns = [
                { header: 'Client', key: 'client', width: 25 },
                { header: 'Room', key: 'room', width: 10 },
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Total', key: 'total', width: 15 },
                { header: 'Paid', key: 'paid', width: 15 },
                { header: 'Debt', key: 'debt', width: 15 },
                { header: 'Status', key: 'status', width: 12 },
            ]

            debtsSheet.getRow(1).font = { bold: true }
            debtsSheet.views = [{ state: 'frozen', ySplit: 1 }]

            const debtRecords = res.data.filter(r => r.balance < 0)
            debtRecords.forEach(record => {
                const row = debtsSheet.addRow({
                    client: record.client?.name || 'N/A',
                    room: record.room?.number || 'N/A',
                    date: new Date(record.date).toLocaleDateString(),
                    total: record.totalDay,
                    paid: record.paid,
                    debt: Math.abs(record.balance),
                    status: record.status
                })
                row.getCell('debt').font = { color: { argb: 'FFE63946' } }
                ;['total', 'paid', 'debt'].forEach(key => {
                    row.getCell(key).numFmt = '$#,##0'
                })
            })

            const buffer = await workbook.xlsx.writeBuffer()
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            saveAs(blob, `hotel-trucks-report-${reportDateFrom}-to-${reportDateTo}.xlsx`)

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

            {activeSection === 'empleados' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Empleados</h3>
                        <button onClick={() => setShowNewEmployee(!showNewEmployee)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewEmployee ? 'Cancelar' : '+ Nuevo Empleado'}
                        </button>
                    </div>

                    {showNewEmployee && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Nombre" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Usuario" value={newEmployee.username} onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Contraseña" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <select value={newEmployee.role} onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none">
                                <option value="worker">Empleado</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleCreateEmployee}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Guardar Empleado
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
                                    Desactivar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === 'habitaciones' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Habitaciones</h3>
                        <button onClick={() => setShowNewRoom(!showNewRoom)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewRoom ? 'Cancelar' : '+ Nueva Habitación'}
                        </button>
                    </div>

                    {showNewRoom && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Número de habitación" type="number" value={newRoom.number} onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none">
                                <option value="single">1 Cama</option>
                                <option value="double">2 Camas</option>
                                <option value="triple">3 Camas</option>
                                <option value="quadruple">4 Camas</option>
                            </select>
                            <input placeholder="Price" type="number" value={newRoom.price} onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <button onClick={handleCreateRoom}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Guardar Habitación
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        {rooms.map((room) => (
                            <div key={room._id} className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Habitación {room.number}</p>
                                    <p className="text-sm text-[#a0a0a0] capitalize">{room.type} — ${room.price.toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleDeactivateRoom(room._id)}
                                    className="px-3 py-1 bg-[#e63946] text-white text-xs rounded-lg hover:opacity-80 transition">
                                    Desactivar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === 'productos' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Productos</h3>
                        <button onClick={() => setShowNewProduct(!showNewProduct)}
                            className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            {showNewProduct ? 'Cancel' : '+ New Product'}
                        </button>
                    </div>

                    {showNewProduct && (
                        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-4 mb-4 flex flex-col gap-2">
                            <input placeholder="Nombre" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Precio" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <input placeholder="Categoria" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            <button onClick={handleCreateProduct}
                                className="px-4 py-2 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                                Guardar Producto
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
                                    Desactivar
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
                            <option value="all">Todo</option>
                            <option value="active">Activo</option>
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
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Precio Habitación</span><span>${record.roomPrice?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Consumos</span><span>${record.totalConsumptions?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Total</span><span>${record.totalDay?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1"><span className="text-[#a0a0a0]">Pagado</span><span>${record.paid?.toLocaleString()}</span></div>
                                        <div className="flex justify-between py-1 border-t border-[#3d3d3d] mt-1 pt-1">
                                            <span className="text-[#a0a0a0]">Saldo</span>
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

            {activeSection === 'reportes' && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Reports</h3>
                    <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-xl p-6">
                        <p className="text-[#a0a0a0] text-sm mb-4">Genera un reporte Excel completo con todos los registros para el contador.</p>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#a0a0a0]">Desde</label>
                                <input type="date" value={reportDateFrom} onChange={(e) => setReportDateFrom(e.target.value)}
                                    className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-[#a0a0a0]">Hasta</label>
                                <input type="date" value={reportDateTo} onChange={(e) => setReportDateTo(e.target.value)}
                                    className="bg-[#2d2d2d] text-[#e0e0e0] px-3 py-2 rounded-lg text-sm outline-none" />
                            </div>
                        </div>

                        <button onClick={handleGenerateReport}
                            className="px-6 py-3 bg-[#4895ef] text-white text-sm rounded-lg hover:bg-[#3a7bd5] transition">
                            Descargar Reporte Excel
                        </button>
                    </div>
                </div>
            )}
        
        </div>
    )
}

export default ManagementPanel