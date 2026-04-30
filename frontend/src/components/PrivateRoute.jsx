import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children, role }) => {
    const {  token, loading } = useAuth()

    if (loading) return <div>Cargando sesión...</div>;
    return token ? children : <Navigate to="/login" />;

}

export default PrivateRoute