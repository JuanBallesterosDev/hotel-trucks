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
        const res = await api.post('/auth/login', { username, password })
        login(res.data.employee, res.data.token)
        if(res.data.employee.role === 'admin'){
            navigate('/admin')
        }
        else{
            navigate('/worker')
        }
    }
    catch(error){
        setError('Invalid username or password.')
    }
}

return(
        <div>
            <h1>Hotel Trucks</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p>{error}</p>}
                <button type="submit">Login</button>
            </form>
        </div>
)
}



export default Login