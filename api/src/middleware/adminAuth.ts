import type { Env, AdminSession } from '../types';
import { errorResponse } from '../utils/response';

export async function verifyAdmin(
  request: Request,
  env: Env
): Promise<{ authenticated: boolean; response?: Response }> {
  const sessionId = request.headers.get('X-Admin-Session');

  if (sessionId) {
    // Session-based auth
    const session = await env.STORE_KV.get(`admin_session:${sessionId}`, 'json') as AdminSession | null;
    if (session && session.expires_at > Date.now()) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      response: errorResponse('Session expired, please login again', 401),
    };
  }

  // API key auth
  const apiKey = request.headers.get('X-Admin-Key');
  if (!apiKey) {
    return {
      authenticated: false,
      response: errorResponse('Authentication required. Provide X-Admin-Session or X-Admin-Key header.', 401),
    };
  }

  if (apiKey !== env.ADMIN_API_KEY) {
    return {
      authenticated: false,
      response: errorResponse('Invalid API key', 403),
    };
  }

  return { authenticated: true };
}