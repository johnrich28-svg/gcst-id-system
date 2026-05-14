import { IdRequest } from '../models/IdRequest.model.js';
import { Payment } from '../models/Payment.model.js';
import axios from 'axios';
import { ENV } from '../config/env.js';

export const initiatePayment = async (requestId, method) => {
  const request = await IdRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  if (method === 'cashier') {
    request.payment.status = 'PENDING';
    await request.save();
    return { message: 'Please proceed to cashier' };
  }

  // Paymongo Checkout Session implementation
  const options = {
    method: 'POST',
    url: 'https://api.paymongo.com/v1/checkout_sessions',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      authorization: `Basic ${Buffer.from(ENV.PAYMONGO_SECRET_KEY).toString('base64')}`
    },
    data: {
      data: {
        attributes: {
          send_email_receipt: true,
          show_description: true,
          show_line_items: true,
          description: `${request.type.toUpperCase()} ID Request - ${request.referenceNumber}`,
          line_items: [
            {
              amount: request.payment.amount * 100, // Paymongo uses cents
              currency: 'PHP',
              name: `${request.type.toUpperCase()} ID Fee`,
              quantity: 1
            }
          ],
          payment_method_types: ['gcash', 'grab_pay', 'paymaya', 'card'],
          success_url: `${ENV.FRONTEND_URL}/success?ref=${request.referenceNumber}`,
          cancel_url: `${ENV.FRONTEND_URL}/payment-failed`,
          metadata: {
            requestId: request._id.toString(),
            referenceNumber: request.referenceNumber
          }
        }
      }
    }
  };

  const response = await axios.request(options);
  const session = response.data.data;

  // Store the session ID in the request for tracking
  request.payment.transactionId = session.id;
  await request.save();

  return { checkoutUrl: session.attributes.checkout_url };
};

export const handleWebhook = async (payload) => {
  const { data } = payload;
  const attributes = data.attributes;
  const resource = attributes.data;

  if (attributes.type === 'checkout_session.payment.paid') {
    const requestId = resource.attributes.metadata.requestId;
    
    await IdRequest.findByIdAndUpdate(requestId, {
      'payment.status': 'PAID',
      'payment.paidAt': new Date(),
      status: 'PAID' // Move to PAID status
    });
  }
};

export const confirmCashierPayment = async (requestId) => {
  const request = await IdRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  request.payment.status = 'PAID';
  request.payment.transactionId = `CASHIER-${Date.now()}`;
  request.status = 'PAID';
  
  return await request.save();
};

