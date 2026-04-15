import type { Env, Order, OrderItem } from '../types';
import { baseLayout, deliveryBadge, itemsTable, priceSummary, notesSection } from './baseTemplate';

export function buildPaymentLinkEmail(env: Env, order: Order, items: OrderItem[], paymentUrl: string): string {
  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <span style="font-size:48px;">✅</span>
      <h2 style="color:#F1F0F7; margin:12px 0 4px; font-size:20px;">Order Accepted!</h2>
      <p style="color:#A09CB5; margin:0; font-size:13px;">Please complete your payment to proceed</p>
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

    <!-- Pay Button -->
    <div style="text-align:center; margin:24px 0 12px;">
      <a href="${paymentUrl}" style="display:inline-block; background:#34D399; color:#0F0D1A; text-decoration:none; font-weight:700; font-size:16px; padding:14px 40px; border-radius:12px;">
        💳 Pay ₹${order.total} Now
      </a>
    </div>

    <p style="color:#6B6784; font-size:11px; text-align:center;">
      ⏳ This payment link expires in 1 hour.<br>
      You can also pay at: <a href="${paymentUrl}" style="color:#7C6FE9;">${paymentUrl}</a>
    </p>`;

  return baseLayout(env, `Payment for ${order.order_ref}`, body);
}