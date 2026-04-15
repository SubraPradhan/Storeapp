import type { Env, Order, OrderItem } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { hmacSha256, timingSafeEqual } from '../utils/crypto';
import { sendPaymentConfirmEmail } from '../services/email';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment_link?: {
      entity: {
        id: string;
        status: string;
        amount: number;
        amount_paid: number;
        notes: {
          order_ref?: string;
          order_id?: string;
        };
      };
    };
    payment?: {
      entity: {
        id: string;
        amount: number;
        status: string;
        method: string;
      };
    };
  };
}

export async function handleRazorpayWebhook(env: Env, request: Request): Promise<Response> {
  // Verify signature
  const signature = request.headers.get('X-Razorpay-Signature');
  if (!signature) {
    return errorResponse('Missing signature', 400);
  }

  const rawBody = await request.text();

  const expectedSignature = await hmacSha256(env.WEBHOOK_SECRET, rawBody);

  if (!timingSafeEqual(signature, expectedSignature)) {
    console.error('Webhook signature mismatch');
    return errorResponse('Invalid signature', 400);
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return errorResponse('Invalid JSON', 400);
  }

  console.log(`[WEBHOOK] Event: ${payload.event}`);

  // Handle payment_link.paid event
  if (payload.event === 'payment_link.paid') {
    const linkEntity = payload.payload.payment_link?.entity;
    const paymentEntity = payload.payload.payment?.entity;

    if (!linkEntity) {
      return errorResponse('Missing payment_link entity', 400);
    }

    const orderRef = linkEntity.notes?.order_ref;
    if (!orderRef) {
      console.error('No order_ref in payment link notes');
      return jsonResponse({ status: 'ok', message: 'No order_ref found' });
    }

    // Find order
    const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
      .bind(orderRef)
      .first<Order>();

    if (!order) {
      console.error(`Order not found: ${orderRef}`);
      return jsonResponse({ status: 'ok', message: 'Order not found' });
    }

    // Only update if status is 'accepted'
    if (order.status !== 'accepted') {
      console.log(`Order ${orderRef} status is ${order.status}, skipping payment update`);
      return jsonResponse({ status: 'ok', message: 'Order already processed' });
    }

    // Update order to paid
    await env.DB.prepare(
      `UPDATE orders SET
        status = 'paid',
        payment_id = ?,
        payment_status = 'paid',
        paid_at = datetime('now'),
        updated_at = datetime('now')
       WHERE order_ref = ?`
    )
      .bind(paymentEntity?.id || linkEntity.id, orderRef)
      .run();

    // Send confirmation email
    const { results: items } = await env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    )
      .bind(order.id)
      .all<OrderItem>();

    const updatedOrder = {
      ...order,
      status: 'paid' as const,
      payment_id: paymentEntity?.id || linkEntity.id,
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    };

    sendPaymentConfirmEmail(env, updatedOrder, items || []).catch((err) =>
      console.error('Failed to send payment confirmation email:', err)
    );

    console.log(`[WEBHOOK] Order ${orderRef} marked as paid`);
    return jsonResponse({ status: 'ok', message: 'Payment confirmed' });
  }

  // Handle other events gracefully
  return jsonResponse({ status: 'ok', message: `Event ${payload.event} received` });
}