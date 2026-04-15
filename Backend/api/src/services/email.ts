import type { Env, Order, OrderItem } from '../types';
import { buildOtpEmail } from '../emails/otpEmail';
import { buildPaymentLinkEmail } from '../emails/paymentLinkEmail';
import { buildPaymentConfirmEmail } from '../emails/paymentConfirmEmail';
import { buildShippingEmail } from '../emails/shippingEmail';
import { buildRejectionEmail } from '../emails/rejectionEmail';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(env: Env, options: SendEmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${env.STORE_NAME} <${env.STORE_EMAIL}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Resend error: ${response.status} — ${err}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

export async function sendOtpEmail(
  env: Env,
  order: Order,
  items: OrderItem[],
  otp: string
): Promise<boolean> {
  const html = buildOtpEmail(env, order, items, otp);
  return sendEmail(env, {
    to: order.customer_email,
    subject: `🔐 Your OTP for ${env.STORE_NAME} Order ${order.order_ref}`,
    html,
  });
}

export async function sendPaymentLinkEmail(
  env: Env,
  order: Order,
  items: OrderItem[],
  paymentUrl: string
): Promise<boolean> {
  const html = buildPaymentLinkEmail(env, order, items, paymentUrl);
  return sendEmail(env, {
    to: order.customer_email,
    subject: `💳 Payment Link for ${env.STORE_NAME} Order ${order.order_ref}`,
    html,
  });
}

export async function sendPaymentConfirmEmail(
  env: Env,
  order: Order,
  items: OrderItem[]
): Promise<boolean> {
  const html = buildPaymentConfirmEmail(env, order, items);
  return sendEmail(env, {
    to: order.customer_email,
    subject: `✅ Payment Confirmed! ${env.STORE_NAME} Order ${order.order_ref}`,
    html,
  });
}

export async function sendShippingEmail(
  env: Env,
  order: Order,
  items: OrderItem[]
): Promise<boolean> {
  const isPickup = order.delivery_type === 'pickup';
  const subject = isPickup
    ? `🏪 Your order is ready for pickup! ${order.order_ref}`
    : `🚚 Your order has been shipped! ${order.order_ref}`;
  const html = buildShippingEmail(env, order, items);
  return sendEmail(env, { to: order.customer_email, subject, html });
}

export async function sendRejectionEmail(
  env: Env,
  order: Order,
  items: OrderItem[]
): Promise<boolean> {
  const html = buildRejectionEmail(env, order, items);
  return sendEmail(env, {
    to: order.customer_email,
    subject: `❌ Order ${order.order_ref} Update — ${env.STORE_NAME}`,
    html,
  });
}