import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json(new ApiResponse(statusCode, null, message));
};
