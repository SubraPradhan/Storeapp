import type { Env, OtpData } from '../types';

const OTP_TTL = 600; // 10 minutes
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;
const RESEND_COOLDOWN = 60; // seconds

function generateOtp(): string {
  const array = new Uint8Array(3);
  crypto.getRandomValues(array);
  const num = ((array[0] << 16) | (array[1] << 8) | array[2]) % 900000 + 100000;
  return num.toString();
}

export async function createOtp(
  env: Env,
  orderRef: string,
  email: string
): Promise<string> {
  const otp = generateOtp();
  const data: OtpData = {
    otp,
    order_ref: orderRef,
    email,
    attempts: 0,
    resend_count: 0,
    last_resend: Date.now(),
    created_at: Date.now(),
  };

  await env.STORE_KV.put(`otp:${orderRef}`, JSON.stringify(data), {
    expirationTtl: OTP_TTL,
  });

  return otp;
}

export async function verifyOtp(
  env: Env,
  orderRef: string,
  inputOtp: string
): Promise<{ success: boolean; message: string }> {
  const stored = await env.STORE_KV.get(`otp:${orderRef}`, 'json') as OtpData | null;

  if (!stored) {
    return { success: false, message: 'OTP expired or not found. Please place the order again.' };
  }

  if (stored.attempts >= MAX_ATTEMPTS) {
    await env.STORE_KV.delete(`otp:${orderRef}`);
    return { success: false, message: 'Too many failed attempts. OTP invalidated.' };
  }

  if (stored.otp !== inputOtp) {
    stored.attempts += 1;
    const remaining = MAX_ATTEMPTS - stored.attempts;
    await env.STORE_KV.put(`otp:${orderRef}`, JSON.stringify(stored), {
      expirationTtl: OTP_TTL,
    });
    return {
      success: false,
      message: `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Valid — delete OTP
  await env.STORE_KV.delete(`otp:${orderRef}`);
  return { success: true, message: 'OTP verified successfully!' };
}

export async function resendOtp(
  env: Env,
  orderRef: string
): Promise<{ success: boolean; message: string; otp?: string; cooldown_seconds: number; email?: string }> {
  const stored = await env.STORE_KV.get(`otp:${orderRef}`, 'json') as OtpData | null;

  if (!stored) {
    return {
      success: false,
      message: 'OTP session expired. Please place the order again.',
      cooldown_seconds: 0,
    };
  }

  if (stored.resend_count >= MAX_RESENDS) {
    return {
      success: false,
      message: 'Maximum resend limit reached.',
      cooldown_seconds: 0,
    };
  }

  const elapsed = (Date.now() - stored.last_resend) / 1000;
  if (elapsed < RESEND_COOLDOWN) {
    const remaining = Math.ceil(RESEND_COOLDOWN - elapsed);
    return {
      success: false,
      message: `Please wait ${remaining} seconds before resending.`,
      cooldown_seconds: remaining,
    };
  }

  const newOtp = generateOtp();
  stored.otp = newOtp;
  stored.attempts = 0;
  stored.resend_count += 1;
  stored.last_resend = Date.now();

  await env.STORE_KV.put(`otp:${orderRef}`, JSON.stringify(stored), {
    expirationTtl: OTP_TTL,
  });

  return {
    success: true,
    message: 'OTP resent successfully.',
    otp: newOtp,
    cooldown_seconds: RESEND_COOLDOWN,
    email: stored.email,
  };
}