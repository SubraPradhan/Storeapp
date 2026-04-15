import type { Env, Order, OrderItem, OrderStatus } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';

interface TrackingStep {
  status: OrderStatus;
  label: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
}

function buildSteps(order: Order): TrackingStep[] {
  const statusFlow: OrderStatus[] = ['pending', 'verified', 'accepted', 'paid', 'shipped', 'delivered'];

  const currentIdx = statusFlow.indexOf(order.status as OrderStatus);

  // If rejected or cancelled, show a different flow
  if (order.status === 'rejected' || order.status === 'cancelled') {
    const stepsBeforeReject: TrackingStep[] = [];
    for (const s of statusFlow) {
      const idx = statusFlow.indexOf(s);
      if (idx <= 1) {
        stepsBeforeReject.push({
          status: s,
          label: s.charAt(0).toUpperCase() + s.slice(1),
          timestamp: s === 'pending' ? order.created_at : null,
          completed: true,
          active: false,
        });
      }
    }
    stepsBeforeReject.push({
      status: order.status as OrderStatus,
      label: order.status === 'rejected' ? 'Rejected' : 'Cancelled',
      timestamp: order.updated_at,
      completed: false,
      active: true,
    });
    return stepsBeforeReject;
  }

  return statusFlow.map((s, idx) => {
    let timestamp: string | null = null;
    if (s === 'pending') timestamp = order.created_at;
    else if (s === 'paid' && order.paid_at) timestamp = order.paid_at;
    else if (s === 'shipped' && order.shipped_at) timestamp = order.shipped_at;
    else if (s === 'delivered' && order.delivered_at) timestamp = order.delivered_at;
    else if (idx <= currentIdx) timestamp = order.updated_at;

    return {
      status: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
      timestamp: idx <= currentIdx ? timestamp : null,
      completed: idx < currentIdx,
      active: idx === currentIdx,
    };
  });
}

export async function trackOrder(env: Env, orderRef: string): Promise<Response> {
  const order = await env.DB.prepare('SELECT * FROM orders WHERE order_ref = ?')
    .bind(orderRef)
    .first<Order>();

  if (!order) {
    return errorResponse('Order not found.', 404);
  }

  const { results: items } = await env.DB.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  )
    .bind(order.id)
    .all<OrderItem>();

  const steps = buildSteps(order);

  const response: Record<string, unknown> = {
    order_ref: order.order_ref,
    status: order.status,
    steps,
    total: order.total,
    subtotal: order.subtotal,
    delivery_charge: order.delivery_charge,
    delivery_type: order.delivery_type,
    customer_name: order.customer_name,
    items: (items || []).map((i) => ({
      product_id: i.product_id,
      name: i.product_name,
      emoji: i.product_emoji,
      quantity: i.quantity,
      price: i.unit_price,
    })),
  };

  // Payment URL if accepted
  if (order.status === 'accepted' && order.payment_link_url) {
    response.payment_url = order.payment_link_url;
  }

  // Shipping info if shipped or delivered
  if (
    (order.status === 'shipped' || order.status === 'delivered') &&
    order.delivery_type === 'delivery'
  ) {
    response.shipping_info = {
      carrier: order.shipping_carrier || 'Local Delivery',
      tracking_id: order.shipping_tracking || '',
      estimated_delivery: order.shipping_estimated_delivery || '',
    };
  }

  return jsonResponse(response);
}