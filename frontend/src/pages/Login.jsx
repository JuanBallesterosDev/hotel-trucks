import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async(e) => {
    e.preventDefault()
    try{
        const res = await api.post('/auth/login', { username: username.trim(), password: password.trim() })
        login(res.data.employee, res.data.token)
        if(res.data.employee.role === 'admin'){
            navigate('/admin')
        }
        else{
            navigate('/worker')
        }
    }
    catch(error){
        setError('Usuario o contraseña incorrectos.')
    }
}

return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-full max-w-sm">
            
            {/* Logo / Title */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#e0e0e0] tracking-wide">{import.meta.env.VITE_HOTEL_NAME}</h1>
                <p className="text-[#a0a0a0] text-sm mt-2">Iniciar sesión para continuar</p>
            </div>

            {/* Card */}
            <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#a0a0a0]">Usuario</label>
                        <input
                            type="text"
                            placeholder="Ingresa tu usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-4 py-3 rounded-lg text-sm outline-none focus:border focus:border-[#4895ef] transition"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-[#a0a0a0]">Contraseña</label>
                        <input
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-[#2d2d2d] text-[#e0e0e0] px-4 py-3 rounded-lg text-sm outline-none focus:border focus:border-[#4895ef] transition"
                        />
                    </div>
                    {error && <p className="text-[#e63946] text-xs">{error}</p>}
                    <button type="submit"
                        className="px-4 py-3 bg-[#4895ef] text-white text-sm font-medium rounded-lg hover:bg-[#3a7bd5] transition mt-2">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    </div>
)
}



export default Login