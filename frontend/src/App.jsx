import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'
import WorkerDashboard from './pages/worker/WorkerDashboard'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                <Route path="/worker" element={
                  <PrivateRoute role="worker">
                    <WorkerDashboard />
                  </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App