import type { Env, Order, OrderItem } from '../types';

export function baseLayout(env: Env, title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#0F0D1A; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px; margin:0 auto; padding:20px;">
    <!-- Header -->
    <div style="text-align:center; padding:24px 0;">
      <span style="font-size:32px;">🛒</span>
      <h1 style="margin:8px 0 0; color:#7C6FE9; font-size:24px;">${env.STORE_NAME}</h1>
      <p style="margin:2px 0 0; color:#A09CB5; font-size:12px;">${env.STORE_TAGLINE}</p>
    </div>

    <!-- Body Card -->
    <div style="background:rgba(30,27,46,0.95); border:1px solid rgba(124,111,233,0.2); border-radius:16px; padding:28px; margin-bottom:16px;">
      ${bodyContent}
    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:16px 0; color:#6B6784; font-size:11px;">
      <p style="margin:0;">${env.STORE_NAME} — ${env.STORE_TAGLINE}</p>
      <p style="margin:4px 0 0;">${env.STORE_ADDRESS}</p>
      <p style="margin:4px 0 0;">📞 ${env.STORE_PHONE} | 📧 ${env.STORE_EMAIL}</p>
    </div>
  </div>
</body>
</html>`;
}

export function deliveryBadge(order: Order): string {
  const isPickup = order.delivery_type === 'pickup';
  const bg = isPickup ? '#34D399' : '#7C6FE9';
  const label = isPickup ? '🏪 Self Pickup' : '🚚 Delivery';
  return `<span style="display:inline-block; background:${bg}; color:#0F0D1A; font-size:11px; font-weight:700; padding:4px 10px; border-radius:8px;">${label}</span>`;
}

export function itemsTable(items: OrderItem[]): string {
  let rows = '';
  for (const item of items) {
    rows += `
    <tr>
      <td style="padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.1);">
        <span style="font-size:18px; margin-right:6px;">${item.product_emoji}</span>
        <span style="color:#F1F0F7; font-size:14px;">${item.product_name}</span>
      </td>
      <td style="padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.1); text-align:center; color:#A09CB5; font-size:13px;">
        ×${item.quantity}
      </td>
      <td style="padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.1); text-align:right; color:#F1F0F7; font-size:14px; font-weight:600;">
        ₹${item.total_price}
      </td>
    </tr>`;
  }

  return `<table style="width:100%; border-collapse:collapse;">
    <thead>
      <tr>
        <th style="text-align:left; padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.2); color:#A09CB5; font-size:11px; text-transform:uppercase;">Item</th>
        <th style="text-align:center; padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.2); color:#A09CB5; font-size:11px; text-transform:uppercase;">Qty</th>
        <th style="text-align:right; padding:8px 0; border-bottom:1px solid rgba(124,111,233,0.2); color:#A09CB5; font-size:11px; text-transform:uppercase;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function priceSummary(order: Order): string {
  return `<div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(124,111,233,0.2);">
    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
      <span style="color:#A09CB5; font-size:13px;">Subtotal</span>
      <span style="color:#F1F0F7; font-size:13px;">₹${order.subtotal}</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
      <span style="color:#A09CB5; font-size:13px;">Delivery</span>
      <span style="color:${order.delivery_charge === 0 ? '#34D399' : '#F1F0F7'}; font-size:13px;">
        ${order.delivery_charge === 0 ? 'FREE' : '₹' + order.delivery_charge}
      </span>
    </div>
    <div style="display:flex; justify-content:space-between; padding-top:8px; border-top:1px solid rgba(124,111,233,0.2);">
      <span style="color:#F1F0F7; font-size:16px; font-weight:700;">Total</span>
      <span style="color:#7C6FE9; font-size:18px; font-weight:700;">₹${order.total}</span>
    </div>
  </div>`;
}

export function notesSection(order: Order): string {
  if (!order.customer_notes) return '';
  return `<div style="margin-top:12px; padding:10px; background:rgba(124,111,233,0.08); border-radius:8px;">
    <p style="margin:0; color:#A09CB5; font-size:11px; text-transform:uppercase;">📝 Customer Notes</p>
    <p style="margin:4px 0 0; color:#F1F0F7; font-size:13px;">${order.customer_notes}</p>
  </div>`;
}