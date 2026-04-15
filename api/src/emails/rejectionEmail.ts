import type { Env, Order, OrderItem } from '../types';
import { baseLayout, deliveryBadge, itemsTable, priceSummary } from './baseTemplate';

export function buildRejectionEmail(env: Env, order: Order, items: OrderItem[]): string {
  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <span style="font-size:48px;">😔</span>
      <h2 style="color:#F1F0F7; margin:12px 0 4px; font-size:20px;">Order Update</h2>
      <p style="color:#A09CB5; margin:0; font-size:13px;">We're sorry — we couldn't process your order at this time.</p>
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

    ${order.rejection_reason ? `
    <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; padding:16px; margin-bottom:16px;">
      <p style="margin:0; color:#A09CB5; font-size:11px; text-transform:uppercase;">Reason</p>
      <p style="margin:6px 0 0; color:#F1F0F7; font-size:14px;">${order.rejection_reason}</p>
    </div>` : ''}

    ${itemsTable(items)}
    ${priceSummary(order)}

    <p style="color:#A09CB5; font-size:13px; margin-top:16px; text-align:center;">
      No payment has been charged. You can place a new order anytime at
      <a href="${env.FRONTEND_URL}" style="color:#7C6FE9;">${env.STORE_NAME}</a>.
    </p>

    <p style="color:#6B6784; font-size:12px; margin-top:12px; text-align:center;">
      Questions? Contact us at 📞 ${env.STORE_PHONE} or 📧 ${env.STORE_EMAIL}
    </p>`;

  return baseLayout(env, `Order Update — ${order.order_ref}`, body);
}