import type { Env } from '../types';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

export function corsHeaders(env: Env, request?: Request): Record<string, string> {
  // In production, use FRONTEND_URL. In dev, allow localhost.
  let origin = env.FRONTEND_URL || '*';

  if (request) {
    const requestOrigin = request.headers.get('Origin');
    if (requestOrigin) {
      // Check if it's a known allowed origin or matches FRONTEND_URL
      if (
        ALLOWED_ORIGINS.includes(requestOrigin) ||
        requestOrigin === env.FRONTEND_URL
      ) {
        origin = requestOrigin;
      }
    }
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key, X-Admin-Session',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleOptions(env: Env, request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env, request),
  });
}