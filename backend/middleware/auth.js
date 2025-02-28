import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const authUser = async (req, res, next) => {
    try {
        const { token } = req.headers;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please log in.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.body.userId = decoded.id; // Attach userId to request
        next();

    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export default authUser;
