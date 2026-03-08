/**
 * API-Key Validierung fuer eingehende Requests.
 * Der Key wird im Header `x-api-key` erwartet.
 */
export function validateApiKey(request: Request): boolean {
  const key = request.headers.get("x-api-key");
  if (!key || !process.env.LOCAL_AI_API_KEY) return false;
  return key === process.env.LOCAL_AI_API_KEY;
}
