import jwt from 'jsonwebtoken';

function auth(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized: No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token'
        });
    }
}

export default auth;