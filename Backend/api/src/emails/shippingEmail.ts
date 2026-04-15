import type { Env, Order, OrderItem } from '../types';
import { baseLayout, deliveryBadge, itemsTable, priceSummary, notesSection } from './baseTemplate';

export function buildShippingEmail(env: Env, order: Order, items: OrderItem[]): string {
  const isPickup = order.delivery_type === 'pickup';
  const trackUrl = `${env.FRONTEND_URL}/track/${order.order_ref}`;

  const headerEmoji = isPickup ? '🏪' : '🚚';
  const headerTitle = isPickup ? 'Ready for Pickup!' : 'Your Order is Shipped!';
  const headerDesc = isPickup
    ? `Your order is ready! Please pick it up from our store.`
    : `Your order is on its way to you.`;

  const shippingSection = !isPickup && order.shipping_carrier
    ? `<div style="background:rgba(124,111,233,0.08); border-radius:12px; padding:16px; margin:16px 0;">
        <p style="margin:0 0 8px; color:#A09CB5; font-size:11px; text-transform:uppercase;">🚚 Shipping Details</p>
        <table style="width:100%;">
          <tr>
            <td style="color:#A09CB5; font-size:13px; padding:4px 0;">Carrier</td>
            <td style="color:#F1F0F7; font-size:13px; font-weight:600; text-align:right;">${order.shipping_carrier}</td>
          </tr>
          ${order.shipping_tracking ? `<tr>
            <td style="color:#A09CB5; font-size:13px; padding:4px 0;">Tracking ID</td>
            <td style="color:#7C6FE9; font-size:13px; font-weight:600; text-align:right; font-family:monospace;">${order.shipping_tracking}</td>
          </tr>` : ''}
          ${order.shipping_estimated_delivery ? `<tr>
            <td style="color:#A09CB5; font-size:13px; padding:4px 0;">Est. Delivery</td>
            <td style="color:#34D399; font-size:13px; font-weight:600; text-align:right;">${new Date(order.shipping_estimated_delivery).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
          </tr>` : ''}
        </table>
      </div>`
    : isPickup
    ? `<div style="background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.3); border-radius:12px; padding:16px; margin:16px 0; text-align:center;">
        <p style="margin:0; color:#34D399; font-size:14px; font-weight:600;">📍 Pickup Location</p>
        <p style="margin:6px 0 0; color:#F1F0F7; font-size:13px;">${env.STORE_ADDRESS}</p>
        <p style="margin:4px 0 0; color:#A09CB5; font-size:12px;">📞 ${env.STORE_PHONE}</p>
      </div>`
    : '';

  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <span style="font-size:48px;">${headerEmoji}</span>
      <h2 style="color:#F1F0F7; margin:12px 0 4px; font-size:20px;">${headerTitle}</h2>
      <p style="color:#A09CB5; margin:0; font-size:13px;">${headerDesc}</p>
    </div>

    <div style="margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <p style="margin:0; color:#A09CB5; font-size:11px;">ORDER REF</p>
          <p style="margin:2px 0 0; color:#7C6FE9; font-size:16px; font-weight:700; font-family:monospace;">${order.order_ref}</p>
        </div>
        ${deliveryBadge(order)}
      </div>
    </div>

    ${shippingSection}
    ${itemsTable(items)}
    ${priceSummary(order)}
    ${notesSection(order)}

    <div style="text-align:center; margin:24px 0 12px;">
      <a href="${trackUrl}" style="display:inline-block; background:#7C6FE9; color:#FFFFFF; text-decoration:none; font-weight:700; font-size:14px; padding:12px 32px; border-radius:12px;">
        📦 Track Your Order
      </a>
    </div>`;

  return baseLayout(env, `${isPickup ? 'Ready for Pickup' : 'Order Shipped'} — ${order.order_ref}`, body);
}