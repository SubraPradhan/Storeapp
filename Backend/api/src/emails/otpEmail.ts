import type { Env, Order, OrderItem } from '../types';
import { baseLayout, deliveryBadge, itemsTable, priceSummary, notesSection } from './baseTemplate';

export function buildOtpEmail(env: Env, order: Order, items: OrderItem[], otp: string): string {
  const body = `
    <div style="text-align:center; margin-bottom:20px;">
      <span style="font-size:48px;">🔐</span>
      <h2 style="color:#F1F0F7; margin:12px 0 4px; font-size:20px;">Verify Your Order</h2>
      <p style="color:#A09CB5; margin:0; font-size:13px;">Enter this code to confirm your order</p>
    </div>

    <!-- OTP Code -->
    <div style="text-align:center; margin:24px 0;">
      <div style="display:inline-block; background:#1E1B2E; border:2px solid #7C6FE9; border-radius:12px; padding:16px 32px; letter-spacing:12px;">
        <span style="font-size:32px; font-weight:800; color:#7C6FE9; font-family:monospace;">${otp}</span>
      </div>
      <p style="color:#6B6784; font-size:11px; margin-top:8px;">⏳ This code expires in 10 minutes</p>
    </div>

    <!-- Order Info -->
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

    <p style="color:#6B6784; font-size:11px; margin-top:16px; text-align:center;">
      If you did not place this order, please ignore this email.
    </p>`;

  return baseLayout(env, `OTP for ${order.order_ref}`, body);
}