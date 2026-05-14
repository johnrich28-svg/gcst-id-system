import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { ENV } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: '1d' });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json(new ApiResponse(401, null, 'Invalid credentials'));
    }

    const token = generateToken(user._id);
    
    res.status(200).json(new ApiResponse(200, {
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      token
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};
