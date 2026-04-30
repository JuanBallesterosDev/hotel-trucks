import { createContext, useState, useContext } from "react";

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [employee, setEmployee] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        const storedToken = localStorage.getItem('token');

        if (storedEmployee && storedToken) {
            setEmployee(JSON.parse(storedEmployee));
            setToken(storedToken);
        }
        setLoading(false); 
    }, []);

    const login = (employeeData, tokenData) => {
        setEmployee(employeeData);
        setToken(tokenData);
        localStorage.setItem('employee', JSON.stringify(employeeData));
        localStorage.setItem('token', tokenData);
    };

    const logout = () => {
        setEmployee(null);
        setToken(null);
        localStorage.removeItem('employee');
        localStorage.removeItem('token');
    };

    return (
        
        <AuthContext.Provider value={{ employee, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)