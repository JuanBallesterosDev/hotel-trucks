const checkRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.employee.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
        }
        next()
    }
}

module.exports = checkRole
