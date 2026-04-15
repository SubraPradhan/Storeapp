import type { Env, Order } from '../types';

interface PaymentLinkResponse {
  id: string;
  short_url: string;
  status: string;
}

export async function createPaymentLink(
  env: Env,
  order: Order
): Promise<{ id: string; url: string }> {
  const amountPaise = Math.round(order.total * 100);

  const payload = {
    amount: amountPaise,
    currency: 'INR',
    accept_partial: false,
    description: `${env.STORE_NAME} Order ${order.order_ref}`,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      contact: `+91${order.customer_phone}`,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    notes: {
      order_ref: order.order_ref,
      order_id: order.id,
      store: env.STORE_NAME,
    },
    callback_url: `${env.FRONTEND_URL}/track/${order.order_ref}?payment=success`,
    callback_method: 'get',
    expire_by: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };

  const credentials = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

  const response = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay API error: ${response.status} — ${error}`);
  }

  const data = (await response.json()) as PaymentLinkResponse;
  return { id: data.id, url: data.short_url };
}