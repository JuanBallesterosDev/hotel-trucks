import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
    const { employee, token } = useAuth()

    if (loading) return <div>Cargando sesión...</div>;
    return employee ? children : <Navigate to="/login" />;

}

export default PrivateRoute