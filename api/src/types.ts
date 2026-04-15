export interface Env {
  DB: D1Database;
  STORE_KV: KVNamespace;
  // Vars
  STORE_NAME: string;
  STORE_TAGLINE: string;
  STORE_EMAIL: string;
  STORE_PHONE: string;
  STORE_ADDRESS: string;
  DELIVERY_CHARGE: string;
  FRONTEND_URL: string;
  // Secrets
  RESEND_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_API_KEY: string;
  WEBHOOK_SECRET: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  emoji: string;
  description: string;
  price: number;
  cost_price: number;
  original_price: number | null;
  discount_percent: number;
  unit: string;
  stock_qty: number;
  min_qty: number;
  max_daily_qty: number;
  supplier_name: string;
  supplier_phone: string;
  supplier_email: string;
  in_stock: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'verified'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_notes: string;
  status: OrderStatus;
  delivery_type: 'delivery' | 'pickup';
  delivery_charge: number;
  subtotal: number;
  total: number;
  payment_link_id: string | null;
  payment_link_url: string | null;
  payment_id: string | null;
  payment_status: string;
  paid_at: string | null;
  ai_decision: string | null;
  ai_reasoning: string | null;
  ai_decided_at: string | null;
  shipping_carrier: string | null;
  shipping_tracking: string | null;
  shipping_estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  admin_notes: string;
  rejection_reason: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_emoji: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OtpData {
  otp: string;
  order_ref: string;
  email: string;
  attempts: number;
  resend_count: number;
  last_resend: number;
  created_at: number;
}

export interface AdminSession {
  email: string;
  created_at: number;
  expires_at: number;
}

export interface RateLimitEntry {
  count: number;
  window_start: number;
}

export interface RequestContext {
  env: Env;
  request: Request;
  params: Record<string, string>;
  url: URL;
  ip: string;
  isAdmin: boolean;
}