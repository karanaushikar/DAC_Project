const authorize = (...roles) => {
    return (req, res, next) => {
        // req.user is attached by the 'protect' middleware
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user data' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Forbidden: Your role ('${req.user.role}') is not permitted to access this resource.` 
            });
        }
        
        // If the user's role is in the list of allowed roles, proceed
        next();
    };
};

module.exports = { authorize };