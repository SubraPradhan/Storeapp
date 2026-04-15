import type { Env } from '../types';

export function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Key, X-Admin-Session',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleOptions(env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env),
  });
}