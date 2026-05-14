import * as requestService from '../services/request.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createNewRequest(req.body, req.files);
    res.status(201).json(new ApiResponse(201, request, 'Request submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const trackRequest = async (req, res, next) => {
  try {
    const { ref } = req.params;
    const request = await requestService.getByReference(ref);
    res.status(200).json(new ApiResponse(200, request));
  } catch (error) {
    next(error);
  }
};
