import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Support fallback demo admin token if offline login was used
      if (token === 'demo_admin_token_2026') {
        req.user =
          (await User.findOne({ email: 'info@timelyhealth.in' })) || {
            _id: 'default_admin_id',
            name: 'Timely Health Admin',
            email: 'info@timelyhealth.in',
            role: 'admin',
          };
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'timely_digital_jwt_secret_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account no longer exists. Please log in again.',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid token. Please log in again.',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided. Please log in.',
    });
  }
};
