const jwt = require('jsonwebtoken');
const connection = require('../DB/db.js');

// Middleware to validate admin API key
exports.isAdmin = (req, res, next) => {
    const apiKey = req.header('x-api-key');
    if (apiKey === process.env.ADMIN_API_KEY) {
        next();
    } else {
        res.status(403).json({
            success: false,
            msg: 'Forbidden: Invalid API key'
        });
    }
};


exports.verifyUser = async (req, resp, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
        return resp.status(401).json({
            success: false,
            message: 'Authorization token not found'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        const user = users[0];
        if (!user) {
            return resp.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        user.password = undefined
        req.user = user;
        console.log(user);
        next();
    } catch (error) {
        console.log(error, "my")
        return resp.status(401).json({
            success: false,
            message: 'Invalid token', error
        });
    }
};

