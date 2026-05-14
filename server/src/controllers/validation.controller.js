import * as validationService from '../services/validation.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const result = await validationService.validateRequest(id, adminId, req.body);
    res.status(200).json(new ApiResponse(200, result, 'Validation processed successfully'));
  } catch (error) {
    next(error);
  }
};
