import type { Env, Order, OrderItem } from '../types';
import { baseLayout, deliveryBadge, itemsTable, priceSummary, notesSection } from './baseTemplate';

export function buildPaymentConfirmEmail(env: Env, order: Order, items: OrderItem[]): string {
  const trackUrl = `${env.FRONTEND_URL}/track/${order.order_ref}`;

  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <span style="font-size:48px;">🎉</span>
      <h2 style="color:#34D399; margin:12px 0 4px; font-size:20px;">Payment Confirmed!</h2>
      <p style="color:#A09CB5; margin:0; font-size:13px;">We've received your payment. Your order is being prepared.</p>
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

    ${itemsTable(items)}
    ${priceSummary(order)}
    ${notesSection(order)}

    <div style="text-align:center; margin:24px 0 12px;">
      <a href="${trackUrl}" style="display:inline-block; background:#7C6FE9; color:#FFFFFF; text-decoration:none; font-weight:700; font-size:14px; padding:12px 32px; border-radius:12px;">
        📦 Track Your Order
      </a>
    </div>`;

  return baseLayout(env, `Payment Confirmed — ${order.order_ref}`, body);
}