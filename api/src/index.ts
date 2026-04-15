import type { Env } from './types';
import { Router } from './router';
import { corsHeaders, handleOptions } from './middleware/cors';
import { checkRateLimit } from './middleware/rateLimit';
import { verifyAdmin } from './middleware/adminAuth';
import { jsonResponse, errorResponse } from './utils/response';

// Route handlers
import { getCatalog, getProduct } from './routes/catalog';
import { placeOrder, verifyOrderOtp, resendOrderOtp } from './routes/order';
import { trackOrder } from './routes/track';
import {
  adminLogin,
  adminVerifyOtp,
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  listOrders,
  getOrder,
  acceptOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
  dashboardStats,
} from './routes/admin';
import { handleRazorpayWebhook } from './routes/webhook';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(env);
    }

    // Health check
    if (pathname === '/health' || pathname === '/') {
      return jsonResponse({
        status: 'ok',
        store: env.STORE_NAME,
        tagline: env.STORE_TAGLINE,
        timestamp: new Date().toISOString(),
      });
    }

    // ─── Determine if admin route ───
    const isAdminRoute = pathname.startsWith('/api/admin');
    const isWebhookRoute = pathname === '/api/webhook/razorpay';

    // ─── Rate limiting (skip for admin and webhooks) ───
    if (!isAdminRoute && !isWebhookRoute) {
      const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
      const rateLimitResponse = await checkRateLimit(env, ip, method, pathname);
      if (rateLimitResponse) {
        return addCors(rateLimitResponse, env);
      }
    }

    // ─── Admin auth ───
    if (isAdminRoute && !pathname.endsWith('/login') && !pathname.endsWith('/verify-otp')) {
      const auth = await verifyAdmin(request, env);
      if (!auth.authenticated) {
        return addCors(auth.response!, env);
      }
    }

    // ─── Build Router ───
    const router = new Router();

    // Public: Catalog
    router.get('/api/catalog', async () => getCatalog(env));
    router.get('/api/catalog/:id', async (params) => getProduct(env, params.id));

    // Public: Orders
    router.post('/api/order', async () => placeOrder(env, request));
    router.post('/api/order/verify', async () => verifyOrderOtp(env, request));
    router.post('/api/order/resend-otp', async () => resendOrderOtp(env, request));

    // Public: Tracking
    router.get('/api/track/:orderRef', async (params) => trackOrder(env, params.orderRef));

    // Webhook
    router.post('/api/webhook/razorpay', async () => handleRazorpayWebhook(env, request));

    // Admin: Auth
    router.post('/api/admin/login', async () => adminLogin(env, request));
    router.post('/api/admin/verify-otp', async () => adminVerifyOtp(env, request));

    // Admin: Dashboard
    router.get('/api/admin/dashboard', async () => dashboardStats(env));

    // Admin: Products
    router.get('/api/admin/products', async () => adminListProducts(env));
    router.post('/api/admin/products', async () => adminCreateProduct(env, request));
    router.put('/api/admin/products/:id', async (params) => adminUpdateProduct(env, request, params.id));
    router.delete('/api/admin/products/:id', async (params) => adminDeleteProduct(env, params.id));

    // Admin: Orders
    router.get('/api/admin/orders', async () => listOrders(env, url));
    router.get('/api/admin/orders/:id', async (params) => getOrder(env, params.id));
    router.post('/api/admin/orders/:orderRef/accept', async (params) => acceptOrder(env, request, params.orderRef));
    router.post('/api/admin/orders/:orderRef/reject', async (params) => rejectOrder(env, request, params.orderRef));
    router.post('/api/admin/orders/:orderRef/ship', async (params) => shipOrder(env, request, params.orderRef));
    router.post('/api/admin/orders/:orderRef/deliver', async (params) => deliverOrder(env, params.orderRef));
    router.post('/api/admin/orders/:orderRef/cancel', async (params) => cancelOrder(env, request, params.orderRef));

    // ─── Match Route ───
    const match = router.match(method, pathname);

    if (!match) {
      return addCors(errorResponse('Not found', 404), env);
    }

    try {
      const response = await match.handler(match.params);
      return addCors(response, env);
    } catch (err) {
      console.error('Unhandled error:', err);
      const message = err instanceof Error ? err.message : 'Internal server error';
      return addCors(errorResponse(message, 500), env);
    }
  },
};

function addCors(response: Response, env: Env): Response {
  const headers = corsHeaders(env);
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
}