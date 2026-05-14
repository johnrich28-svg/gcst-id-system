import { ApiResponse } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        new ApiResponse(403, null, `Role ${req.user.role} is not authorized to access this route`)
      );
    }
    next();
  };
};
