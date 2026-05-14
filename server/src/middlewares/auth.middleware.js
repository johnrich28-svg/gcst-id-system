import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ENV } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  // Accept token from Authorization header OR ?token= query param (for direct PDF downloads)
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json(new ApiResponse(401, null, 'Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      return res.status(401).json(new ApiResponse(401, null, 'User not found'));
    }
    next();
  } catch (error) {
    return res.status(401).json(new ApiResponse(401, null, 'Not authorized, token failed'));
  }
};
