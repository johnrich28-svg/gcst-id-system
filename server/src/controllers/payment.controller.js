import * as paymentService from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { requestId, method } = req.body;
    const result = await paymentService.initiatePayment(requestId, method);
    res.status(200).json(new ApiResponse(200, result));
  } catch (error) {
    next(error);
  }
};

export const webhook = async (req, res, next) => {
  try {
    await paymentService.handleWebhook(req.body);
    res.status(200).send({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};
