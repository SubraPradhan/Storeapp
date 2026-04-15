export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  emoji: string;
  description: string;
  in_stock: boolean;
  unit?: string;
  discount_percent?: number;
  original_price?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CatalogResponse {
  products: Product[];
  categories: string[];
}

export interface ProductDetailResponse {
  product: Product;
  related: Product[];
}

export interface OrderPayload {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  customer: CustomerInfo;
  delivery_type: 'delivery' | 'pickup';
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface OrderResponse {
  order_ref: string;
  message: string;
}

export interface OtpVerifyPayload {
  order_ref: string;
  otp: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
}

export interface ResendOtpPayload {
  order_ref: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
  cooldown_seconds: number;
}

export type OrderStatus =
  | 'pending'
  | 'verified'
  | 'accepted'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface TrackingStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
}

export interface TrackingResponse {
  order_ref: string;
  status: OrderStatus;
  steps: TrackingStep[];
  total: number;
  delivery_type: 'delivery' | 'pickup';
  payment_url?: string;
  shipping_info?: {
    carrier: string;
    tracking_id: string;
    estimated_delivery: string;
  };
  items: Array<{
    product_id: string;
    name: string;
    emoji: string;
    quantity: number;
    price: number;
  }>;
}

export type Language = 'en' | 'hi';