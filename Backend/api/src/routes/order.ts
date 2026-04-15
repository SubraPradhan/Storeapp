import type { Env, Order, OrderItem } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { generateOrderRef } from '../utils/orderRef';
import { validateStock, decrementStock } from '../services/stock';
import { createOtp, verifyOtp as verifyOtpService, resendOtp as resendOtpService } from '../services/otp';
import { sendOtpEmail } from '../services/email';

interface PlaceOrderBody {
  items: Array<{ product_id: string; quantity: number }>;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  delivery_type: 'delivery' | 'pickup';
}

export async function placeOrder(env: Env, request: Request): Promise<Response> {
  let body: PlaceOrderBody;
  try {
    body = await request.json() as PlaceOrderBody;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  // Validate input
  const { items, customer, delivery_type } = body;
  if (!customer?.name || !customer?.email || !customer?.phone) {
    return errorResponse('Name, email, and phone are required.', 400);
  }

  if (!/\S+@\S+\.\S+/.test(customer.email)) {
    return errorResponse('Invalid email address.', 400);
  }

  if (!/^\d{10}$/.test(customer.phone)) {
    return errorResponse('Phone must be 10 digits.', 400);
  }

  if (delivery_type === 'delivery' && !customer.address?.trim()) {
    return errorResponse('Address is required for delivery.', 400);
  }

  // Validate stock
  const stockResult = await validateStock(env, items);
  if (!stockResult.valid) {
    return errorResponse(stockResult.errors.join(' '), 400);
  }

  const deliveryCharge = delivery_type === 'delivery' ? parseFloat(env.DELIVERY_CHARGE) : 0;
  const total = stockResult.subtotal + deliveryCharge;
  const orderRef = generateOrderRef();

  // Create order
  const orderResult = await env.DB.prepare(
    `INSERT INTO orders (order_ref, customer_name, customer_email, customer_phone,
      customer_address, customer_notes, status, delivery_type, delivery_charge,
      subtotal, total)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`
  )
    .bind(
      orderRef,
      customer.name.trim(),
      customer.email.trim().toLowerCase(),
      customer.phone.trim(),
      customer.address?.trim() || '',
      customer.notes?.trim() || '',
      delivery_type,
      deliveryCharge,
      stockResult.subtotal,
      total
    )
    .run();

  // Get order ID
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) {
    return errorResponse('Failed to create order.', 500);
  }

  // Insert order items
  for (let i = 0; i < items.length; i++) {
    const product = stockResult.products[i];
    const qty = items[i].quantity;
    await env.DB.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, product_emoji, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(order.id, product.id, product.name, product.emoji, qty, product.price, product.price * qty)
      .run();
  }

  // Decrement stock
  await decrementStock(env, items);

  // Generate OTP
  const otp = await createOtp(env, orderRef, customer.email.trim().toLowerCase());

  // Fetch items for email
  const { results: orderItems } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  // Send OTP email (fire and forget — don't block response)
  sendOtpEmail(env, order, orderItems || [], otp).catch((err) =>
    console.error('Failed to send OTP email:', err)
  );

  return jsonResponse(
    { order_ref: orderRef, message: 'Order placed! Check your email for the OTP.' },
    201
  );
}

export async function verifyOrderOtp(env: Env, request: Request): Promise<Response> {
  let body: { order_ref: string; otp: string };
  try {
    body = await request.json() as { order_ref: string; otp: string };
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { order_ref, otp } = body;
  if (!order_ref || !otp) {
    return errorResponse('order_ref and otp are required.', 400);
  }

  // Check order exists and is pending
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(order_ref)
    .first<Order>();

  if (!order) {
    return errorResponse('Order not found.', 404);
  }

  if (order.status !== 'pending') {
    return errorResponse(`Order is already ${order.status}.`, 400);
  }

  // Verify OTP
  const result = await verifyOtpService(env, order_ref, otp);

  if (!result.success) {
    return errorResponse(result.message, 400);
  }

  // Update order status
  await env.DB.prepare(
    `UPDATE orders SET status = 'verified', updated_at = datetime('now') WHERE order_ref = ?`
  )
    .bind(order_ref)
    .run();

  return jsonResponse({ success: true, message: result.message });
}

export async function resendOrderOtp(env: Env, request: Request): Promise<Response> {
  let body: { order_ref: string };
  try {
    body = await request.json() as { order_ref: string };
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { order_ref } = body;
  if (!order_ref) {
    return errorResponse('order_ref is required.', 400);
  }

  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(order_ref)
    .first<Order>();

  if (!order) {
    return errorResponse('Order not found.', 404);
  }

  if (order.status !== 'pending') {
    return errorResponse('OTP can only be resent for pending orders.', 400);
  }

  const result = await resendOtpService(env, order_ref);

  if (!result.success) {
    return jsonResponse(
      { success: false, message: result.message, cooldown_seconds: result.cooldown_seconds },
      400
    );
  }

  // Send new OTP email
  if (result.otp && result.email) {
    const { results: orderItems } = await env.DB.prepare(
      'SELECT * FROM order_items WHERE order_id = ?'
    )
      .bind(order.id)
      .all<OrderItem>();

    sendOtpEmail(env, order, orderItems || [], result.otp).catch((err) =>
      console.error('Failed to send resend OTP email:', err)
    );
  }

  return jsonResponse({
    success: true,
    message: result.message,
    cooldown_seconds: result.cooldown_seconds,
  });
}