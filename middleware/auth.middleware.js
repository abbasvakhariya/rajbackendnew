import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const isAdmin = (req, res, next) => {
  // Only this specific email can access admin panel
  const ADMIN_EMAIL = 'abbasvakhariya00@gmail.com';
  
  if (!req.user || !req.user.email) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const userEmail = req.user.email.toLowerCase();
  
  // Check if email matches the ONLY admin email
  if (userEmail !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  // Ensure user has admin role in database
  if (req.user.role !== 'admin') {
    User.findByIdAndUpdate(req.user._id, { role: 'admin' }).catch(console.error);
    req.user.role = 'admin';
  }

  next();
};

