import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
    const { employee, token } = useAuth()

    if (!token) return <Navigate to="/login" />
    if (role && employee.role !== role) return <Navigate to="/login" />

    return children
}

export default PrivateRoute