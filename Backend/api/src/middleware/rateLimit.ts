import type { Env, RateLimitEntry } from '../types';
import { errorResponse } from '../utils/response';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const ROUTE_LIMITS: Record<string, RateLimitConfig> = {
  'POST:/api/order': { windowMs: 60_000, maxRequests: 5 },
  'POST:/api/order/verify': { windowMs: 60_000, maxRequests: 10 },
  'POST:/api/order/resend-otp': { windowMs: 60_000, maxRequests: 3 },
  'GET:/api/catalog': { windowMs: 10_000, maxRequests: 30 },
  'GET:/api/track': { windowMs: 10_000, maxRequests: 20 },
  DEFAULT: { windowMs: 10_000, maxRequests: 50 },
};

function getRouteKey(method: string, pathname: string): string {
  // Normalize: /api/catalog/abc → /api/catalog
  const segments = pathname.split('/').slice(0, 4);
  const normalized = segments.join('/');
  const key = `${method}:${normalized}`;
  return ROUTE_LIMITS[key] ? key : 'DEFAULT';
}

export async function checkRateLimit(
  env: Env,
  ip: string,
  method: string,
  pathname: string
): Promise<Response | null> {
  const routeKey = getRouteKey(method, pathname);
  const config = ROUTE_LIMITS[routeKey];
  const kvKey = `rl:${ip}:${routeKey}`;

  try {
    const stored = await env.STORE_KV.get(kvKey, 'json') as RateLimitEntry | null;
    const now = Date.now();

    if (!stored || now - stored.window_start > config.windowMs) {
      // New window
      await env.STORE_KV.put(
        kvKey,
        JSON.stringify({ count: 1, window_start: now }),
        { expirationTtl: Math.ceil(config.windowMs / 1000) + 5 }
      );
      return null;
    }

    if (stored.count >= config.maxRequests) {
      const retryAfter = Math.ceil((stored.window_start + config.windowMs - now) / 1000);
      return errorResponse(`Rate limit exceeded. Try again in ${retryAfter}s`, 429);
    }

    // Increment
    await env.STORE_KV.put(
      kvKey,
      JSON.stringify({ count: stored.count + 1, window_start: stored.window_start }),
      { expirationTtl: Math.ceil((stored.window_start + config.windowMs - now) / 1000) + 5 }
    );
    return null;
  } catch {
    // If KV fails, don't block the request
    return null;
  }
}