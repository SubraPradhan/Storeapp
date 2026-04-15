import type { Env, Order, OrderItem, Product, AdminSession } from '../types';
import { jsonResponse, errorResponse, successResponse } from '../utils/response';
import { createOtp } from '../services/otp';
import { verifyOtp as verifyOtpService } from '../services/otp';
import { createPaymentLink } from '../services/razorpay';
import { restoreStock } from '../services/stock';
import {
  sendPaymentLinkEmail,
  sendShippingEmail,
  sendRejectionEmail,
} from '../services/email';

// ─── Admin Login (Email + API Key → OTP) ───
export async function adminLogin(env: Env, request: Request): Promise<Response> {
  let body: { email: string; api_key: string };
  try {
    body = await request.json() as { email: string; api_key: string };
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (body.email !== env.ADMIN_EMAIL || body.api_key !== env.ADMIN_API_KEY) {
    return errorResponse('Invalid credentials.', 403);
  }

  // Generate admin OTP — using 'admin-login' as fake order_ref
  const otp = await createOtp(env, 'admin-login', body.email);

  // In production, send this via email. For now, log it.
  console.log(`[ADMIN OTP] ${otp}`);

  // Optionally send via Resend
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${env.STORE_NAME} <${env.STORE_EMAIL}>`,
        to: [body.email],
        subject: `🔐 Admin OTP — ${env.STORE_NAME}`,
        html: `<div style="font-family:monospace; text-align:center; padding:40px;">
          <h2>Admin Login OTP</h2>
          <div style="font-size:32px; letter-spacing:8px; font-weight:bold; color:#7C6FE9; padding:20px;">${otp}</div>
          <p>Expires in 10 minutes.</p>
        </div>`,
      }),
    });
  } catch (err) {
    console.error('Failed to send admin OTP email:', err);
  }

  return jsonResponse({ message: 'OTP sent to admin email.' });
}

// ─── Admin Verify OTP → Session ───
export async function adminVerifyOtp(env: Env, request: Request): Promise<Response> {
  let body: { email: string; otp: string };
  try {
    body = await request.json() as { email: string; otp: string };
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (body.email !== env.ADMIN_EMAIL) {
    return errorResponse('Invalid email.', 403);
  }

  const result = await verifyOtpService(env, 'admin-login', body.otp);
  if (!result.success) {
    return errorResponse(result.message, 400);
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const session: AdminSession = {
    email: body.email,
    created_at: Date.now(),
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  await env.STORE_KV.put(`admin_session:${sessionId}`, JSON.stringify(session), {
    expirationTtl: 86400,
  });

  return jsonResponse({ session_id: sessionId, expires_in: 86400 });
}

// ─── List Orders ───
export async function listOrders(env: Env, url: URL): Promise<Response> {
  const status = url.searchParams.get('status');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let query = 'SELECT * FROM orders';
  const bindings: string[] = [];

  if (status) {
    query += ' WHERE status = ?';
    bindings.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const stmt = env.DB.prepare(query);
  const bound = bindings.length
    ? stmt.bind(...bindings, limit, offset)
    : stmt.bind(limit, offset);

  const { results } = await bound.all<Order>();

  // Count
  let countQuery = 'SELECT COUNT(*) as total FROM orders';
  const countStmt = status
    ? env.DB.prepare(countQuery + ' WHERE status = ?').bind(status)
    : env.DB.prepare(countQuery);
  const countResult = await countStmt.first<{ total: number }>();

  return jsonResponse({
    orders: results || [],
    total: countResult?.total || 0,
    limit,
    offset,
  });
}

// ─── Get Single Order with Items ───
export async function getOrder(env: Env, orderId: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ? OR order_ref = ?')
    .bind(orderId, orderId)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);

  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  return jsonResponse({ order, items: items || [] });
}

// ─── Accept Order → Razorpay Link ───
export async function acceptOrder(env: Env, request: Request, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);
  if (order.status !== 'verified') {
    return errorResponse(`Cannot accept order with status "${order.status}". Must be "verified".`, 400);
  }

  let adminNotes = '';
  try {
    const body = await request.json() as { notes?: string };
    adminNotes = body.notes || '';
  } catch {
    // No body is fine
  }

  // Create Razorpay payment link
  let paymentLink: { id: string; url: string };
  try {
    paymentLink = await createPaymentLink(env, order);
  } catch (err) {
    console.error('Razorpay error:', err);
    return errorResponse(`Failed to create payment link: ${err instanceof Error ? err.message : 'Unknown error'}`, 500);
  }

  // Update order
  await env.DB.prepare(
    `UPDATE orders SET
      status = 'accepted',
      payment_link_id = ?,
      payment_link_url = ?,
      admin_notes = ?,
      updated_at = datetime('now')
     WHERE order_ref = ?`
  )
    .bind(paymentLink.id, paymentLink.url, adminNotes, orderRef)
    .run();

  // Fetch items for email
  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  // Send payment link email
  const updatedOrder = { ...order, status: 'accepted' as const, payment_link_url: paymentLink.url, admin_notes: adminNotes };
  sendPaymentLinkEmail(env, updatedOrder, items || [], paymentLink.url).catch((err) =>
    console.error('Failed to send payment email:', err)
  );

  return successResponse(
    { payment_link_id: paymentLink.id, payment_link_url: paymentLink.url },
    'Order accepted. Payment link sent to customer.'
  );
}

// ─── Reject Order ───
export async function rejectOrder(env: Env, request: Request, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);
  if (!['verified', 'pending'].includes(order.status)) {
    return errorResponse(`Cannot reject order with status "${order.status}".`, 400);
  }

  let reason = '';
  try {
    const body = await request.json() as { reason?: string };
    reason = body.reason || 'Order could not be fulfilled.';
  } catch {
    reason = 'Order could not be fulfilled.';
  }

  // Restore stock
  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  await restoreStock(
    env,
    (items || []).map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
  );

  // Update order
  await env.DB.prepare(
    `UPDATE orders SET status = 'rejected', rejection_reason = ?, updated_at = datetime('now')
     WHERE order_ref = ?`
  )
    .bind(reason, orderRef)
    .run();

  // Send rejection email
  const updatedOrder = { ...order, status: 'rejected' as const, rejection_reason: reason };
  sendRejectionEmail(env, updatedOrder, items || []).catch((err) =>
    console.error('Failed to send rejection email:', err)
  );

  return successResponse({}, 'Order rejected. Stock restored. Customer notified.');
}

// ─── Ship Order ───
export async function shipOrder(env: Env, request: Request, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);
  if (order.status !== 'paid') {
    return errorResponse(`Cannot ship order with status "${order.status}". Must be "paid".`, 400);
  }

  let shipping = { carrier: '', tracking_id: '', estimated_delivery: '' };
  try {
    const body = await request.json() as {
      carrier?: string;
      tracking_id?: string;
      estimated_delivery?: string;
    };
    shipping.carrier = body.carrier || 'Local Delivery';
    shipping.tracking_id = body.tracking_id || '';
    shipping.estimated_delivery = body.estimated_delivery || '';
  } catch {
    shipping.carrier = 'Local Delivery';
  }

  await env.DB.prepare(
    `UPDATE orders SET
      status = 'shipped',
      shipping_carrier = ?,
      shipping_tracking = ?,
      shipping_estimated_delivery = ?,
      shipped_at = datetime('now'),
      updated_at = datetime('now')
     WHERE order_ref = ?`
  )
    .bind(shipping.carrier, shipping.tracking_id, shipping.estimated_delivery, orderRef)
    .run();

  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  const updatedOrder = {
    ...order,
    status: 'shipped' as const,
    shipping_carrier: shipping.carrier,
    shipping_tracking: shipping.tracking_id,
    shipping_estimated_delivery: shipping.estimated_delivery,
    shipped_at: new Date().toISOString(),
  };

  sendShippingEmail(env, updatedOrder, items || []).catch((err) =>
    console.error('Failed to send shipping email:', err)
  );

  return successResponse({}, 'Order marked as shipped. Customer notified.');
}

// ─── Mark Delivered ───
export async function deliverOrder(env: Env, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);
  if (order.status !== 'shipped') {
    return errorResponse(`Cannot deliver order with status "${order.status}". Must be "shipped".`, 400);
  }

  await env.DB.prepare(
    `UPDATE orders SET status = 'delivered', delivered_at = datetime('now'), updated_at = datetime('now')
     WHERE order_ref = ?`
  )
    .bind(orderRef)
    .run();

  return successResponse({}, 'Order marked as delivered.');
}

// ─── Cancel Order ───
export async function cancelOrder(env: Env, request: Request, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) return errorResponse('Order not found.', 404);
  if (['delivered', 'cancelled'].includes(order.status)) {
    return errorResponse(`Cannot cancel order with status "${order.status}".`, 400);
  }

  // Restore stock
  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  await restoreStock(
    env,
    (items || []).map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
  );

  let reason = '';
  try {
    const body = await request.json() as { reason?: string };
    reason = body.reason || '';
  } catch {
    // ok
  }

  await env.DB.prepare(
    `UPDATE orders SET status = 'cancelled', rejection_reason = ?, updated_at = datetime('now')
     WHERE order_ref = ?`
  )
    .bind(reason, orderRef)
    .run();

  return successResponse({}, 'Order cancelled. Stock restored.');
}

// ─── Product CRUD ───
export async function adminListProducts(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM products ORDER BY category, name'
  ).all<Product>();
  return jsonResponse({ products: results || [] });
}

export async function adminCreateProduct(env: Env, request: Request): Promise<Response> {
  let body: Partial<Product>;
  try {
    body = await request.json() as Partial<Product>;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const required = ['name', 'sku', 'category', 'price'] as const;
  for (const field of required) {
    if (!body[field]) {
      return errorResponse(`${field} is required.`, 400);
    }
  }

  await env.DB.prepare(
    `INSERT INTO products (name, sku, category, emoji, description, price, cost_price,
      original_price, discount_percent, unit, stock_qty, min_qty, max_daily_qty,
      supplier_name, supplier_phone, supplier_email, in_stock, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      body.name!,
      body.sku!,
      body.category!,
      body.emoji || '📦',
      body.description || '',
      body.price!,
      body.cost_price || 0,
      body.original_price || null,
      body.discount_percent || 0,
      body.unit || 'piece',
      body.stock_qty || 0,
      body.min_qty || 1,
      body.max_daily_qty || 50,
      body.supplier_name || '',
      body.supplier_phone || '',
      body.supplier_email || '',
      body.stock_qty && body.stock_qty > 0 ? 1 : 0,
      1
    )
    .run();

  return successResponse({}, 'Product created.');
}

export async function adminUpdateProduct(env: Env, request: Request, productId: string): Promise<Response> {
  let body: Partial<Product>;
  try {
    body = await request.json() as Partial<Product>;
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const existing = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(productId)
    .first<Product>();

  if (!existing) return errorResponse('Product not found.', 404);

  await env.DB.prepare(
    `UPDATE products SET
      name = ?, sku = ?, category = ?, emoji = ?, description = ?,
      price = ?, cost_price = ?, original_price = ?, discount_percent = ?,
      unit = ?, stock_qty = ?, min_qty = ?, max_daily_qty = ?,
      supplier_name = ?, supplier_phone = ?, supplier_email = ?,
      in_stock = ?, active = ?, updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      body.name ?? existing.name,
      body.sku ?? existing.sku,
      body.category ?? existing.category,
      body.emoji ?? existing.emoji,
      body.description ?? existing.description,
      body.price ?? existing.price,
      body.cost_price ?? existing.cost_price,
      body.original_price !== undefined ? body.original_price : existing.original_price,
      body.discount_percent ?? existing.discount_percent,
      body.unit ?? existing.unit,
      body.stock_qty ?? existing.stock_qty,
      body.min_qty ?? existing.min_qty,
      body.max_daily_qty ?? existing.max_daily_qty,
      body.supplier_name ?? existing.supplier_name,
      body.supplier_phone ?? existing.supplier_phone,
      body.supplier_email ?? existing.supplier_email,
      (body.stock_qty ?? existing.stock_qty) > 0 ? (body.in_stock ?? 1) : 0,
      body.active ?? existing.active,
      productId
    )
    .run();

  return successResponse({}, 'Product updated.');
}

export async function adminDeleteProduct(env: Env, productId: string): Promise<Response> {
  await env.DB.prepare("UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?")
    .bind(productId)
    .run();
  return successResponse({}, 'Product deactivated.');
}

// ─── Dashboard Stats ───
export async function dashboardStats(env: Env): Promise<Response> {
  const today = new Date().toISOString().split('T')[0];

  const totalOrders = await env.DB.prepare('SELECT COUNT(*) as c FROM orders').first<{ c: number }>();
  const todayOrders = await env.DB.prepare(
    "SELECT COUNT(*) as c FROM orders WHERE date(created_at) = ?"
  ).bind(today).first<{ c: number }>();
  const pendingOrders = await env.DB.prepare(
    "SELECT COUNT(*) as c FROM orders WHERE status IN ('pending', 'verified')"
  ).first<{ c: number }>();
  const todayRevenue = await env.DB.prepare(
    "SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE status = 'paid' AND date(paid_at) = ?"
  ).bind(today).first<{ r: number }>();
  const totalRevenue = await env.DB.prepare(
    "SELECT COALESCE(SUM(total), 0) as r FROM orders WHERE status IN ('paid', 'shipped', 'delivered')"
  ).first<{ r: number }>();
  const lowStock = await env.DB.prepare(
    'SELECT id, name, emoji, stock_qty FROM products WHERE active = 1 AND stock_qty <= 5 ORDER BY stock_qty ASC'
  ).all<{ id: string; name: string; emoji: string; stock_qty: number }>();

  return jsonResponse({
    total_orders: totalOrders?.c || 0,
    today_orders: todayOrders?.c || 0,
    pending_orders: pendingOrders?.c || 0,
    today_revenue: todayRevenue?.r || 0,
    total_revenue: totalRevenue?.r || 0,
    low_stock_products: lowStock.results || [],
  });
}