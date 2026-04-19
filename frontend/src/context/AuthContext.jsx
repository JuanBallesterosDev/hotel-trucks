import { createContext, useState, useContext } from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(
        JSON.parse(localStorage.getItem('employee')) || null
    )
    const [token, setToken] = useState(
            localStorage.getItem('token') || null
    )

    const login = (employeeData, tokenData) => {
        setEmployee(employeeData)
        setToken(tokenData)
        localStorage.setItem('employee', JSON.stringify(employeeData))
        localStorage.setItem('token', tokenData)
    }

    const logout = () => {
        setEmployee(null)
        setToken(null)
        localStorage.removeItem('employee')
        localStorage.removeItem('token')
    }

    return(
        <AuthContext.Provider value={{ employee, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)