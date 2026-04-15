import { useState } from 'react';
import api from '@/api/client';
import type {
  OrderPayload,
  OrderResponse,
  OtpVerifyPayload,
  OtpVerifyResponse,
  ResendOtpResponse,
} from '@/types';

export function useOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async (
    payload: OrderPayload
  ): Promise<OrderResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.placeOrder(payload);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (
    payload: OtpVerifyPayload
  ): Promise<OtpVerifyResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.verifyOtp(payload);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'OTP verification failed';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (
    orderRef: string
  ): Promise<ResendOtpResponse | null> => {
    setError(null);
    try {
      const data = await api.resendOtp({ order_ref: orderRef });
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend OTP';
      setError(msg);
      return null;
    }
  };

  return { placeOrder, verifyOtp, resendOtp, loading, error, setError };
}