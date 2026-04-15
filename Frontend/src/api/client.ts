const BASE_URL = import.meta.env.VITE_API_URL || '';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  console.log(`[API] ${options.method || 'GET'} ${url}`);

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    console.error(`[API] Network error for ${url}:`, err);
    throw new ApiError(
      `Network error: Cannot reach server at ${BASE_URL}. Check if the backend is running.`,
      0
    );
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message || parsed.detail || parsed.error || message;
    } catch {
      message = errorBody || message;
    }
    console.error(`[API] Error ${response.status}:`, message);
    throw new ApiError(message, response.status);
  }

  return response.json();
}

export const api = {
  getCatalog: () =>
    request<import('../types').CatalogResponse>('/api/catalog'),

  getProduct: (id: string) =>
    request<import('../types').ProductDetailResponse>(`/api/catalog/${id}`),

  placeOrder: (payload: import('../types').OrderPayload) =>
    request<import('../types').OrderResponse>('/api/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyOtp: (payload: import('../types').OtpVerifyPayload) =>
    request<import('../types').OtpVerifyResponse>('/api/order/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resendOtp: (payload: import('../types').ResendOtpPayload) =>
    request<import('../types').ResendOtpResponse>('/api/order/resend-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  trackOrder: (orderRef: string) =>
    request<import('../types').TrackingResponse>(`/api/track/${orderRef}`),
};

export { ApiError };
export default api;