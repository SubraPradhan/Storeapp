export function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: true, message }, status);
}

export function successResponse(data: unknown, message = 'Success'): Response {
  return jsonResponse({ error: false, message, ...data });
}